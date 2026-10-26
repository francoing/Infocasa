import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/api';

// Hook para las estadísticas del QR
export const useQrStats = () => {
  return useMutation({
    mutationFn: async (propertyId) => {
      return api.get(`/properties/${propertyId}/qr-stats`);
    },
  });
};

// Hook para pausar/activar la renovación automática
export const useToggleAutoRenew = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return api.patch('/subscriptions/toggle-auto-renew');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth_me'] });
    },
  });
};
