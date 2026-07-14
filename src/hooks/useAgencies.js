import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";

/**
 * Lista de inmobiliarias (para filtros y selects).
 * Capa de datos: el único lugar que toca api/api.js (ver .ai/context/architecture.md).
 */
export const useAgencies = () => {
  const query = useQuery({
    queryKey: ["agencies"],
    queryFn: async () => {
      const res = await api.get("/agencies");
      return res.data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  return {
    agencies: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
  };
};
