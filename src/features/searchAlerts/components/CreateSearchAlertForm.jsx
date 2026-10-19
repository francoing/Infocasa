import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateSearchAlert } from '../hooks/useSearchAlerts';
import { Home, DollarSign, MapPin, Ruler, ShieldCheck, Save, Loader2 } from 'lucide-react';

export default function CreateSearchAlertForm() {
  const navigate = useNavigate();
  const { mutate: createAlert, isPending, error } = useCreateSearchAlert();

  const [formData, setFormData] = useState({
    operation: 'rent',
    price_min: '',
    price_max: '',
    price_currency: 'ARS',
    rooms_min: '',
    bedrooms_min: '',
    bathrooms_min: '',
    area_total_min: '',
    area_covered_min: '',
    parking_spaces_min: '',
    condition: '',
    pets_allowed: false,
    professional_use: false,
    description: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Limpiamos strings vacíos para no romper validaciones numéricas
    const payload = Object.fromEntries(
      Object.entries(formData).filter(([_, v]) => v !== '')
    );

    createAlert(payload, {
      onSuccess: () => {
        alert('¡Aviso creado! Las inmobiliarias serán notificadas.');
        navigate('/dashboard');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">Publicar Aviso de Búsqueda</h2>
        <p className="text-slate-500 font-medium">Contanos qué estás buscando. Te avisaremos cuando una inmobiliaria publique algo que coincida.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-200 font-medium">
          {error.message || 'Error al crear el aviso'}
          {error.errors?.limit && <p className="font-bold mt-1">{error.errors.limit[0]}</p>}
        </div>
      )}

      {/* SECCIÓN 1: Operación y Presupuesto */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Operación y Presupuesto</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Operación</label>
            <select 
              name="operation"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
              value={formData.operation}
              onChange={handleChange}
            >
              <option value="rent">Alquilar</option>
              <option value="sale">Comprar</option>
              <option value="temporary_rent">Alquiler Temporal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Precio Mínimo</label>
            <input 
              type="number" name="price_min"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
              value={formData.price_min} onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Precio Máximo</label>
            <input 
              type="number" name="price_max"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
              value={formData.price_max} onChange={handleChange}
            />
          </div>
        </div>

        <div className="mt-6 w-full md:w-1/3">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Moneda</label>
          <select 
            name="price_currency"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
            value={formData.price_currency} onChange={handleChange}
          >
            <option value="ARS">Pesos Argentinos (ARS)</option>
            <option value="USD">Dólares (USD)</option>
          </select>
        </div>
      </section>

      {/* SECCIÓN 2: Detalles Técnicos y Superficie */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Home className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Detalles Técnicos</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Ambientes</label>
            <input type="number" name="rooms_min" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700" value={formData.rooms_min} onChange={handleChange}/>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Dormitorios</label>
            <input type="number" name="bedrooms_min" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700" value={formData.bedrooms_min} onChange={handleChange}/>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Baños</label>
            <input type="number" name="bathrooms_min" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700" value={formData.bathrooms_min} onChange={handleChange}/>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Cocheras</label>
            <input type="number" name="parking_spaces_min" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700" value={formData.parking_spaces_min} onChange={handleChange}/>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Ruler className="w-4 h-4" /> Superficie Total Mín. (m²)</label>
            <input type="number" name="area_total_min" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700" value={formData.area_total_min} onChange={handleChange}/>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Ruler className="w-4 h-4" /> Superficie Cubierta Mín. (m²)</label>
            <input type="number" name="area_covered_min" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700" value={formData.area_covered_min} onChange={handleChange}/>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: Estado y Normas */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Estado y Normas</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Estado de la propiedad</label>
            <select name="condition" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700" value={formData.condition} onChange={handleChange}>
              <option value="">Indistinto</option>
              <option value="a_estrenar">A estrenar</option>
              <option value="excelente">Excelente</option>
              <option value="muy_bueno">Muy bueno</option>
              <option value="bueno">Bueno</option>
              <option value="a_refaccionar">A refaccionar</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors w-full">
            <input type="checkbox" name="pets_allowed" checked={formData.pets_allowed} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
            <span className="font-bold text-sm text-slate-700">Acepta Mascotas</span>
          </label>
          
          <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors w-full">
            <input type="checkbox" name="professional_use" checked={formData.professional_use} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
            <span className="font-bold text-sm text-slate-700">Apto Profesional</span>
          </label>
        </div>
      </section>

      {/* SECCIÓN 4: Comentarios Adicionales */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Comentarios Adicionales</h3>
        </div>
        <textarea 
          name="description"
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700 h-32 resize-none"
          placeholder="Ej: Busco con patio, que acepten mascotas y esté cerca del centro..."
          value={formData.description} onChange={handleChange}
        />
      </section>

      {/* BOTÓN DE ENVÍO */}
      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={isPending}
          className="bg-blue-600 text-white px-12 py-5 rounded-3xl font-black text-lg hover:bg-blue-700 shadow-2xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-6 h-6" /> Publicar Aviso</>}
        </button>
      </div>
    </form>
  );
}
