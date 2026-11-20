import { useQuery } from "@tanstack/react-query";
import { infocoinsApi } from "../api/infocoins";

/** Query key de la billetera. La invalidan compra, verificación de pago y asignación. */
export const WALLET_QUERY_KEY = ["infocoins_wallet"];

/**
 * Hook para la billetera del usuario: InfoMonedas, destacados y transacciones (react-query).
 *
 * Uso:
 *   const { balance, featuredBalance, transactions, loading, error, refetch } = useWallet();
 *
 * - `enabled: false` evita el fetch (por ej. con el modal cerrado).
 * - `staleTime: 0`: al montar/abrir siempre trae el saldo fresco; como el cache es
 *   compartido, cualquier pantalla que use el hook ve el mismo saldo.
 */
export function useWallet({ enabled = true } = {}) {
  const query = useQuery({
    queryKey: WALLET_QUERY_KEY,
    queryFn: () => infocoinsApi.getWallet(),
    enabled,
    staleTime: 0,
  });

  return {
    balance: query.data?.balance ?? 0,
    featuredBalance: query.data?.featured_balance ?? 0,
    transactions: query.data?.transactions ?? [],
    loading: query.isFetching,
    error: query.error ? query.error.message || "No se pudo cargar la billetera." : null,
    refetch: query.refetch,
  };
}
