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

/** Crea la inmobiliaria del usuario actual. Capa de datos (único lugar que toca api/api.js). */
export const createAgency = async (data) => {
  const res = await api.post("/agencies", data);
  return res.data;
};

/** Actualiza los datos de una inmobiliaria existente. */
export const updateAgency = async (id, data) => {
  const res = await api.put(`/agencies/${id}`, data);
  return res.data;
};
