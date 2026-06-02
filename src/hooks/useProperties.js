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

export const mapProperty = (p) => {
  if (!p) return null;
  const item = p.data ? p.data : p;
  
  let imageUrl = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6"; // fallback
  if (item.images && item.images.length > 0) {
    const cover = item.images.find(img => img.is_cover) || item.images[0];
    imageUrl = cover.url;
  }

  let locationStr = "Ubicación no especificada";
  if (item.location) {
    if (typeof item.location === "string") {
      locationStr = item.location;
    } else if (typeof item.location === "object") {
      const parts = [item.location.neighborhood, item.location.city, item.location.province, item.location.country].filter(Boolean);
      if (parts.length > 0) {
        locationStr = parts.join(", ");
      }
    }
  }

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    price: parseFloat(item.price?.usd || item.price?.amount || 0),
    priceCurrency: item.price?.currency || "USD",
    operation: item.operation === "sale" ? "Venta" : item.operation === "rent" ? "Alquiler" : "Desarrollo",
    operationRaw: item.operation,
    rooms: item.dimensions?.rooms || 0,
    bedrooms: item.dimensions?.bedrooms || 0,
    bathrooms: item.dimensions?.bathrooms || 0,
    areaTotal: parseFloat(item.dimensions?.area_total || 0),
    areaCovered: parseFloat(item.dimensions?.area_covered || 0),
    location: locationStr,
    locationDetails: item.location,
    type: item.property_type?.name || "Departamento",
    typeId: item.property_type?.id,
    agency: item.agency,
    owner: item.owner,
    imageUrl,
    images: item.images || [],
    priceHistory: (item.price_history || []).map(h => ({
      oldPrice: parseFloat(h.old_price),
      newPrice: parseFloat(h.new_price),
      percentage: parseFloat(h.percentage),
      date: h.changed_at
    })),
    showExactAddress: item.show_exact_address,
    latitude: item.coordinates?.latitude || item.location?.latitude || null,
    longitude: item.coordinates?.longitude || item.location?.longitude || null,
    favoritesCount: item.favorites_count || 0,
    viewsCount: item.views_count || 0,
    isFavorited: item.is_favorited || false,
    status: item.status,
    createdAt: item.created_at
  };
};

export const useProperties = (filters = {}) => {
  const queryClient = getQueryClient();
  const queryKey = ["properties", "search", filters];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      let queryParams = [];
      
      if (filters.location) {
        queryParams.push(`city=${encodeURIComponent(filters.location)}`);
      }
      
      if (filters.type && filters.type !== "Todos") {
        let typeId = filters.type.toLowerCase() === 'departamento' ? 1 : filters.type.toLowerCase() === 'casa' ? 2 : null;
        if (typeId) {
          queryParams.push(`property_type_id=${typeId}`);
        }
      }
      
      if (filters.minPrice) {
        queryParams.push(`price_min=${filters.minPrice}`);
      }
      
      if (filters.maxPrice) {
        queryParams.push(`price_max=${filters.maxPrice}`);
      }

      if (filters.operation) {
        let op = filters.operation === 'Alquiler' ? 'rent' : filters.operation === 'Venta' ? 'sale' : filters.operation;
        queryParams.push(`operation=${op}`);
      }

      if (filters.page) {
        queryParams.push(`page=${filters.page}`);
        queryParams.push(`per_page=6`);
      } else {
        queryParams.push(`per_page=12`);
      }

      const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
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
  const queryClient = getQueryClient();
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
  const queryClient = getQueryClient();
  const res = await api.post("/properties", propertyData);
  queryClient.invalidateQueries({ queryKey: ["properties"] });
  queryClient.invalidateQueries({ queryKey: ["me_properties"] });
  return res;
};

export const updateProperty = async (id, propertyData) => {
  const queryClient = getQueryClient();
  const res = await api.put(`/properties/${id}`, propertyData);
  queryClient.invalidateQueries({ queryKey: ["properties"] });
  queryClient.invalidateQueries({ queryKey: ["property", id] });
  queryClient.invalidateQueries({ queryKey: ["me_properties"] });
  return res;
};

export const deleteProperty = async (id) => {
  const queryClient = getQueryClient();
  const res = await api.delete(`/properties/${id}`);
  queryClient.invalidateQueries({ queryKey: ["properties"] });
  queryClient.invalidateQueries({ queryKey: ["property", id] });
  queryClient.invalidateQueries({ queryKey: ["me_properties"] });
  return res;
};

export const getPropertiesByUser = async (userId) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery({
    queryKey: ["me_properties"],
    queryFn: async () => {
      const res = await api.get("/me/properties");
      return (res.data || []).map(p => mapProperty(p));
    },
    staleTime: 60 * 1000
  });
};
