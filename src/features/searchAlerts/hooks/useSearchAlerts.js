import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchAlertsApi } from '../../../api/searchAlerts';

export const useMySearchAlerts = () => {
  return useQuery({
    queryKey: ['search-alerts'],
    queryFn: async () => {
      const response = await searchAlertsApi.getAll();
      // Laravel con Resources envuelve en { data: [...] }, extraemos el array
      return response.data;
    },
  });
};

export const useCreateSearchAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: searchAlertsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-alerts'] });
    },
  });
};

export const useDeleteSearchAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => searchAlertsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-alerts'] });
    },
  });
};

export const useReceivedSearchAlerts = () => {
  return useQuery({
    queryKey: ['received-search-alerts'],
    queryFn: async () => {
      const response = await searchAlertsApi.getReceivedAlerts();
      // El endpoint devuelve un array directo (response.json() ya lo parseó)
      return Array.isArray(response) ? response : (response.data ?? []);
    },
  });
};
