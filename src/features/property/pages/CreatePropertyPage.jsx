import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../common/components/Layout";
import PropertyForm from "../components/PropertyForm";
import { createProperty } from "../../../hooks/useProperties";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../hooks/useToast";
import { api } from "../../../api/api";

export default function CreatePropertyPage() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Extract the user's active subscription plan for the publication type selector
  const userPlan = user?.subscription?.plan || null;

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);

      // Separamos la galería y el tipo de publicación del payload principal
      const { gallery, publication_type, ...textData } = formData;

      const res = await createProperty({
        ...textData,
        userId: user.id,
        publishedAt: new Date().toISOString()
      });

      const newProperty = res.data;

      // Si hay imágenes nuevas (instancias de File), subirlas
      if (gallery && gallery.length > 0) {
        const imageFiles = gallery.filter(item => item instanceof File);
        if (imageFiles.length > 0) {
          const uploadFormData = new FormData();
          imageFiles.forEach(file => {
            uploadFormData.append("files[]", file);
          });
          await api.post(`/properties/${newProperty.id}/images`, uploadFormData);
        }
      }

      // Crear la publicación con el tipo seleccionado (basic/featured/premium)
      try {
        await api.post("/publications", {
          property_id: newProperty.id,
          type: publication_type || "basic",
        });
      } catch (pubErr) {
        // Si el usuario no tiene suscripción activa, avisamos pero no bloqueamos
        if (pubErr.status === 403) {
          toast.error("Propiedad creada, pero no tienes una suscripción activa para publicarla. Activa un plan desde tu panel.");
          navigate("/dashboard");
          return;
        }
        throw pubErr;
      }

      toast.success("Propiedad publicada correctamente.");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error al crear la propiedad:", err);
      toast.error(err.message || "Error al crear la propiedad.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Publicar Nueva Propiedad</h1>
          <p className="text-slate-500 mt-2">Completa la información detallada para atraer a potenciales clientes.</p>
        </div>


        <PropertyForm 
          onSubmit={handleSubmit} 
          onCancel={() => navigate("/dashboard")} 
          loading={loading}
          userPlan={userPlan}
        />
      </div>
    </Layout>
  );
}
