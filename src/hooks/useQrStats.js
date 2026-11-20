import { useMutation } from '@tanstack/react-query';
import { api } from '../api/api';

// Hook para las estadísticas del QR
export const useQrStats = () => {
  return useMutation({
    mutationFn: async (propertyId) => {
      return api.get(`/properties/${propertyId}/qr-stats`);
    },
  });
};

