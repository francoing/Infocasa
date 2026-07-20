import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";
import { queryClient } from "../lib/queryClient";
import { buildProperty } from "./property.mappers";
import { buildSearchQueryString } from "./properties.query";

/** Normaliza una propiedad del backend (o `{data}`) al shape que consume la UI. */
export const mapProperty = (p) => {
  if (!p) return null;
  return buildProperty(p.data ? p.data : p);
};

export const useProperties = (filters = {}) => {
  const queryKey = ["properties", "search", filters];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      // Moneda nativa (sin conversión) y orden secundario por precio los resuelve
      // buildSearchQueryString; el backend impone "destacadas primero". Ver api-contract.md.
      const queryString = buildSearchQueryString(filters);
      const res = await api.get(`/properties/search${queryString}`);
      const rawProperties = res.data || [];
      return rawProperties.map(p => mapProperty(p));
    },
    staleTime: 5 * 60 * 1000,
  });

  return { 
    data: query.data || [], 
    loading: query.isLoading, 
    error: query.error?.message || null,
    refresh: () => queryClient.invalidateQueries({ queryKey }) 
  };
};

export const fetchPropertyById = async (id) => {
  const res = await api.get(`/properties/${id}`);
  return mapProperty(res.data);
};

export const getPropertyById = async (id) => {
  return queryClient.fetchQuery({
    queryKey: ["property", id],
    queryFn: () => fetchPropertyById(id),
    staleTime: 5 * 60 * 1000
  });
};

export const getPublisherById = async (userId) => {
  return { id: userId, name: "Propietario" };
};

export const createProperty = async (propertyData) => {
  // propertyData puede ser FormData (multipart) u objeto JSON
  const res = await api.post("/properties", propertyData);
  queryClient.invalidateQueries({ queryKey: ["properties"] });
  queryClient.invalidateQueries({ queryKey: ["me_properties"] });
  return res;
};

export const updateProperty = async (id, propertyData) => {
  // propertyData puede ser FormData (multipart) u objeto JSON
  const res = await api.put(`/properties/${id}`, propertyData);
  queryClient.invalidateQueries({ queryKey: ["properties"] });
  queryClient.invalidateQueries({ queryKey: ["property", id] });
  queryClient.invalidateQueries({ queryKey: ["me_properties"] });
  return res;
};

/**
 * Sube archivos de imagen al endpoint dedicado (el POST/PUT de la propiedad no procesa imágenes).
 * Devuelve el array de imágenes creadas (en el orden enviado, cada una con `id`) para poder
 * mapear los Files nuevos a sus IDs al fijar el orden. Ver spec property/image_management.
 */
export const uploadPropertyImages = async (propertyId, files) => {
  if (!files || files.length === 0) return [];
  const fd = new FormData();
  files.forEach(file => fd.append("files[]", file));
  const res = await api.post(`/properties/${propertyId}/images`, fd);
  queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
  queryClient.invalidateQueries({ queryKey: ["properties"] });
  queryClient.invalidateQueries({ queryKey: ["me_properties"] });
  return res.data || [];
};

/** Borra una imagen existente de una propiedad. El backend promueve otra a portada si hacía falta. */
export const deletePropertyImage = async (propertyId, imageId) => {
  const res = await api.delete(`/properties/${propertyId}/images/${imageId}`);
  queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
  queryClient.invalidateQueries({ queryKey: ["properties"] });
  queryClient.invalidateQueries({ queryKey: ["me_properties"] });
  return res;
};

/** Fija el orden de las imágenes; la primera del array queda como portada (`is_cover`). */
export const updatePropertyImagesOrder = async (propertyId, imageIds) => {
  if (!imageIds || imageIds.length === 0) return null;
  const res = await api.put(`/properties/${propertyId}/images/order`, { image_ids: imageIds });
  queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
  queryClient.invalidateQueries({ queryKey: ["properties"] });
  queryClient.invalidateQueries({ queryKey: ["me_properties"] });
  return res;
};

export const deleteProperty = async (id) => {
  const res = await api.delete(`/properties/${id}`);
  queryClient.invalidateQueries({ queryKey: ["properties"] });
  queryClient.invalidateQueries({ queryKey: ["property", id] });
  queryClient.invalidateQueries({ queryKey: ["me_properties"] });
  return res;
};

export const getPropertiesByUser = async (userId, filters = {}) => {
  let queryParams = [];
  if (filters.search) {
    queryParams.push(`search=${encodeURIComponent(filters.search)}`);
  }
  if (filters.status) {
    queryParams.push(`status=${encodeURIComponent(filters.status)}`);
  }
  if (filters.operation) {
    queryParams.push(`operation=${encodeURIComponent(filters.operation)}`);
  }
  const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
  const res = await api.get(`/me/properties${queryString}`);
  return (res.data || []).map(p => mapProperty(p));
};
