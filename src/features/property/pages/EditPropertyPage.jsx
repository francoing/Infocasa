import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../common/components/Layout";
import PropertyForm from "../components/PropertyForm";
import { getPropertyById, updateProperty } from "../../../hooks/useProperties";
import { useAuth } from "../../../hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function EditPropertyPage() {
  const { id } = useParams();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await getPropertyById(id);
        // Validar que la propiedad pertenezca al usuario o sea admin
        if (data.userId !== user.id && user.role !== 'admin') {
          alert("No tienes permiso para editar esta propiedad.");
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
  }, [id, user.id, user.role, navigate]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      await updateProperty(id, formData);
      navigate("/dashboard");
    } catch (err) {
      alert("Error al actualizar la propiedad.");
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
