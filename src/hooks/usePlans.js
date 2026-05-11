import { useState, useCallback } from "react";
import { api } from "../api/api";

export const usePlans = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPlans = useCallback(async () => {
    try {
      return await api.get("/plans");
    } catch (err) {
      console.error("Error fetching plans:", err);
      return [];
    }
  }, []);

  const getUserPlan = useCallback(async (userId) => {
    try {
      const userPlans = await api.get(`/userPlans?userId=${userId}`);
      if (userPlans && userPlans.length > 0) {
        // Obtenemos el último plan (el más reciente)
        const userPlan = userPlans[userPlans.length - 1];
        const planDetails = await api.get(`/plans/${userPlan.planId}`);
        return {
          ...userPlan,
          details: planDetails
        };
      }
      return null;
    } catch (err) {
      console.error("Error fetching user plan:", err);
      return null;
    }
  }, []);

  const validateLimit = async (userId) => {
    const userPlan = await getUserPlan(userId);
    if (!userPlan) return { allowed: false, message: "No tienes un plan activo." };

    // Verificar expiración si existe fecha
    const now = new Date();
    if (userPlan.expiryDate && new Date(userPlan.expiryDate) < now) {
      return { allowed: false, message: "Tu plan ha expirado." };
    }

    // Verificar límite
    const props = await api.get(`/properties?userId=${userId}`);
    const limit = userPlan.details.limit;

    if (props.length >= limit) {
      return { 
        allowed: false, 
        message: `Has alcanzado el límite de tu plan (${limit} propiedades).` 
      };
    }

    return { allowed: true, current: props.length, limit };
  };

  const assignPlan = async (userId, planId) => {
    setLoading(true);
    try {
      const startDate = new Date().toISOString();
      const expiryDate = planId === 'basic' ? null : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

      // Eliminar o desactivar planes previos (en json-server solemos simplemente crear uno nuevo o pisar)
      // Para simplificar, borramos los anteriores del usuario si existen
      const existing = await api.get(`/userPlans?userId=${userId}`);
      for (const p of existing) {
        await api.delete(`/userPlans/${p.id}`);
      }

      return await api.post("/userPlans", {
        userId,
        planId,
        startDate,
        expiryDate
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getPlans,
    getUserPlan,
    validateLimit,
    assignPlan
  };
};
