import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { guideApi } from "../api/guide";
import { readPaginated } from "../lib/pagination";
import { mapGuideInquiry } from "./guide.mappers";

/** Consultas recibidas por el anunciante de la Guía (panel). */

const INQUIRIES_KEY = ["guide_my_inquiries"];

export const useMyGuideInquiries = (filters = {}, { enabled = true } = {}) =>
  useQuery({
    queryKey: [...INQUIRIES_KEY, filters],
    queryFn: async () => readPaginated(await guideApi.myInquiries({ per_page: 20, ...filters }), mapGuideInquiry),
    enabled,
    placeholderData: keepPreviousData,
  });

export function useMarkGuideInquiryRead() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id) => guideApi.markInquiryRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: INQUIRIES_KEY }),
  });
  return { markRead: mutation.mutate, isMarking: mutation.isPending };
}
