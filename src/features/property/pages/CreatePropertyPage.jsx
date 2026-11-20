import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../common/components/Layout";
import PropertyForm from "../components/PropertyForm";
import { createProperty, uploadPropertyImages, uploadPropertyVideos } from "../../../hooks/useProperties";
import ArchivePolicyNote from "../../../common/components/ArchivePolicyNote";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../hooks/useToast";

export default function CreatePropertyPage() {
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Extract the user's active subscription plan for the publication type selector
  const userPlan = user?.subscription?.plan || null;

  const handleSubmit = async (formData, imageFiles, _imageOps, videoOps = {}) => {
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

      // Videos: se suben en partes y el servidor los comprime a 720p en segundo plano.
      const videoFiles = videoOps.videoFiles || [];
      if (videoFiles.length > 0) {
        const failed = await uploadPropertyVideos(newProperty.id, videoFiles, (n, total, fraction) =>
          setUploadStatus(`Subiendo video ${n} de ${total}… ${Math.round(fraction * 100)}%`),
        );
        setUploadStatus("");
        if (failed > 0) {
          toast.error("La propiedad se creó, pero no se pudieron subir algunos videos. Podés volver a intentarlo editándola.");
        }
      }

      // El destacado y las InfoMonedas elegidos viajan en el mismo POST de la propiedad.

      // El alta pudo usar destacados o InfoMonedas: refrescamos los saldos del usuario.
      await refreshUser?.();

      toast.success("Propiedad publicada correctamente.");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error al crear la propiedad:", err);
      toast.error(err.message || "Error al crear la propiedad.");
    } finally {
      setLoading(false);
      setUploadStatus("");
    }
  };

  return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Publicar Nueva Propiedad</h1>
          <p className="text-slate-500 mt-2">Completa la información detallada para atraer a potenciales clientes.</p>
          <ArchivePolicyNote className="mt-4" />
        </div>

        <PropertyForm 
          onSubmit={handleSubmit} 
          onCancel={() => navigate("/dashboard")} 
          loading={loading}
          uploadStatus={uploadStatus}
          userPlan={userPlan}
        />
      </div>
  );
}
