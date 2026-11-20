import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { infocoinsApi } from "../api/infocoins";
import { WALLET_QUERY_KEY } from "./useWallet";

/**
 * Hook para asignar infomonedas a una propiedad (react-query).
 * Al éxito invalida la billetera y el listado de "mis propiedades" (contador de monedas).
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["me_properties"] });
    },
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
