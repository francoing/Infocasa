import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";
import { fetchPropertyById, mapProperty } from "./useProperties";
import { useToast } from "./useToast";

export const usePropertyDetail = (id) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [showGallery, setShowGallery] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    message: "Hola, vi esta propiedad en InfoCasa y me gustaría tener más información." 
  });

  // 1. Query para el detalle de la propiedad
  const propertyQuery = useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchPropertyById(id),
    enabled: !!id
  });

  const property = propertyQuery.data || null;
  const publisher = property?.owner || (property?.userId ? { id: property.userId, name: "Propietario" } : null);

  // 2. Mutación para registrar visitas a la propiedad
  const registerViewMutation = useMutation({
    mutationFn: () => api.post(`/properties/${id}/view`),
  });

  // Registrar visita en el mount/cambio de ID
  useEffect(() => {
    if (id) {
      registerViewMutation.mutate();
    }
  }, [id]);

  // 3. Query para propiedades relacionadas
  const relatedPropertiesQuery = useQuery({
    queryKey: ["properties", "related", id],
    queryFn: async () => {
      const res = await api.get("/properties");
      const rawProps = res.data || [];
      const allProps = rawProps.map(p => mapProperty(p));
      
      if (!property) return [];

      const currentType = property.type;
      const currentLocation = property.location;
      const currentBedrooms = property.bedrooms;
      const currentStatus = property.status;

      return allProps
        .filter(p => p.id !== property.id)
        .map(p => {
          let score = 0;
          if (p.type && currentType && p.type.toLowerCase() === currentType.toLowerCase()) score += 3;
          if (p.status && currentStatus && p.status.toLowerCase() === currentStatus.toLowerCase()) score += 2;
          if (p.location && currentLocation) {
            const pLoc = p.location.toLowerCase();
            const cLoc = currentLocation.toLowerCase();
            if (pLoc.includes(cLoc) || cLoc.includes(pLoc)) {
              score += 3;
            }
          }
          if (p.bedrooms === currentBedrooms) {
            score += 2;
          } else if (Math.abs((p.bedrooms || 0) - (currentBedrooms || 0)) <= 1) {
            score += 1;
          }
          return { property: p, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(item => item.property);
    },
    enabled: !!property,
    staleTime: 5 * 60 * 1000
  });

  // 4. Mutación para alternar favorito con actualizaciones optimistas
  const favoriteMutation = useMutation({
    mutationFn: async (isFavorited) => {
      if (isFavorited) {
        return api.delete(`/properties/${id}/favorite`);
      } else {
        return api.post(`/properties/${id}/favorite`);
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["property", id] });
      const previousProperty = queryClient.getQueryData(["property", id]);
      
      if (previousProperty) {
        queryClient.setQueryData(["property", id], {
          ...previousProperty,
          isFavorited: !previousProperty.isFavorited,
          favoritesCount: previousProperty.isFavorited
            ? Math.max(0, (previousProperty.favoritesCount || 0) - 1)
            : (previousProperty.favoritesCount || 0) + 1
        });
      }
      return { previousProperty };
    },
    onError: (err, variables, context) => {
      if (context?.previousProperty) {
        queryClient.setQueryData(["property", id], context.previousProperty);
      }
      toast.error("Debes iniciar sesión para guardar favoritos.");
    },
    onSuccess: (data, variables) => {
      if (variables) {
        toast.info("Eliminado de favoritos");
      } else {
        toast.success("Agregado a favoritos");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["property", id] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    }
  });

  const toggleFavorite = useCallback(async () => {
    if (!property) return;
    favoriteMutation.mutate(property.isFavorited);
  }, [property, favoriteMutation]);

  // 5. Mutación para enviar Leads
  const submitLeadMutation = useMutation({
    mutationFn: async (leadData) => {
      return api.post("/leads", leadData);
    },
    onSuccess: () => {
      setFormData({ 
        name: "", 
        email: "", 
        phone: "", 
        message: "Hola, vi esta propiedad en InfoCasa y me gustaría tener más información." 
      });
      toast.success("Consulta enviada con éxito. La inmobiliaria te contactará a la brevedad.");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: () => {
      toast.error("Error al enviar la consulta. Por favor, reintenta.");
    }
  });

  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Por favor completa todos los campos obligatorios.");
      return;
    }
    submitLeadMutation.mutate({
      property_id: id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message
    });
  };

  const loading = propertyQuery.isLoading || relatedPropertiesQuery.isLoading;

  return {
    property,
    publisher,
    loading,
    showGallery,
    setShowGallery,
    activeImage,
    setActiveImage,
    relatedProperties: relatedPropertiesQuery.data || [],
    formData,
    setFormData,
    isSubmitting: submitLeadMutation.isPending,
    submitSuccess: submitLeadMutation.isSuccess,
    submitError: submitLeadMutation.error?.message || null,
    handleSubmitLead,
    toggleFavorite,
    loadingFavorite: favoriteMutation.isPending
  };
};
