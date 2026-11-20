import { useQuery } from "@tanstack/react-query";
import { infocoinsApi } from "../api/infocoins";

/**
 * Hook para el catálogo de paquetes de InfoMonedas (react-query).
 *
 * Uso:
 *   const { packages, loading, error, refetch } = usePackages();
 */
export function usePackages({ enabled = true } = {}) {
  const query = useQuery({
    queryKey: ["infocoins_packages"],
    queryFn: () => infocoinsApi.getPackages(),
    enabled,
  });

  return {
    packages: query.data?.packages ?? [],
    loading: query.isLoading,
    error: query.error ? query.error.message || "No se pudieron cargar los paquetes." : null,
    refetch: query.refetch,
  };
}
