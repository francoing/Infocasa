import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { infocoinsApi } from "../api/infocoins";
import { invalidateAfterVisibilityChange } from "./useAssignInfocoins";

/**
 * Destacar una propiedad (1 destacado, permanente, una sola vez).
 * Spec backend monetization/featured_and_archive.
 *
 * Uso:
 *   const { feature, loading, error } = useFeatureProperty();
 *   const res = await feature(propertyId); // { message, featured_at, featured_balance }
 */
export function useFeatureProperty() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (propertyId) => infocoinsApi.featureProperty(propertyId),
    onSuccess: (_data, propertyId) => invalidateAfterVisibilityChange(queryClient, propertyId),
  });

  const { mutateAsync } = mutation;
  const feature = useCallback(
    async (propertyId) => {
      try {
        return await mutateAsync(propertyId);
      } catch (err) {
        throw new Error(err?.message || "No se pudo destacar la propiedad.");
      }
    },
    [mutateAsync]
  );

  return {
    feature,
    loading: mutation.isPending,
    error: mutation.error ? mutation.error.message || "No se pudo destacar la propiedad." : null,
  };
}
