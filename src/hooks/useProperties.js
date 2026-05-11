import { useEffect, useState, useCallback } from "react";
import { api } from "../api/api";

export const useProperties = (filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      
      // Construir query string para json-server
      let endpoint = "/properties?";
      
      if (filters.location) {
        endpoint += `location_like=${encodeURIComponent(filters.location)}&`;
      }
      
      if (filters.type && filters.type !== "Todos") {
        endpoint += `type=${encodeURIComponent(filters.type.toLowerCase())}&`;
      }
      
      if (filters.minPrice) {
        endpoint += `price_gte=${filters.minPrice}&`;
      }
      
      if (filters.maxPrice) {
        endpoint += `price_lte=${filters.maxPrice}&`;
      }

      if (filters.sort) {
        if (filters.sort === 'price_asc') {
          endpoint += '_sort=price&_order=asc&';
        } else if (filters.sort === 'price_desc') {
          endpoint += '_sort=price&_order=desc&';
        } else if (filters.sort === 'recent') {
          endpoint += '_sort=createdAt&_order=desc&';
        }
      }

      const properties = await api.get(endpoint);
      setData(properties);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.location, filters.type, filters.minPrice, filters.maxPrice, filters.sort]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { 
    data, 
    loading, 
    error,
    refresh: fetchProperties 
  };
};

export const getPropertyById = async (id) => {
  return await api.get(`/properties/${id}`);
};

export const getPublisherById = async (userId) => {
  return await api.get(`/users/${userId}`);
};

export const createProperty = async (propertyData) => {
  return await api.post("/properties", {
    ...propertyData,
    createdAt: new Date().toISOString()
  });
};

export const updateProperty = async (id, propertyData) => {
  return await api.patch(`/properties/${id}`, propertyData);
};

export const deleteProperty = async (id) => {
  return await api.delete(`/properties/${id}`);
};

export const getPropertiesByUser = async (userId) => {
  return await api.get(`/properties?userId=${userId}`);
};
