import { api } from './api';

export const searchAlertsApi = {
  getAll: () => api.get('/search-alerts'),
  create: (data) => api.post('/search-alerts', data),
  update: (id, data) => api.put(`/search-alerts/${id}`, data),
  delete: (id) => api.delete(`/search-alerts/${id}`),
  getReceivedAlerts: () => api.get('/my-received-alerts'),
};