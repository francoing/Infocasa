import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";

/**
 * Cupo de publicaciones del usuario logueado.
 * GET /me/publication-quota (Bearer) → { plan, properties, featured, premium },
 * cada uno { limit, used, available }. `available === null` = ilimitado.
 * El backend valida igual con 403 al publicar (no confiar solo en el front).
 */
const fetchPublicationQuota = async () => {
  const res = await api.get("/me/publication-quota");
  return res?.data || res;
};

export const usePublicationQuota = (options = {}) =>
  useQuery({
    queryKey: ["publication_quota"],
    queryFn: fetchPublicationQuota,
    staleTime: 0, // se recalcula cada vez que se abre el selector (descuenta tras publicar)
    ...options,
  });
