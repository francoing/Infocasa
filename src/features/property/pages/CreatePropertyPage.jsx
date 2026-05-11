import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../common/components/Layout";
import PropertyForm from "../components/PropertyForm";
import { createProperty } from "../../../hooks/useProperties";
import { useAuth } from "../../../hooks/useAuth";
import { usePlans } from "../../../hooks/usePlans";
import { AlertCircle } from "lucide-react";

export default function CreatePropertyPage() {
  const [loading, setLoading] = useState(false);
  const [limitError, setLimitError] = useState(null);
  const { user } = useAuth();
  const { validateLimit } = usePlans();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setLimitError(null);
      
      // Validación de plan profesional
      const validation = await validateLimit(user.id);
      
      if (!validation.allowed) {
        setLimitError(validation.message);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      await createProperty({
        ...formData,
        userId: user.id
      });
      navigate("/dashboard");
    } catch (err) {
      alert("Error al crear la propiedad.");
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

        {limitError && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-3xl flex items-start gap-4">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-red-900">Límite de publicaciones alcanzado</h4>
              <p className="text-red-700 text-sm mt-1">{limitError}</p>
              <button 
                onClick={() => navigate("/dashboard")}
                className="mt-4 text-xs font-bold uppercase tracking-widest text-red-900 hover:underline"
              >
                Ver mi plan actual
              </button>
            </div>
          </div>
        )}

        <PropertyForm 
          onSubmit={handleSubmit} 
          onCancel={() => navigate("/dashboard")} 
          loading={loading}
        />
      </div>
    </Layout>
  );
}
