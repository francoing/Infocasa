import { useEffect } from "react";
import { useMutation, useQuery, keepPreviousData } from "@tanstack/react-query";
import { guideApi } from "../api/guide";
import { readPaginated } from "../lib/pagination";
import { mapGuideAdvertiser, mapGuideCategory, mapGuideListing } from "./guide.mappers";

/**
 * Capa de datos PÚBLICA de la InfoCasa Guía: catálogo, búsqueda, ficha, perfil, visitas y
 * consultas. Spec `guide/directory`.
 */

const GUIDE_KEYS = {
  categories: ["guide_categories"],
  search: (filters) => ["guide_search", filters],
  listing: (slug) => ["guide_listing", slug],
  advertiser: (slug) => ["guide_advertiser", slug],
};

/** Categorías activas con rubros y conteos. Cambia poco → cache 5 min. */
export const useGuideCategories = () =>
  useQuery({
    queryKey: GUIDE_KEYS.categories,
    queryFn: async () => {
      const res = await guideApi.categories();
      return (res?.data ?? []).map(mapGuideCategory);
    },
    staleTime: 5 * 60 * 1000,
  });

/** Búsqueda paginada. El orden lo define el backend (no se reordena en el front). */
export const useGuideSearch = (filters) =>
  useQuery({
    queryKey: GUIDE_KEYS.search(filters),
    queryFn: async () => readPaginated(await guideApi.search({ per_page: 12, ...filters }), mapGuideListing),
    placeholderData: keepPreviousData,
  });

export const useGuideListing = (slug) =>
  useQuery({
    queryKey: GUIDE_KEYS.listing(slug),
    queryFn: async () => mapGuideListing((await guideApi.listing(slug))?.data),
    enabled: !!slug,
    retry: (count, err) => err?.status !== 404 && count < 2,
  });

export const useGuideAdvertiserProfile = (slug) =>
  useQuery({
    queryKey: GUIDE_KEYS.advertiser(slug),
    queryFn: async () => mapGuideAdvertiser((await guideApi.advertiser(slug))?.data),
    enabled: !!slug,
    retry: (count, err) => err?.status !== 404 && count < 2,
  });

const VIEWED_PREFIX = "ic_guide_viewed_";

/** Registra la visita de una ficha una sola vez por sesión del navegador. */
export function useRegisterGuideView(slug, enabled = true) {
  useEffect(() => {
    if (!slug || !enabled) return;
    const key = `${VIEWED_PREFIX}${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* sin storage: se cuenta igual */
    }
    guideApi.registerView(slug).catch(() => {});
  }, [slug, enabled]);
}

/** Consulta / pedido de presupuesto a una publicación. */
export const useSendGuideInquiry = (slug) =>
  useMutation({
    mutationFn: (data) => guideApi.sendInquiry(slug, data),
  });
