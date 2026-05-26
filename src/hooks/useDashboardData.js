import { useState, useEffect, useCallback } from "react";
import { api } from "../api/api";
import { useAuth } from "./useAuth";
import { usePlans } from "./usePlans";
import { useToast } from "./useToast";

export const useDashboardData = () => {
  const { user } = useAuth();
  const { getUserPlan, getPlans, assignPlan } = usePlans();
  const toast = useToast();

  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [userPlan, setUserPlan] = useState(null);
  const [plansList, setPlansList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [reductionPercent, setReductionPercent] = useState(5);
  const [reductionCustom, setReductionCustom] = useState({});
  const [reducingId, setReducingId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const plan = await getUserPlan(user.id);
      setUserPlan(plan);

      const allPlans = await getPlans();
      setPlansList(allPlans);

      const myProps = await api.get(`/properties?userId=${user.id}`);
      setProperties(myProps);

      const myLeads = await api.get(`/leads?publisherId=${user.id}`);
      setLeads(myLeads);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      toast.error("Error al cargar los datos del panel.");
    } finally {
      setLoading(false);
    }
  }, [user, getUserPlan, getPlans, toast]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const handleReducePrice = async (prop) => {
    const pct = reductionCustom[prop.id] ? parseFloat(reductionCustom[prop.id]) : reductionPercent;
    if (!pct || pct <= 0 || pct > 100) {
      toast.error("Por favor ingresa un porcentaje válido entre 1 y 100.");
      return;
    }
    const reduction = prop.price * (pct / 100);
    const newPrice = Math.round(prop.price - reduction);
    try {
      setReducingId(prop.id);
      const historyEntry = { oldPrice: prop.price, newPrice, percentage: pct, date: new Date().toISOString() };
      const updated = await api.patch(`/properties/${prop.id}`, {
        price: newPrice,
        priceHistory: [...(prop.priceHistory || []), historyEntry]
      });
      setProperties(prev => prev.map(p => p.id === prop.id ? { ...p, price: newPrice, priceHistory: updated.priceHistory } : p));
      setReductionCustom(prev => ({ ...prev, [prop.id]: "" }));
      toast.success("Precio reducido y actualizado con éxito.");
    } catch (err) {
      console.error("Error al reducir precio:", err);
      toast.error("Error al reducir el precio de la propiedad.");
    } finally {
      setReducingId(null);
    }
  };

  const deleteProperty = async (id) => {
    try {
      await api.delete(`/properties/${id}`);
      setProperties(prev => prev.filter(p => p.id !== id));
      toast.success("Propiedad eliminada con éxito.");
    } catch (err) {
      toast.error("Error al eliminar la propiedad.");
    }
  };

  const handleAssignPlan = async (planId) => {
    try {
      await assignPlan(user.id, planId);
      setShowCheckout(false);
      toast.success("Plan actualizado con éxito.");
      // Recargar datos actualizados
      await fetchData();
    } catch (err) {
      toast.error("Error al procesar el pago del plan.");
    }
  };

  return {
    user,
    properties,
    leads,
    userPlan,
    plansList,
    loading,
    showCheckout,
    setShowCheckout,
    reductionPercent,
    setReductionPercent,
    reductionCustom,
    setReductionCustom,
    reducingId,
    handleReducePrice,
    deleteProperty,
    handleAssignPlan
  };
};
