import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";
import { fetchPropertyById, mapProperty } from "./useProperties";
import { buildSearchQueryString } from "./properties.query";
import { useToast } from "./useToast";
import { useAuthStore } from "../store/useAuthStore";
import { DEFAULT_LEAD_FORM, leadFormForUser, buildRelatedFilters, rankRelatedProperties, optimisticToggleFavorite } from "./usePropertyDetail.helpers";

export const usePropertyDetail = (id) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [showGallery, setShowGallery] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const [formData, setFormData] = useState(DEFAULT_LEAD_FORM);

  // Si hay sesión, precarga el form de consulta con los datos del usuario (solo los
  // campos vacíos, para no pisar lo que ya haya escrito). Ver leadFormForUser.
  useEffect(() => {
    if (!user) return;
    const filled = leadFormForUser(user);
    setFormData((prev) => ({
      ...prev,
      name: prev.name || filled.name,
      email: prev.email || filled.email,
      phone: prev.phone || filled.phone,
    }));
  }, [user?.id]);

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

  // 3. Query para propiedades relacionadas: el pool se acota a la misma
  // operación y provincia de la propiedad vista (buildRelatedFilters); luego se
  // rankea por afinidad (tipo/ubicación/dormitorios). Ver usePropertyDetail.helpers.
  const relatedPropertiesQuery = useQuery({
    queryKey: ["properties", "related", id, property?.operationRaw, property?.locationDetails?.province],
    queryFn: async () => {
      const queryString = buildSearchQueryString(buildRelatedFilters(property));
      const res = await api.get(`/properties/search${queryString}`);
      return rankRelatedProperties((res.data || []).map((p) => mapProperty(p)), property);
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
      return { previousProperty: optimisticToggleFavorite(queryClient, id) };
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
      // Reset: si hay sesión, vuelve a quedar precargado con los datos del usuario.
      setFormData(user ? leadFormForUser(user) : DEFAULT_LEAD_FORM);
      toast.success("Consulta enviada con éxito. La inmobiliaria te contactará a la brevedad.");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: () => {
      toast.error("Error al enviar la consulta. Por favor, reintenta.");
    }
  });

  // Al cambiar de propiedad, resetear la mutación de lead: si no, el estado
  // "consulta enviada" (isSuccess) de una propiedad se muestra en todas las demás.
  useEffect(() => {
    submitLeadMutation.reset();
  }, [id]);

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
    // "Enviar otro mensaje": resetea la mutación → isSuccess vuelve a false y reaparece el form.
    setSubmitSuccess: submitLeadMutation.reset,
    submitError: submitLeadMutation.error?.message || null,
    handleSubmitLead,
    toggleFavorite,
    loadingFavorite: favoriteMutation.isPending
  };
};
