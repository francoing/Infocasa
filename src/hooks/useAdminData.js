import { useState, useEffect, useCallback } from "react";
import { api } from "../api/api";
import { useAuth } from "./useAuth";
import { usePlans } from "./usePlans";
import { useToast } from "./useToast";

export const useAdminData = () => {
  const { user: currentUser } = useAuth();
  const { getPlans, assignPlan } = usePlans();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  // Search states
  const [userSearch, setUserSearch] = useState("");
  const [propertySearch, setPropertySearch] = useState("");
  const [leadSearch, setLeadSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [allUsers, allProps, allLeads, allPlans] = await Promise.all([
        api.get("/users"),
        api.get("/properties"),
        api.get("/leads"),
        getPlans()
      ]);

      // Enriquecer usuarios con sus planes activos
      const usersWithPlans = await Promise.all(allUsers.map(async (u) => {
        const userPlans = await api.get(`/userPlans?userId=${u.id}`);
        if (userPlans.length > 0) {
          const planDetails = allPlans.find(p => p.id === userPlans[userPlans.length - 1].planId);
          return { ...u, currentPlan: planDetails?.name || 'Ninguno' };
        }
        return { ...u, currentPlan: 'Ninguno' };
      }));

      setUsers(usersWithPlans);
      setProperties(allProps);
      setLeads(allLeads);
      setPlans(allPlans);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      toast.error("Error al cargar los datos de administración.");
    } finally {
      setLoading(false);
    }
  }, [getPlans, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/users/${userId}`, { active: !currentStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: !currentStatus } : u));
      toast.success(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} con éxito.`);
    } catch (err) {
      toast.error("Error al actualizar el estado del usuario.");
    }
  };

  const handleAssignPlan = async (userId, planId) => {
    try {
      await assignPlan(userId, planId);
      const planName = plans.find(p => p.id === planId).name;
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, currentPlan: planName } : u));
      setSelectedUser(null);
      toast.success("Plan asignado correctamente.");
    } catch (err) {
      toast.error("Error al asignar el plan.");
    }
  };

  const deleteProperty = async (id) => {
    try {
      await api.delete(`/properties/${id}`);
      setProperties(prev => prev.filter(p => p.id !== id));
      toast.success("Propiedad eliminada correctamente.");
    } catch (err) {
      toast.error("Error al eliminar la propiedad.");
    }
  };

  const toggleFeatured = async (id, currentFeatured) => {
    try {
      await api.patch(`/properties/${id}`, { featured: !currentFeatured });
      setProperties(prev => prev.map(p => p.id === id ? { ...p, featured: !currentFeatured } : p));
      toast.success(`Propiedad ${!currentFeatured ? 'destacada' : 'desmarcada'} con éxito.`);
    } catch (err) {
      toast.error("Error al actualizar la propiedad destacada.");
    }
  };

  // Filtered data helpers
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(propertySearch.toLowerCase()) || 
    p.location.toLowerCase().includes(propertySearch.toLowerCase())
  );

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(leadSearch.toLowerCase()) || 
    l.email.toLowerCase().includes(leadSearch.toLowerCase()) ||
    l.message.toLowerCase().includes(leadSearch.toLowerCase())
  );

  return {
    currentUser,
    plans,
    loading,
    selectedUser,
    setSelectedUser,
    userSearch,
    setUserSearch,
    propertySearch,
    setPropertySearch,
    leadSearch,
    setLeadSearch,
    filteredUsers,
    filteredProperties,
    filteredLeads,
    toggleUserStatus,
    handleAssignPlan,
    deleteProperty,
    toggleFeatured,
    usersCount: users.length,
    propertiesCount: properties.length,
    leadsCount: leads.length,
    subscriptionsCount: users.filter(u => u.currentPlan !== 'Básico' && u.currentPlan !== 'Ninguno').length
  };
};
