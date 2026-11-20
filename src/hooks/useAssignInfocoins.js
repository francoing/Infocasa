import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { infocoinsApi } from "../api/infocoins";
import { useAuthStore } from "../store/useAuthStore";
import { WALLET_QUERY_KEY } from "./useWallet";

/**
 * Invalida todo lo que cambia al asignar destacados o InfoMonedas: billetera, mis
 * propiedades, el marketplace/home (cambia el orden) y el detalle; y refresca los
 * saldos del usuario logueado.
 */
export function invalidateAfterVisibilityChange(queryClient, propertyId) {
  queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: ["me_properties"] });
  queryClient.invalidateQueries({ queryKey: ["publication_quota"] });
  queryClient.invalidateQueries({ queryKey: ["properties"] });
  if (propertyId) queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
  useAuthStore.getState().refreshUser?.();
}

/**
 * Hook para asignar infomonedas a una propiedad (react-query).
 *
 * Uso:
 *   const { assign, loading, error } = useAssignInfocoins();
 *   const res = await assign(propertyId, 5);
 *   // res = { message, property_infocoins, balance }
 */
export function useAssignInfocoins() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ propertyId, amount }) => infocoinsApi.assignToProperty(propertyId, amount),
    onSuccess: (_data, { propertyId }) => invalidateAfterVisibilityChange(queryClient, propertyId),
  });

  const { mutateAsync } = mutation;
  const assign = useCallback(
    async (propertyId, amount) => {
      try {
        return await mutateAsync({ propertyId, amount });
      } catch (err) {
        throw new Error(err?.message || "No se pudo asignar las infomonedas.");
      }
    },
    [mutateAsync]
  );

  return {
    assign,
    loading: mutation.isPending,
    error: mutation.error ? mutation.error.message || "No se pudo asignar las infomonedas." : null,
  };
}
