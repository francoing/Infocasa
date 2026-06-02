import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { api } from "../api/api";

export const fetchPlans = async () => {
  const res = await api.get("/plans");
  const rawPlans = res.data || [];
  return rawPlans.map(plan => {
    let features = [];
    const limitStr = plan.property_limit ? `Hasta ${plan.property_limit} propiedades` : "Propiedades ilimitadas";
    const featuredStr = plan.featured_limit > 0 ? `Hasta ${plan.featured_limit} destacadas` : "Sin destacadas";

    if (Number(plan.id) === 1 || plan.name?.toLowerCase() === 'basic') {
      features = [
        limitStr,
        featuredStr,
        "Soporte básico por email",
        "Publicación estándar"
      ];
    } else if (Number(plan.id) === 2 || plan.name?.toLowerCase() === 'premium') {
      features = [
        limitStr,
        featuredStr,
        "Soporte prioritario",
        "Mayor visibilidad en búsquedas"
      ];
    } else {
      features = [
        limitStr,
        featuredStr,
        "Soporte 24/7",
        "Máxima prioridad en búsquedas",
        "Asignación directa de leads"
      ];
    }

    return {
      ...plan,
      features
    };
  });
};

export const fetchUserPlan = async () => {
  const user = await api.get("/auth/me");
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
        featured_limit: user.subscription.plan.featured_limit
      }
    };
  }
  return null;
};

export const usePlans = () => {
  let queryClient;
  try {
    queryClient = useQueryClient();
  } catch (e) {
    queryClient = new QueryClient();
  }

  const getPlans = useCallback(async () => {
    return queryClient.fetchQuery({
      queryKey: ["plans"],
      queryFn: fetchPlans,
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  const getUserPlan = useCallback(async () => {
    return queryClient.fetchQuery({
      queryKey: ["userPlan"],
      queryFn: fetchUserPlan,
      staleTime: 1000,
    });
  }, [queryClient]);

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
        message: `Has alcanzado el límite de tu plan (${limit} propiedades).`
      };
    }

    return { allowed: true, current: props.length, limit };
  }, [getUserPlan]);

  const assignMutation = useMutation({
    mutationFn: async (planId) => {
      return api.post("/subscriptions", {
        plan_id: planId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPlan"] });
      queryClient.invalidateQueries({ queryKey: ["auth_me"] });
    }
  });

  const assignPlan = useCallback(async (userId, planId) => {
    return assignMutation.mutateAsync(planId);
  }, [assignMutation]);

  return {
    loading: assignMutation.isPending,
    error: assignMutation.error?.message || null,
    getPlans,
    getUserPlan,
    validateLimit,
    assignPlan,
    
    // Hooks de React Query que reciben opciones
    usePlansQuery: (options = {}) => useQuery({
      ...options,
      queryKey: ["plans"],
      queryFn: fetchPlans,
      staleTime: 5 * 60 * 1000,
    }),
    useUserPlanQuery: (options = {}) => useQuery({
      ...options,
      queryKey: ["userPlan"],
      queryFn: fetchUserPlan,
      staleTime: 1000,
    })
  };
};
