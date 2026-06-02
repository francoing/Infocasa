import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../common/components/Layout";
import PropertyForm from "../components/PropertyForm";
import { getPropertyById, updateProperty } from "../../../hooks/useProperties";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../hooks/useToast";
import { Loader2 } from "lucide-react";
import { api } from "../../../api/api";

export default function EditPropertyPage() {
  const { id } = useParams();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!user) return;
    const fetchProperty = async () => {
      try {
        const data = await getPropertyById(id);
        // Validar que la propiedad pertenezca al usuario o sea admin
        if (data.owner?.id !== user.id && user.role !== 'admin') {
          toast.error("No tienes permiso para editar esta propiedad.");
          navigate("/dashboard");
          return;
        }
        setInitialData(data);
      } catch (err) {
        console.error("Error fetching property:", err);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, user?.id, user?.role, navigate]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      
      // Separamos la galería del payload de texto
      const { gallery, ...textData } = formData;

      // 1. Actualizar datos de texto
      await updateProperty(id, textData);

      // 2. Gestionar eliminación de imágenes viejas
      const originalImages = initialData.images || [];
      const currentGalleryUrls = gallery.filter(item => typeof item === 'string');
      const deletedImages = originalImages.filter(origImg => !currentGalleryUrls.includes(origImg.url));

      for (const deletedImg of deletedImages) {
        await api.delete(`/properties/${id}/images/${deletedImg.id}`);
      }

      // 3. Gestionar subida de imágenes nuevas (instancias de File)
      const newImageFiles = gallery.filter(item => item instanceof File);
      if (newImageFiles.length > 0) {
        const uploadFormData = new FormData();
        newImageFiles.forEach(file => {
          uploadFormData.append("files[]", file);
        });
        
        await api.post(`/properties/${id}/images`, uploadFormData);
      }

      toast.success("Propiedad actualizada correctamente.");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error al actualizar la propiedad:", err);
      toast.error("Error al actualizar la propiedad.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Editar Propiedad</h1>
          <p className="text-slate-500 mt-2">Actualiza los datos de tu publicación.</p>
        </div>
        <PropertyForm 
          initialData={initialData}
          onSubmit={handleSubmit} 
          onCancel={() => navigate("/dashboard")} 
          loading={submitting}
        />
      </div>
    </Layout>
  );
}
