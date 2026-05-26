import { useState, useEffect, useCallback } from "react";
import { api } from "../api/api";
import { getPropertyById, getPublisherById } from "./useProperties";
import { useToast } from "./useToast";

export const usePropertyDetail = (id) => {
  const toast = useToast();
  
  const [property, setProperty] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProperties, setRelatedProperties] = useState([]);

  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    message: "Hola, vi esta propiedad en InfoCasa y me gustaría tener más información." 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitError("Por favor completa los campos obligatorios.");
      toast.error("Por favor completa todos los campos obligatorios.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await api.post("/leads", {
        propertyId: property.id,
        publisherId: property.userId,
        ...formData,
        status: "pendiente",
        createdAt: new Date().toISOString()
      });
      setSubmitSuccess(true);
      setFormData({ 
        name: "", 
        email: "", 
        phone: "", 
        message: "Hola, vi esta propiedad en InfoCasa y me gustaría tener más información." 
      });
      toast.success("Consulta enviada con éxito. La inmobiliaria te contactará a la brevedad.");
    } catch (err) {
      setSubmitError("Hubo un error al enviar tu consulta. Intenta nuevamente.");
      toast.error("Error al enviar la consulta. Por favor, reintenta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const propData = await getPropertyById(id);
      setProperty(propData);
      
      if (propData.userId) {
        const userData = await getPublisherById(propData.userId);
        setPublisher(userData);
      }

      // Fetch related properties and rank them
      const allProps = await api.get("/properties");
      const currentType = propData.type;
      const currentLocation = propData.location;
      const currentBedrooms = propData.bedrooms;
      const currentStatus = propData.status;

      const related = allProps
        .filter(p => p.id !== propData.id)
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

      setRelatedProperties(related);
    } catch (err) {
      console.error("Error fetching property:", err);
      toast.error("Error al cargar la información detallada del inmueble.");
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchData();
  }, [id, fetchData]);

  return {
    property,
    publisher,
    loading,
    showGallery,
    setShowGallery,
    activeImage,
    setActiveImage,
    relatedProperties,
    formData,
    setFormData,
    isSubmitting,
    submitSuccess,
    setSubmitSuccess,
    submitError,
    handleSubmitLead
  };
};
