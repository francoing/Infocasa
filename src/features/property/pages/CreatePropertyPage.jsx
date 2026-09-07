import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../api/api";
import Layout from "../../../common/components/Layout";
import PropertyForm from "../components/PropertyForm";
import { createProperty, uploadPropertyImages } from "../../../hooks/useProperties";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../hooks/useToast";

export default function CreatePropertyPage() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Extract the user's active subscription plan for the publication type selector
  const userPlan = user?.subscription?.plan || null;

  const handleSubmit = async (formData, imageFiles) => {
    try {
      setLoading(true);

      // formData ya es un FormData (construido en PropertyForm.handleSubmit)
      // Agregar userId y publishedAt
      formData.append("userId", user.id);
      formData.append("publishedAt", new Date().toISOString());

      const res = await createProperty(formData);

      const newProperty = res.data;

      // Subir imágenes nuevas al endpoint dedicado (el POST de la propiedad no las procesa).
      if (imageFiles && imageFiles.length > 0) {
        try {
          await uploadPropertyImages(newProperty.id, imageFiles);
        } catch (imgErr) {
          console.error("Error subiendo imágenes:", imgErr);
          toast.error("La propiedad se creó, pero hubo un problema al subir algunas fotos.");
        }
      }

      // Crear la publicación con el tipo seleccionado (basic/featured/premium)
      const publicationType = formData.get("publication_type") || "basic";
      try {
        await api.post("/publications", {
          property_id: newProperty.id,
          type: publicationType,
        });
      } catch (pubErr) {
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
