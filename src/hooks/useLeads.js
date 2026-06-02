import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { api } from "../api/api";

const getQueryClient = () => {
  try {
    return useQueryClient();
  } catch (e) {
    return new QueryClient();
  }
};

export const useLeads = () => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const res = await api.get("/leads");
      return res.data || [];
    },
    staleTime: 60 * 1000,
  });

  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ leadId, status }) => {
      return api.patch(`/leads/${leadId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    }
  });

  const getLeadsByPublisher = useCallback(async () => {
    return queryClient.fetchQuery({
      queryKey: ["leads"],
      queryFn: async () => {
        const res = await api.get("/leads");
        return res.data || [];
      }
    });
  }, [queryClient]);

  const updateLeadStatus = useCallback(async (leadId, status) => {
    return updateLeadStatusMutation.mutateAsync({ leadId, status });
  }, [updateLeadStatusMutation]);

  return {
    loading: query.isLoading || updateLeadStatusMutation.isPending,
    error: query.error?.message || updateLeadStatusMutation.error?.message || null,
    getLeadsByPublisher,
    updateLeadStatus,
    leads: query.data || [],
    useLeadsQuery: () => query,
    useUpdateLeadStatusMutation: () => updateLeadStatusMutation
  };
};
