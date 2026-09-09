import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../common/components/Layout";
import Loader from "../../../common/components/Loader";
import PropertyForm from "../components/PropertyForm";
import { getPropertyById, updateProperty, uploadPropertyImages, deletePropertyImage, updatePropertyImagesOrder } from "../../../hooks/useProperties";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../hooks/useToast";

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

  const handleSubmit = async (formData, imageFiles, imageOps = {}) => {
    try {
      setSubmitting(true);

      // formData es un FormData del PropertyForm
      // Actualizar la propiedad con FormData
      await updateProperty(id, formData);

      // Gestión de imágenes (borrar → subir nuevas → fijar orden). Ver spec property/image_management.
      try {
        const { deletedImageIds = [], order = [], changed = false } = imageOps;

        // 1. Borrar las imágenes existentes que el usuario quitó.
        for (const imageId of deletedImageIds) {
          await deletePropertyImage(id, imageId);
        }

        // 2. Subir las imágenes nuevas; devuelven sus IDs en el orden enviado.
        let uploaded = [];
        if (imageFiles && imageFiles.length > 0) {
          uploaded = await uploadPropertyImages(id, imageFiles);
        }

        // 3. Fijar orden + portada según la UI (la 1ª del array es la portada).
        if (changed && order.length > 0) {
          const uploadedIds = uploaded.map(img => img.id);
          let cursor = 0;
          const finalIds = order
            .map(item => (item.type === "new" ? uploadedIds[cursor++] : item.id))
            .filter(imageId => imageId != null);
          if (finalIds.length > 1) {
            await updatePropertyImagesOrder(id, finalIds);
          }
        }
      } catch (imgErr) {
        console.error("Error gestionando imágenes:", imgErr);
        toast.error("La propiedad se actualizó, pero hubo un problema al guardar algunas fotos.");
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
        <Loader inline className="min-h-[60vh]" />
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
