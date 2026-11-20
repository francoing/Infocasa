import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";

/**
 * Cupo de propiedades del usuario logueado + saldos.
 * GET /me/publication-quota (Bearer) → { plan, expires_at, properties: { limit, used, available },
 * featured_balance, infocoins_balance }. `available === null` = ilimitado; las archivadas no cuentan.
 * El backend valida igual con 403 al crear (no confiar solo en el front).
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
