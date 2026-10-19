import { useCallback, useState } from "react";
import { infocoinsApi } from "@/api/infocoins";

/**
 * Hook para asignar infomonedas a una propiedad.
 *
 * Uso:
 *   const { assign, loading, error } = useAssignInfocoins();
 *   const res = await assign(propertyId, 5);
 *   // res = { message, property_infocoins, balance }
 */
export function useAssignInfocoins() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const assign = useCallback(async (propertyId, amount) => {
    setLoading(true);
    setError(null);
    try {
      const res = await infocoinsApi.assignToProperty(propertyId, amount);
      return res;
    } catch (err) {
      const msg = err?.message || "No se pudo asignar las infomonedas.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { assign, loading, error };
}