import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";
import { useAuth } from "./useAuth";
import { usePlans } from "./usePlans";
import { useToast } from "./useToast";
import { mapProperty, getPropertiesByUser } from "./useProperties";

export const useDashboardData = () => {
  const { user } = useAuth();
  const { getUserPlan, getPlans, assignPlan, usePlansQuery, useUserPlanQuery } = usePlans();
  const toast = useToast();
  const queryClient = useQueryClient();

  const isAdmin = user?.roles?.some(r => r.name === 'admin') || user?.role === 'admin' || false;
  const isPublisher = user?.roles?.some(r => r.name === 'owner' || r.name === 'agent') || user?.role === 'owner' || user?.role === 'agent' || false;
  const isBuyer = !isAdmin && !isPublisher;

  // Estados locales para control de la interfaz (UI)
  const [showCheckout, setShowCheckout] = useState(false);
  const [reductionPercent, setReductionPercent] = useState(5);
  const [reductionCustom, setReductionCustom] = useState({});
  const [reducingId, setReducingId] = useState(null);

  // Estados de filtros para Leads
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Estados de filtros para Propiedades (dueño/inmobiliaria)
  const [propSearch, setPropSearch] = useState("");
  const [propStatus, setPropStatus] = useState("");
  const [propOperation, setPropOperation] = useState("");

  // Queries con React Query
  const plansQuery = usePlansQuery({ enabled: !!user && !isBuyer });
  const userPlanQuery = useUserPlanQuery({ enabled: !!user && !isBuyer });

  const propertiesQuery = useQuery({
    queryKey: ["me_properties", propSearch, propStatus, propOperation],
    queryFn: () => getPropertiesByUser(user?.id, {
      search: propSearch,
      status: propStatus,
      operation: propOperation
    }),
    enabled: !!user && !isBuyer
  });

  const leadsQuery = useQuery({
    queryKey: ["leads", filterStatus, filterDateFrom, filterDateTo],
    queryFn: async () => {
      const params = {};
      if (filterStatus) {
        params.status = filterStatus;
      }
      if (filterDateFrom) {
        params.date_from = filterDateFrom;
      }
      if (filterDateTo) {
        params.date_to = filterDateTo;
      }

      const res = await api.get("/leads", { params });
      return res.data || [];
    },
    select: (data) => data.map(l => ({
      id: l.id,
      name: l.name,
      email: l.email,
      phone: l.phone,
      message: l.message,
      status: l.status === "pending" ? "Pendiente" : l.status === "contacted" ? "Contactado" : "Cerrado",
      statusRaw: l.status,
      createdAt: l.created_at,
      property: mapProperty(l.property),
      replies: l.replies || []
    })),
    enabled: !!user && !isBuyer
  });

  const favoritesQuery = useQuery({
    queryKey: ["me_favorites"],
    queryFn: async () => {
      const res = await api.get("/me/favorites");
      return res.data?.map(p => mapProperty(p)) || [];
    },
    enabled: !!user && isBuyer
  });

  const sentLeadsQuery = useQuery({
    queryKey: ["sent_leads", filterStatus, filterDateFrom, filterDateTo],
    queryFn: async () => {
      const params = {};
      if (filterStatus) {
        params.status = filterStatus;
      }
      if (filterDateFrom) {
        params.date_from = filterDateFrom;
      }
      if (filterDateTo) {
        params.date_to = filterDateTo;
      }

      const res = await api.get("/leads/sent", { params });
      return res.data || [];
    },
    select: (data) => data.map(l => ({
      id: l.id,
      name: l.name,
      email: l.email,
      phone: l.phone,
      message: l.message,
      status: l.status === "pending" ? "Pendiente" : l.status === "contacted" ? "Contactado" : "Cerrado",
      statusRaw: l.status,
      createdAt: l.created_at,
      property: mapProperty(l.property),
      replies: l.replies || []
    })),
    enabled: !!user && isBuyer
  });

  // Admin Queries

  const adminUsersQuery = useQuery({
    queryKey: ["admin_users"],
    queryFn: async () => {
      const res = await api.get("/users");
      return res.data || [];
    },
    enabled: isAdmin
  });

  const adminPropertiesQuery = useQuery({
    queryKey: ["admin_properties"],
    queryFn: async () => {
      const res = await api.get("/admin/properties");
      return res.data?.map(p => mapProperty(p)) || [];
    },
    enabled: isAdmin
  });

  // Mutación para reducir precio
  const reducePriceMutation = useMutation({
    mutationFn: async ({ id, newPrice }) => {
      return api.patch(`/properties/${id}`, {
        price_usd: newPrice,
        price_amount: newPrice
      });
    },
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["me_properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", variables.id] });
      setReductionCustom(prev => ({ ...prev, [variables.id]: "" }));
      toast.success("Precio reducido y actualizado con éxito.");
    },
    onError: (err) => {
      console.error("Error al reducir precio:", err);
      toast.error("Error al reducir el precio de la propiedad.");
    },
    onSettled: () => {
      setReducingId(null);
    }
  });

  const handleReducePrice = async (prop) => {
    const pct = reductionCustom[prop.id] ? parseFloat(reductionCustom[prop.id]) : reductionPercent;
    if (!pct || pct <= 0 || pct > 100) {
      toast.error("Por favor ingresa un porcentaje válido entre 1 y 100.");
      return;
    }
    const reduction = prop.price * (pct / 100);
    const newPrice = Math.round(prop.price - reduction);
    
    setReducingId(prop.id);
    reducePriceMutation.mutate({ id: prop.id, newPrice });
  };

  // Mutación para borrar propiedad
  const deletePropertyMutation = useMutation({
    mutationFn: async (id) => {
      return api.delete(`/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me_properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["admin_properties"] });
      toast.success("Propiedad eliminada con éxito.");
    },
    onError: () => {
      toast.error("Error al eliminar la propiedad.");
    }
  });

  const deleteProperty = async (id) => {
    deletePropertyMutation.mutate(id);
  };

  // Mutación para eliminar de favoritos
  const removeFavoriteMutation = useMutation({
    mutationFn: async (id) => {
      return api.delete(`/properties/${id}/favorite`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me_favorites"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Propiedad eliminada de favoritos con éxito.");
    },
    onError: () => {
      toast.error("Error al eliminar de favoritos.");
    }
  });

  const removeFavorite = async (id) => {
    removeFavoriteMutation.mutate(id);
  };

  // Mutaciones de Admin
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, active }) => {
      return api.patch(`/users/${userId}/status`, { active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
      toast.success("Estado del usuario actualizado.");
    },
    onError: () => {
      toast.error("Error al actualizar usuario.");
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      return api.delete(`/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
      toast.success("Usuario eliminado.");
    },
    onError: () => {
      toast.error("Error al eliminar usuario.");
    }
  });

  const updateUserStatus = (userId, active) => updateUserStatusMutation.mutate({ userId, active });
  const deleteUser = (userId) => deleteUserMutation.mutate(userId);

  // Mutación para cambiar el estado de un lead
  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ leadId, newStatus }) => {
      return api.patch(`/leads/${leadId}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Estado de consulta actualizado.");
    },
    onError: (err) => {
      console.error("Error updating lead status:", err);
      toast.error("Error al actualizar el estado de la consulta.");
    }
  });

  const updateLeadStatus = async (leadId, newStatus) => {
    updateLeadStatusMutation.mutate({ leadId, newStatus });
  };

  // Mutación para responder a un lead
  const replyToLeadMutation = useMutation({
    mutationFn: async ({ leadId, body }) => {
      const res = await api.post(`/leads/${leadId}/reply`, { body });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Respuesta enviada con éxito.");
    },
    onError: (err) => {
      console.error("Error replying to lead:", err);
      toast.error("Error al enviar la respuesta.");
    }
  });

  const replyToLead = async (leadId, body) => {
    return replyToLeadMutation.mutateAsync({ leadId, body });
  };

  const handleAssignPlan = async (planId) => {
    try {
      await assignPlan(planId);
      setShowCheckout(false);
      toast.success("Plan actualizado con éxito.");
    } catch (err) {
      toast.error(err.message || "Error al procesar el pago del plan.");
      throw err;
    }
  };

  const loading = 
    (isBuyer && (favoritesQuery.isLoading || sentLeadsQuery.isLoading)) ||
    (!isBuyer && (propertiesQuery.isLoading || leadsQuery.isLoading || userPlanQuery.isLoading || plansQuery.isLoading));

  return {
    user,
    isAdmin,
    isBuyer,
    favorites: favoritesQuery.data || [],
    sentLeads: sentLeadsQuery.data || [],
    properties: propertiesQuery.data || [],
    leads: leadsQuery.data || [],
    adminUsers: adminUsersQuery.data || [],
    adminProperties: adminPropertiesQuery.data || [],
    userPlan: userPlanQuery.data || null,
    plansList: plansQuery.data || [],
    loading: loading || adminUsersQuery.isLoading || adminPropertiesQuery.isLoading,
    showCheckout,
    setShowCheckout,
    reductionPercent,
    setReductionPercent,
    reductionCustom,
    setReductionCustom,
    reducingId,
    handleReducePrice,
    deleteProperty,
    removeFavorite,
    updateLeadStatus,
    replyToLead,
    isReplying: replyToLeadMutation.isPending,
    filterStatus,
    setFilterStatus,
    filterDateFrom,
    setFilterDateFrom,
    filterDateTo,
    setFilterDateTo,
    propSearch,
    setPropSearch,
    propStatus,
    setPropStatus,
    propOperation,
    setPropOperation,
    handleAssignPlan,
    updateUserStatus,
    deleteUser
  };
};
