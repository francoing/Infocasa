import React, { useState, useEffect } from "react";
import { Camera, MapPin, Bed, Bath, Maximize, Loader2, Save, X, Sparkles } from "lucide-react";
import ImageUploader from "./ImageUploader";

const INITIAL_STATE = {
  title: "",
  description: "",
  price: "",
  location: "",
  address: "",
  type: "casa",
  status: "venta",
  bedrooms: "",
  bathrooms: "",
  area: "",
  imageUrl: "",
  gallery: [],
  features: [],
  featured: false
};

export default function PropertyForm({ initialData = null, onSubmit, onCancel, loading = false }) {
  const [formData, setFormData] = useState(initialData || INITIAL_STATE);
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImagesChange = (images) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: images.length > 0 ? images[0] : "", // La primera imagen es la principal
      gallery: images // Todas las imágenes forman la galería
    }));
  };

  const handleAddFeature = (e) => {
    if (e) e.preventDefault();
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      price: Number(formData.price),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      area: Number(formData.area)
    };
    onSubmit(finalData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      
      {/* Photo Uploader Section */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Camera className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Fotos de la propiedad</h3>
        </div>
        <ImageUploader 
          images={formData.gallery} 
          onChange={handleImagesChange} 
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Basic Info */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Información Principal</h3>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Título de la publicación</label>
            <input 
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
              placeholder="Ej: Mansión Moderna en Nordelta"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Descripción detallada</label>
            <textarea 
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
              placeholder="Describe las características principales..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none">
                <option value="casa">Casa</option>
                <option value="departamento">Departamento</option>
                <option value="quinta">Quinta</option>
                <option value="lote">Lote</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Estado</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none">
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Precio (USD)</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
              <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full pl-10 pr-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-black text-xl" placeholder="0" />
            </div>
          </div>
        </section>

        {/* Location & Details */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Ubicación y Comodidades</h3>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Ciudad / Zona</label>
            <input required name="location" value={formData.location} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none" placeholder="Ej: Nordelta, Tigre" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Maximize className="w-3 h-3" /> m²</label>
              <input required type="number" name="area" value={formData.area} onChange={handleChange} className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Bed className="w-3 h-3" /> Dorm.</label>
              <input required type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Bath className="w-3 h-3" /> Baños</label>
              <input required type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Características Extras</label>
            <div className="flex gap-2">
              <input 
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none"
                placeholder="Piscina, Parrilla..."
              />
              <button type="button" onClick={handleAddFeature} className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all">OK</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.features.map((feature, index) => (
                <span key={index} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-black border border-blue-100 uppercase tracking-tighter">
                  {feature}
                  <button type="button" onClick={() => removeFeature(index)} className="hover:text-red-600"><X className="w-4 h-4" /></button>
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Final Actions */}
      <div className="flex flex-col md:flex-row justify-end gap-6 pt-10 border-t border-slate-200">
        <button type="button" onClick={onCancel} className="px-10 py-5 rounded-3xl font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest text-sm">Cancelar</button>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white px-12 py-5 rounded-3xl font-black text-lg hover:bg-blue-700 shadow-2xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-6 h-6" /> Guardar Publicación</>}
        </button>
      </div>
    </form>
  );
}
