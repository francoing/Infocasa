import React, { useState, useEffect } from "react";
import { Camera, MapPin, Bed, Bath, Maximize, Loader2, Save, X, Sparkles, Zap, Star, Crown } from "lucide-react";
import ImageUploader from "./ImageUploader";
import MapLocationSelector from "./MapLocationSelector";
import { api } from "../../../api/api";

const INITIAL_STATE = {
  title: "",
  description: "",
  price: "",
  price_currency: "USD",
  location_id: "",
  property_type_id: "",
  status: "venta", // operation
  bedrooms: "",
  bathrooms: "",
  area: "",
  imageUrl: "",
  gallery: [],
  features: [],
  featured: false,
  latitude: null,
  longitude: null,
  showExactAddress: true,
  publication_type: "basic"
};

export default function PropertyForm({ initialData = null, onSubmit, onCancel, loading = false, userPlan = null }) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [locations, setLocations] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    const fetchRefData = async () => {
      try {
        setLoadingRefs(true);
        const [locRes, typeRes] = await Promise.all([
          api.get("/locations"),
          api.get("/property-types")
        ]);
        setLocations(locRes.data || []);
        setPropertyTypes(typeRes.data || []);
      } catch (err) {
        console.error("Error loading reference data:", err);
      } finally {
        setLoadingRefs(false);
      }
    };
    fetchRefData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...INITIAL_STATE,
        title: initialData.title || "",
        description: initialData.description || "",
        price: initialData.price || "",
        price_currency: initialData.priceCurrency || "USD",
        location_id: initialData.locationDetails?.id || initialData.location_id || "",
        property_type_id: initialData.typeId || initialData.property_type_id || "",
        status: initialData.operationRaw === "rent" ? "alquiler" : "venta",
        bedrooms: initialData.bedrooms || "",
        bathrooms: initialData.bathrooms || "",
        area: initialData.areaTotal || initialData.area || "",
        imageUrl: initialData.imageUrl || "",
        gallery: initialData.images?.map(img => img.url) || [],
        features: initialData.features || [],
        featured: !!initialData.featured,
        latitude: (() => {
          const val = initialData.locationDetails?.latitude ?? initialData.latitude;
          return val !== null && val !== undefined ? Number(val) : null;
        })(),
        longitude: (() => {
          const val = initialData.locationDetails?.longitude ?? initialData.longitude;
          return val !== null && val !== undefined ? Number(val) : null;
        })(),
        showExactAddress: initialData.showExactAddress !== undefined ? !!initialData.showExactAddress : true
      });
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
      imageUrl: images.length > 0 ? (images[0] instanceof File ? "" : images[0]) : "",
      gallery: images
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
    
    const priceVal = Number(formData.price);
    const currencyVal = formData.price_currency || "USD";
    const priceUsdVal = currencyVal === "ARS" ? Math.round(priceVal / 1000) : priceVal;

    const finalData = {
      title: formData.title,
      description: formData.description,
      price_amount: priceVal,
      price_currency: currencyVal,
      price_usd: priceUsdVal,
      location_id: Number(formData.location_id),
      property_type_id: Number(formData.property_type_id),
      operation: formData.status === "alquiler" ? "rent" : "sale",
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      rooms: Number(formData.bedrooms) + 1,
      area_total: Number(formData.area),
      area_covered: Number(formData.area) * 0.9,
      latitude: formData.latitude ? Number(formData.latitude) : null,
      longitude: formData.longitude ? Number(formData.longitude) : null,
      show_exact_address: formData.showExactAddress !== undefined ? !!formData.showExactAddress : true,
      status: "published",
      publication_type: formData.publication_type,
      gallery: formData.gallery
    };
    onSubmit(finalData);
  };

  if (loadingRefs) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-slate-200">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold text-sm">Cargando ubicaciones y categorías...</p>
      </div>
    );
  }

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
              placeholder="Ej: Mansión Moderna en Yerba Buena"
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
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Propiedad</label>
              <select 
                required
                name="property_type_id" 
                value={formData.property_type_id} 
                onChange={handleChange} 
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold"
              >
                <option value="">Selecciona tipo...</option>
                {propertyTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Operación</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold">
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Precio</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full pl-10 pr-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-black text-xl" placeholder="0" />
              </div>
            </div>
            <div className="col-span-1 space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Moneda</label>
              <select name="price_currency" value={formData.price_currency} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold">
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
              </select>
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
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Ubicación (Tucumán)</label>
            <select 
              required 
              name="location_id" 
              value={formData.location_id} 
              onChange={handleChange} 
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold"
            >
              <option value="">Selecciona una ubicación...</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.neighborhood}, {loc.city}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Ubicación en el mapa</label>
              {formData.latitude !== null && formData.latitude !== undefined && formData.longitude !== null && formData.longitude !== undefined && (
                <span className="text-xs font-bold text-blue-600">
                  {Number(formData.latitude).toFixed(5)}, {Number(formData.longitude).toFixed(5)}
                </span>
              )}
            </div>
            <MapLocationSelector 
              latitude={formData.latitude}
              longitude={formData.longitude}
              onChange={({ latitude, longitude }) => {
                setFormData(prev => ({
                  ...prev,
                  latitude,
                  longitude
                }));
              }}
            />
            <p className="text-[10px] text-slate-400 italic">Haz clic en el mapa para marcar la ubicación exacta de la propiedad.</p>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <input 
              type="checkbox"
              id="showExactAddress"
              name="showExactAddress"
              checked={formData.showExactAddress}
              onChange={handleChange}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
            />
            <label htmlFor="showExactAddress" className="text-sm font-bold text-slate-700 cursor-pointer selection:bg-transparent select-none">
              Mostrar dirección exacta en la web
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Maximize className="w-3 h-3" /> m² Totales</label>
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
              {(formData.features || []).map((feature, index) => (
                <span key={index} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-black border border-blue-100 uppercase tracking-tighter">
                  {feature}
                  <button type="button" onClick={() => removeFeature(index)} className="hover:text-red-600"><X className="w-4 h-4" /></button>
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Publication Type Selector — only for new properties */}
      {!initialData && (() => {
        const featuredLimit = userPlan?.featured_limit ?? 0;
        const canFeatured = featuredLimit > 0;
        const canPremium  = featuredLimit > 0;

        const plans = [
          {
            type: "basic",
            label: "Básica",
            desc: "Listado estándar en los resultados de búsqueda.",
            icon: <Zap className="w-6 h-6" />,
            locked: false,
            requiredPlan: null,
            color: "border-slate-600 hover:border-slate-400",
            active: "border-blue-500 bg-blue-500/10",
            dotColor: "#3b82f6",
            iconColor: "text-slate-400",
          },
          {
            type: "featured",
            label: "Destacada",
            desc: "Aparece en la sección principal del Home.",
            icon: <Star className="w-6 h-6" />,
            locked: !canFeatured,
            requiredPlan: "Premium",
            color: "border-slate-600 hover:border-amber-400",
            active: "border-amber-400 bg-amber-400/10",
            dotColor: "#fbbf24",
            iconColor: "text-amber-400",
          },
          {
            type: "premium",
            label: "Premium",
            desc: "Máxima visibilidad: portada del home + badge especial.",
            icon: <Crown className="w-6 h-6" />,
            locked: !canPremium,
            requiredPlan: "Premium",
            color: "border-slate-600 hover:border-purple-400",
            active: "border-purple-400 bg-purple-400/10",
            dotColor: "#a855f7",
            iconColor: "text-purple-400",
          },
        ];

        return (
          <section className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] border border-slate-700 shadow-xl space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Tipo de Publicación</h3>
            </div>
            <p className="text-slate-400 text-sm font-medium -mt-4">
              Elige cómo quieres que aparezca tu propiedad. Tu plan actual: <span className="text-white font-bold">{userPlan?.name || "Sin plan"}</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map(plan => (
                <button
                  key={plan.type}
                  type="button"
                  disabled={plan.locked}
                  onClick={() => !plan.locked && setFormData(prev => ({ ...prev, publication_type: plan.type }))}
                  className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                    plan.locked
                      ? "border-slate-700 opacity-50 cursor-not-allowed"
                      : formData.publication_type === plan.type
                        ? plan.active
                        : plan.color
                  }`}
                >
                  <div className={`mb-3 ${plan.locked ? "text-slate-600" : formData.publication_type === plan.type ? plan.iconColor : "text-slate-500"}`}>
                    {plan.icon}
                  </div>
                  <p className="text-white font-black text-base">{plan.label}</p>
                  <p className="text-slate-400 text-xs font-medium mt-1 leading-relaxed">{plan.desc}</p>
                  {plan.locked && (
                    <div className="mt-3 flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Requiere plan {plan.requiredPlan}
                    </div>
                  )}
                  {!plan.locked && formData.publication_type === plan.type && (
                    <div className="absolute top-3 right-3 w-3 h-3 rounded-full" style={{ backgroundColor: plan.dotColor }} />
                  )}
                </button>
              ))}
            </div>
          </section>
        );
      })()}

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
