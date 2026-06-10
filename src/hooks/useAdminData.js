import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";
import { useAuth } from "./useAuth";
import { usePlans } from "./usePlans";
import { useToast } from "./useToast";
import { mapProperty } from "./useProperties";

export const useAdminData = () => {
  const { user: currentUser } = useAuth();
  const { assignPlan, usePlansQuery } = usePlans();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [selectedUser, setSelectedUser] = useState(null);

  // Estados de búsqueda locales
  const [userSearch, setUserSearch] = useState("");
  const [propertySearch, setPropertySearch] = useState("");
  const [leadSearch, setLeadSearch] = useState("");

  // Queries con React Query
  const plansQuery = usePlansQuery();

  const propertiesQuery = useQuery({
    queryKey: ["admin_properties"],
    queryFn: async () => {
      const propsRes = await api.get("/admin/properties");
      return (propsRes.data || []).map(p => mapProperty(p));
    }
  });

  const leadsQuery = useQuery({
    queryKey: ["admin_leads"],
    queryFn: async () => {
      const leadsRes = await api.get("/leads");
      return (leadsRes.data || []).map(l => ({
        id: l.id,
        name: l.name,
        email: l.email,
        phone: l.phone,
        message: l.message,
        status: l.status,
        createdAt: l.created_at,
        property: l.property ? mapProperty(l.property) : null
      }));
    }
  });

  const usersQuery = useQuery({
    queryKey: ["admin_users"],
    queryFn: async () => {
      const usersRes = await api.get("/users");
      return usersRes.data || [];
    }
  });

  // Mutación para asignar plan
  const assignPlanMutation = useMutation({
    mutationFn: async ({ userId, planId }) => {
      return assignPlan(planId);
    },
    onSuccess: (data, variables) => {
      const planName = plansQuery.data?.find(p => Number(p.id) === Number(variables.planId))?.name;
      setSelectedUser(null);
      toast.success(`Plan "${planName || 'asignado'}" asignado correctamente.`);
      queryClient.invalidateQueries({ queryKey: ["admin_properties"] });
      queryClient.invalidateQueries({ queryKey: ["admin_leads"] });
    },
    onError: () => {
      toast.error("Error al asignar el plan.");
    }
  });

  const handleAssignPlan = async (userId, planId) => {
    assignPlanMutation.mutate({ userId, planId });
  };

  // Mutación para eliminar propiedad
  const deletePropertyMutation = useMutation({
    mutationFn: async (id) => {
      return api.delete(`/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Propiedad eliminada correctamente.");
    },
    onError: () => {
      toast.error("Error al eliminar la propiedad.");
    }
  });

  const deleteProperty = async (id) => {
    deletePropertyMutation.mutate(id);
  };

  // Filtrado local
  const users = usersQuery.data || [];
  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredProperties = (propertiesQuery.data || []).filter(p =>
    (p.title || '').toLowerCase().includes(propertySearch.toLowerCase()) ||
    (p.location || '').toLowerCase().includes(propertySearch.toLowerCase())
  );

  const filteredLeads = (leadsQuery.data || []).filter(l =>
    (l.name || '').toLowerCase().includes(leadSearch.toLowerCase()) ||
    (l.email || '').toLowerCase().includes(leadSearch.toLowerCase()) ||
    (l.message || '').toLowerCase().includes(leadSearch.toLowerCase())
  );

  const loading = 
    plansQuery.isLoading || 
    propertiesQuery.isLoading || 
    leadsQuery.isLoading ||
    usersQuery.isLoading;

  return {
    currentUser,
    plans: plansQuery.data || [],
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
    handleAssignPlan,
    deleteProperty,
    usersCount: users.length,
    propertiesCount: (propertiesQuery.data || []).length,
    leadsCount: (leadsQuery.data || []).length,
    subscriptionsCount: users.filter(u => u.subscription).length
  };
};
