import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";
import { usePlans } from "./usePlans";
import { useToast } from "./useToast";

/**
 * Todas las escrituras (mutations) del dashboard + sus handlers.
 * Recibe el estado de reducción de precio y el control del checkout (viven en el orquestador).
 */
export const useDashboardMutations = ({ reductionCustom, reductionPercent, setReductionCustom, setReducingId, setShowCheckout }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { assignPlan, payWithMercadoPago } = usePlans();

  const reducePriceMutation = useMutation({
    mutationFn: ({ id, newPrice }) => api.patch(`/properties/${id}`, { price_amount: newPrice }),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["me_properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", variables.id] });
      setReductionCustom((prev) => ({ ...prev, [variables.id]: "" }));
      toast.success("Precio reducido y actualizado con éxito.");
    },
    onError: (err) => {
      console.error("Error al reducir precio:", err);
      toast.error("Error al reducir el precio de la propiedad.");
    },
    onSettled: () => setReducingId(null),
  });

  const handleReducePrice = async (prop) => {
    const pct = reductionCustom[prop.id] ? parseFloat(reductionCustom[prop.id]) : reductionPercent;
    if (!pct || pct <= 0 || pct > 100) {
      toast.error("Por favor ingresa un porcentaje válido entre 1 y 100.");
      return;
    }
    const newPrice = Math.round(prop.price - prop.price * (pct / 100));
    setReducingId(prop.id);
    reducePriceMutation.mutate({ id: prop.id, newPrice });
  };

  const deletePropertyMutation = useMutation({
    mutationFn: (id) => api.delete(`/properties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me_properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["admin_properties"] });
      toast.success("Propiedad eliminada con éxito.");
    },
    onError: () => toast.error("Error al eliminar la propiedad."),
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (id) => api.delete(`/properties/${id}/favorite`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me_favorites"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Propiedad eliminada de favoritos con éxito.");
    },
    onError: () => toast.error("Error al eliminar de favoritos."),
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, active }) => api.patch(`/users/${userId}/status`, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
      toast.success("Estado del usuario actualizado.");
    },
    onError: () => toast.error("Error al actualizar usuario."),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => api.delete(`/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
      toast.success("Usuario eliminado.");
    },
    onError: () => toast.error("Error al eliminar usuario."),
  });

  const updateLeadStatusMutation = useMutation({
    mutationFn: ({ leadId, newStatus }) => api.patch(`/leads/${leadId}`, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Estado de consulta actualizado.");
    },
    onError: (err) => {
      console.error("Error updating lead status:", err);
      toast.error("Error al actualizar el estado de la consulta.");
    },
  });

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
    },
  });

  const handleAssignPlan = async (plan) => {
    try {
      if (Number(plan.price) > 0) {
        const preference = await payWithMercadoPago(plan.id);
        if (preference?.redirect_url) {
          window.open(preference.redirect_url, "_blank");
        } else {
          toast.error("No se pudo obtener la URL de pago.");
        }
      } else {
        await assignPlan(plan.id);
        setShowCheckout(false);
        toast.success("¡Plan activado con éxito!");
      }
    } catch (err) {
      toast.error(err.message || "Error al procesar el pago del plan.");
      throw err;
    }
  };

  return {
    handleReducePrice,
    deleteProperty: (id) => deletePropertyMutation.mutate(id),
    removeFavorite: (id) => removeFavoriteMutation.mutate(id),
    updateUserStatus: (userId, active) => updateUserStatusMutation.mutate({ userId, active }),
    deleteUser: (userId) => deleteUserMutation.mutate(userId),
    updateLeadStatus: (leadId, newStatus) => updateLeadStatusMutation.mutate({ leadId, newStatus }),
    replyToLead: (leadId, body) => replyToLeadMutation.mutateAsync({ leadId, body }),
    isReplying: replyToLeadMutation.isPending,
    handleAssignPlan,
  };
};
