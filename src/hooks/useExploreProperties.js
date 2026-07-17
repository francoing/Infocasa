import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";
import { mapProperty } from "./useProperties";

/**
 * Propiedades para la vista Explore (mapa por operación).
 * Capa de datos: react-query aporta loading/error/cancelación. Ver .ai/context/architecture.md.
 */
export const useExploreProperties = (operationApi) => {
  const query = useQuery({
    queryKey: ["explore", operationApi],
    queryFn: async () => {
      const res = await api.get(`/properties/search?operation=${operationApi}&per_page=50`);
      return (res.data || []).map((p) => mapProperty(p));
    },
    enabled: !!operationApi,
    staleTime: 5 * 60 * 1000,
  });

  return {
    properties: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
  };
};
