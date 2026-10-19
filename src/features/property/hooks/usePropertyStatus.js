import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../api/api';

export const useTogglePropertyStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/properties/${id}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me_properties'] });
    },
  });
};