import { api } from "./api";

/**
 * Endpoints de la InfoCasa Guía (backend `guide/*`, spec `guide/directory`).
 * Solo se importa desde `src/hooks/` (boundary de lint).
 */
export const guideApi = {
  // Públicas
  categories: () => api.get("/guide/categories"),
  search: (params) => api.get("/guide/listings", { params }),
  listing: (slug) => api.get(`/guide/listings/${encodeURIComponent(slug)}`),
  registerView: (slug) => api.post(`/guide/listings/${encodeURIComponent(slug)}/view`, {}),
  sendInquiry: (slug, data) => api.post(`/guide/listings/${encodeURIComponent(slug)}/inquiries`, data),
  advertiser: (slug) => api.get(`/guide/advertisers/${encodeURIComponent(slug)}`),

  // Panel del anunciante
  myAdvertiser: () => api.get("/guide/me/advertiser"),
  createAdvertiser: (data) => api.post("/guide/me/advertiser", data),
  updateAdvertiser: (data) => api.put("/guide/me/advertiser", data),
  uploadLogo: (formData) => api.post("/guide/me/advertiser/logo", formData),
  myListings: () => api.get("/guide/me/listings"),
  myListing: (id) => api.get(`/guide/me/listings/${id}`),
  createListing: (data) => api.post("/guide/me/listings", data),
  updateListing: (id, data) => api.put(`/guide/me/listings/${id}`, data),
  deleteListing: (id) => api.delete(`/guide/me/listings/${id}`),
  toggleListing: (id) => api.patch(`/guide/me/listings/${id}/toggle-status`),
  duplicateListing: (id) => api.post(`/guide/me/listings/${id}/duplicate`, {}),
  uploadPhotos: (id, formData) => api.post(`/guide/me/listings/${id}/photos`, formData),
  reorderPhotos: (id, photoIds) => api.put(`/guide/me/listings/${id}/photos/order`, { photo_ids: photoIds }),
  deletePhoto: (id, photoId) => api.delete(`/guide/me/listings/${id}/photos/${photoId}`),
  myInquiries: (params) => api.get("/guide/me/inquiries", { params }),
  markInquiryRead: (id) => api.patch(`/guide/me/inquiries/${id}/read`),

  // Admin
  adminAdvertisers: (params) => api.get("/guide/admin/advertisers", { params }),
  adminSetAdvertiserStatus: (id, status) => api.patch(`/guide/admin/advertisers/${id}/status`, { status }),
  adminListings: (params) => api.get("/guide/admin/listings", { params }),
  adminUpdateListing: (id, data) => api.put(`/guide/admin/listings/${id}`, data),
  adminModerate:(id, action, reason) => api.patch(`/guide/admin/listings/${id}/moderate`, { action, reason }),
  adminDeleteListing: (id) => api.delete(`/guide/admin/listings/${id}`),
  adminCategories: () => api.get("/guide/admin/categories"),
  adminCreateCategory: (data) => api.post("/guide/admin/categories", data),
  adminUpdateCategory: (id, data) => api.put(`/guide/admin/categories/${id}`, data),
  adminCreateTrade: (data) => api.post("/guide/admin/trades", data),
  adminUpdateTrade: (id, data) => api.put(`/guide/admin/trades/${id}`, data),
};
