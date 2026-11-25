import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { guideApi } from "../api/guide";
import { mapGuideListing } from "./guide.mappers";
import { toListingPayload } from "./guide.payloads";

/**
 * Publicaciones propias de la Guía (panel del anunciante): listado, detalle, alta/edición con
 * fotos, pausar/activar, duplicar y borrar.
 */

const MY_LISTINGS_KEY = ["guide_my_listings"];
const myListingKey = (id) => ["guide_my_listing", String(id)];

export const useMyGuideListings = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: MY_LISTINGS_KEY,
    queryFn: async () => ((await guideApi.myListings())?.data ?? []).map(mapGuideListing),
    enabled,
  });

export const useMyGuideListing = (id) =>
  useQuery({
    queryKey: myListingKey(id),
    queryFn: async () => mapGuideListing((await guideApi.myListing(id))?.data),
    enabled: !!id,
  });

const invalidateGuide = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: MY_LISTINGS_KEY });
  queryClient.invalidateQueries({ queryKey: ["guide_search"] });
  queryClient.invalidateQueries({ queryKey: ["guide_categories"] });
};

/** Sube fotos nuevas en tandas de 3 (mismo criterio que propiedades: límites de nginx/PHP). */
async function uploadInBatches(listingId, files) {
  let last = null;
  for (let i = 0; i < files.length; i += 3) {
    const fd = new FormData();
    files.slice(i, i + 3).forEach((f) => fd.append("files[]", f));
    last = await guideApi.uploadPhotos(listingId, fd);
  }
  return last;
}

/**
 * Alta o edición. `save({ form, newFiles, asDraft })` guarda los datos y después sube las
 * fotos nuevas (la publicación necesita id). Devuelve `{ listing, message }`.
 */
export function useSaveGuideListing(id) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ form, newFiles = [], asDraft = false }) => {
      const payload = toListingPayload(form, { asDraft });
      const res = id ? await guideApi.updateListing(id, payload) : await guideApi.createListing(payload);
      let listing = res?.data;
      if (newFiles.length && listing?.id) {
        listing = (await uploadInBatches(listing.id, newFiles))?.data ?? listing;
      }
      return { listing: mapGuideListing(listing), message: res?.message };
    },
    onSuccess: ({ listing }) => {
      queryClient.setQueryData(myListingKey(listing.id), listing);
      invalidateGuide(queryClient);
    },
  });
  return { save: mutation.mutateAsync, isSaving: mutation.isPending };
}

/** Acciones de fila: pausar/activar, duplicar, eliminar. */
export function useGuideListingActions() {
  const queryClient = useQueryClient();
  const onSuccess = () => invalidateGuide(queryClient);
  const toggle = useMutation({ mutationFn: (id) => guideApi.toggleListing(id), onSuccess });
  const duplicate = useMutation({ mutationFn: (id) => guideApi.duplicateListing(id), onSuccess });
  const remove = useMutation({ mutationFn: (id) => guideApi.deleteListing(id), onSuccess });
  return {
    toggle: toggle.mutateAsync,
    duplicate: duplicate.mutateAsync,
    remove: remove.mutateAsync,
    isBusy: toggle.isPending || duplicate.isPending || remove.isPending,
  };
}

/** Fotos ya guardadas: reordenar (la primera es portada) y borrar. */
export function useGuidePhotos(listingId) {
  const queryClient = useQueryClient();
  const onSuccess = (res) => {
    if (res?.data) queryClient.setQueryData(myListingKey(listingId), mapGuideListing(res.data));
    queryClient.invalidateQueries({ queryKey: MY_LISTINGS_KEY });
  };
  const reorder = useMutation({ mutationFn: (ids) => guideApi.reorderPhotos(listingId, ids), onSuccess });
  const remove = useMutation({ mutationFn: (photoId) => guideApi.deletePhoto(listingId, photoId), onSuccess });
  return { reorder: reorder.mutateAsync, remove: remove.mutateAsync, isBusy: reorder.isPending || remove.isPending };
}
