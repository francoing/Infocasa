import { api } from "../api/api";
import { queryClient } from "../lib/queryClient";

/**
 * Marca/desmarca una propiedad como favorita.
 * Capa de datos: único lugar que toca api/api.js (ver .ai/context/architecture.md).
 */
export const setPropertyFavorite = async (propertyId, favorited) => {
  const res = favorited
    ? await api.post(`/properties/${propertyId}/favorite`)
    : await api.delete(`/properties/${propertyId}/favorite`);
  queryClient.invalidateQueries({ queryKey: ["me_favorites"] });
  return res;
};
