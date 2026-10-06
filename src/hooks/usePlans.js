import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";
import { useAuthStore } from "../store/useAuthStore";

// Trae los planes del backend y los devuelve tal cual vienen.
// Las features / badges / promos se definen en SubscriptionPlans.jsx
// (más fácil de mantener en un solo lugar).
export const fetchPlans = async () => {
  const res = await api.get("/plans");
  return res.data || [];
};

export const fetchUserPlan = async () => {
  const res = await api.get("/auth/me");
  const user = res?.data || res;
  if (user && user.subscription) {
    return {
      id: user.subscription.id,
      startDate: user.subscription.start_date,
      expiryDate: user.subscription.end_date,
      active: user.subscription.active,
      planId: user.subscription.plan_id,
      details: {
        id: user.subscription.plan.id,
        name: user.subscription.plan.name,
        price: user.subscription.plan.price,
        limit: user.subscription.plan.property_limit ?? 9999,
        featured_limit: user.subscription.plan.featured_limit,
      },
    };
  }
  return null;
};

export const usePlans = () => {
  const queryClient = useQueryClient();

  const { user } = useAuthStore();
  const userRole = user?.role || "guest";
  const userId = user?.id || "guest";

  const getPlans = useCallback(async () => {
    return queryClient.fetchQuery({
      queryKey: ["plans", userRole],
      queryFn: fetchPlans,
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient, userRole]);

  const getUserPlan = useCallback(async () => {
    return queryClient.fetchQuery({
      queryKey: ["userPlan", userId],
      queryFn: fetchUserPlan,
      staleTime: 1000,
    });
  }, [queryClient, userId]);

  const validateLimit = useCallback(async () => {
    const userPlan = await getUserPlan();
    if (!userPlan) return { allowed: false, message: "No tienes un plan activo." };

    const now = new Date();
    if (userPlan.expiryDate && new Date(userPlan.expiryDate) < now) {
      return { allowed: false, message: "Tu plan ha expirado." };
    }

    const res = await api.get("/me/properties");
    const props = res.data || [];
    const limit = userPlan.details.limit;

    if (props.length >= limit) {
      return {
        allowed: false,
        message: `Has alcanzado el límite de tu plan (${limit} propiedades).`,
      };
    }

    return { allowed: true, current: props.length, limit };
  }, [getUserPlan]);

  const assignMutation = useMutation({
    mutationFn: async (planId) => {
      return api.post("/subscriptions", {
        plan_id: planId,
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["userPlan", userId] });
      queryClient.invalidateQueries({ queryKey: ["plans", userRole] });
      queryClient.invalidateQueries({ queryKey: ["auth_me"] });
      await useAuthStore.getState().refreshUser();
    },
  });

  const assignPlan = useCallback(
    async (planId) => {
      return assignMutation.mutateAsync(planId);
    },
    [assignMutation]
  );

  const payWithMercadoPago = useCallback(async (planId) => {
    const res = await api.post("/subscriptions/mercadopago/preference", {
      plan_id: planId,
    });
    return res;
  }, []);

  /**
   * Called when the user returns from the Mercado Pago checkout.
   * Verifies the payment server-side and activates the subscription if approved.
   * Returns { user, subscription, message } from the API.
   */
  const verifyMercadoPagoPayment = useCallback(
    async ({ paymentId, preferenceId, externalReference }) => {
      const params = new URLSearchParams();
      if (paymentId) params.append("payment_id", paymentId);
      if (preferenceId) params.append("preference_id", preferenceId);
      if (externalReference)
        params.append("external_reference", externalReference);

      const res = await api.get(
        `/subscriptions/mercadopago/verify?${params.toString()}`
      );
      return res;
    },
    []
  );

  return {
    loading: assignMutation.isPending,
    error: assignMutation.error?.message || null,
    getPlans,
    getUserPlan,
    validateLimit,
    assignPlan,
    payWithMercadoPago,
    verifyMercadoPagoPayment,

    // Hooks de React Query que reciben opciones
    usePlansQuery: (options = {}) =>
      useQuery({
        ...options,
        queryKey: ["plans", userRole],
        queryFn: fetchPlans,
        staleTime: 5 * 60 * 1000,
      }),
    useUserPlanQuery: (options = {}) =>
      useQuery({
        ...options,
        queryKey: ["userPlan", userId],
        queryFn: fetchUserPlan,
        staleTime: 1000,
      }),
  };
};