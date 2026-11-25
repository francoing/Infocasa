import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { guideApi } from "../api/guide";
import { readPaginated } from "../lib/pagination";
import { mapGuideAdvertiser, mapGuideCategory, mapGuideListing } from "./guide.mappers";

/** Administración de la Guía (solo admin): moderación, anunciantes y ABM de categorías/rubros. */

const ADMIN_LISTINGS = ["guide_admin_listings"];
const ADMIN_ADVERTISERS = ["guide_admin_advertisers"];
const ADMIN_TAXONOMY = ["guide_admin_categories"];

export const useGuideAdminListings = (filters = {}) =>
  useQuery({
    queryKey: [...ADMIN_LISTINGS, filters],
    queryFn: async () => readPaginated(await guideApi.adminListings({ per_page: 20, ...filters }), mapGuideListing),
    placeholderData: keepPreviousData,
  });

export const useGuideAdminAdvertisers = (filters = {}) =>
  useQuery({
    queryKey: [...ADMIN_ADVERTISERS, filters],
    queryFn: async () => readPaginated(await guideApi.adminAdvertisers({ per_page: 20, ...filters }), mapGuideAdvertiser),
    placeholderData: keepPreviousData,
  });

const invalidatePublic = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ["guide_search"] });
  queryClient.invalidateQueries({ queryKey: ["guide_categories"] });
};

/** Aprobar / rechazar (con motivo) / suspender / editar / eliminar publicaciones; suspender anunciantes. */
export function useGuideModeration() {
  const queryClient = useQueryClient();
  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_LISTINGS });
    queryClient.invalidateQueries({ queryKey: ADMIN_ADVERTISERS });
    invalidatePublic(queryClient);
  };
  const moderate = useMutation({ mutationFn: ({ id, action, reason }) => guideApi.adminModerate(id, action, reason), onSuccess });
  const remove = useMutation({ mutationFn: (id) => guideApi.adminDeleteListing(id), onSuccess });
  const edit = useMutation({ mutationFn: ({ id, data }) => guideApi.adminUpdateListing(id, data), onSuccess });
  const setAdvertiserStatus = useMutation({
    mutationFn: ({ id, status }) => guideApi.adminSetAdvertiserStatus(id, status),
    onSuccess,
  });
  return {
    moderate: moderate.mutateAsync,
    remove: remove.mutateAsync,
    edit: edit.mutateAsync,
    setAdvertiserStatus: setAdvertiserStatus.mutateAsync,
    isBusy: moderate.isPending || remove.isPending || edit.isPending || setAdvertiserStatus.isPending,
  };
}

/** ABM de categorías y rubros (incluye inactivos). */
export function useGuideAdminTaxonomy() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ADMIN_TAXONOMY,
    queryFn: async () => ((await guideApi.adminCategories())?.data ?? []).map(mapGuideCategory),
  });
  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_TAXONOMY });
    invalidatePublic(queryClient);
  };
  const saveCategory = useMutation({
    mutationFn: ({ id, ...data }) => (id ? guideApi.adminUpdateCategory(id, data) : guideApi.adminCreateCategory(data)),
    onSuccess,
  });
  const saveTrade = useMutation({
    mutationFn: ({ id, ...data }) => (id ? guideApi.adminUpdateTrade(id, data) : guideApi.adminCreateTrade(data)),
    onSuccess,
  });
  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    saveCategory: saveCategory.mutateAsync,
    saveTrade: saveTrade.mutateAsync,
    isSaving: saveCategory.isPending || saveTrade.isPending,
  };
}
