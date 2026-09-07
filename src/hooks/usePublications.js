import { api } from "../api/api";
import { queryClient } from "../lib/queryClient";

/**
 * Crea la publicación de una propiedad con el tipo elegido (basic/featured/premium).
 * Capa de datos: único lugar que toca api/api.js (ver .ai/context/architecture.md).
 * Puede lanzar 403 si no hay suscripción activa (lo maneja el caller).
 */
export const createPublication = async ({ property_id, type }) => {
  const res = await api.post("/publications", { property_id, type });
  queryClient.invalidateQueries({ queryKey: ["me_properties"] });
  return res;
};
