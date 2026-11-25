import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { guideApi } from "../api/guide";
import { mapGuideAdvertiser } from "./guide.mappers";
import { toAdvertiserPayload } from "./guide.payloads";

/**
 * Perfil de anunciante de la Guía del usuario logueado (panel). `data === null` = no tiene
 * perfil todavía (se muestra el alta, no es un error).
 */

const MY_ADVERTISER_KEY = ["guide_my_advertiser"];

export const useMyGuideAdvertiser = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: MY_ADVERTISER_KEY,
    queryFn: async () => mapGuideAdvertiser((await guideApi.myAdvertiser())?.data ?? null),
    enabled,
  });

/** Crea (si no hay perfil) o actualiza el perfil. `save(form)` devuelve el perfil mapeado. */
export function useSaveGuideAdvertiser({ hasProfile }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (form) => {
      const payload = toAdvertiserPayload(form, { creating: !hasProfile });
      const res = hasProfile ? await guideApi.updateAdvertiser(payload) : await guideApi.createAdvertiser(payload);
      return { advertiser: mapGuideAdvertiser(res?.data), message: res?.message };
    },
    onSuccess: ({ advertiser }) => {
      queryClient.setQueryData(MY_ADVERTISER_KEY, advertiser);
      queryClient.invalidateQueries({ queryKey: ["guide_my_listings"] });
    },
  });
  return { save: mutation.mutateAsync, isSaving: mutation.isPending, error: mutation.error };
}

export function useUploadGuideLogo() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (file) => {
      const fd = new FormData();
      fd.append("logo", file);
      return mapGuideAdvertiser((await guideApi.uploadLogo(fd))?.data);
    },
    onSuccess: (advertiser) => queryClient.setQueryData(MY_ADVERTISER_KEY, advertiser),
  });
  return { upload: mutation.mutateAsync, isUploading: mutation.isPending };
}
