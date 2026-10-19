import { useCallback, useEffect, useState } from "react";
import { infocoinsApi } from "../api/infocoins";

/**
 * Hook para el catálogo de paquetes de InfoMonedas.
 *
 * Uso:
 *   const { packages, loading, error, refetch } = usePackages();
 */
export function usePackages({ enabled = true } = {}) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await infocoinsApi.getPackages();
      setPackages(data?.packages ?? []);
    } catch (err) {
      setError(err?.message || "No se pudieron cargar los paquetes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) fetchPackages();
  }, [enabled, fetchPackages]);

  return { packages, loading, error, refetch: fetchPackages };
}