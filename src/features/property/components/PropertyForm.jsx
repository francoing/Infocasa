import React, { useState, useEffect } from "react";
import { Camera, MapPin, Bed, Bath, Maximize, Loader2, Save, Sparkles, Zap, Star, Crown, Home } from "lucide-react";
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
  zone_id: "",
  status: "venta", // operation
  bedrooms: "",
  bathrooms: "",
  rooms: "",
  area: "",
  area_covered: "",
  imageUrl: "",
  gallery: [],
  featured: false,
  latitude: null,
  longitude: null,
  showExactAddress: true,
  publication_type: "basic",
  address: "",
  expenses_amount: "",
  expenses_currency: "ARS",
  parking_spaces: "",
  construction_year: "",
  condition: "good",
  disposition: "",
  orientation: "",
  pets_allowed: false,
  professional_use: false,
  features: []
};

export default function PropertyForm({ initialData = null, onSubmit, onCancel, loading = false, userPlan = null }) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [locations, setLocations] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [zones, setZones] = useState([]);
  const [availableFeatures, setAvailableFeatures] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(true);


  useEffect(() => {
    const fetchRefData = async () => {
      try {
        setLoadingRefs(true);
        const [locRes, typeRes, zoneRes, featRes] = await Promise.all([
          api.get("/locations"),
          api.get("/property-types"),
          api.get("/zones"),
          api.get("/property-features")
        ]);
        setLocations(locRes.data || []);
        setPropertyTypes(typeRes.data || []);
        setZones(zoneRes.data || []);
        setAvailableFeatures(featRes.data?.data || []);
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
        zone_id: initialData.zoneId || initialData.zone?.id || initialData.zone_id || "",
        status: initialData.operationRaw === "rent" ? "alquiler" : initialData.operationRaw === "development" ? "desarrollo" : "venta",
        bedrooms: initialData.bedrooms !== undefined && initialData.bedrooms !== null ? initialData.bedrooms : "",
        bathrooms: initialData.bathrooms !== undefined && initialData.bathrooms !== null ? initialData.bathrooms : "",
        rooms: initialData.rooms !== undefined && initialData.rooms !== null ? initialData.rooms : "",
        area: initialData.areaTotal !== undefined && initialData.areaTotal !== null ? initialData.areaTotal : "",
        area_covered: initialData.areaCovered !== undefined && initialData.areaCovered !== null ? initialData.areaCovered : "",
        imageUrl: initialData.imageUrl || "",
        gallery: initialData.images?.map(img => img.url) || [],
        featured: !!initialData.featured,
        latitude: (() => {
          const val = initialData.locationDetails?.latitude ?? initialData.latitude;
          return val !== null && val !== undefined ? Number(val) : null;
        })(),
        longitude: (() => {
          const val = initialData.locationDetails?.longitude ?? initialData.longitude;
          return val !== null && val !== undefined ? Number(val) : null;
        })(),
        showExactAddress: initialData.showExactAddress !== undefined ? !!initialData.showExactAddress : true,
        address: initialData.address || "",
        expenses_amount: initialData.expenses?.amount ?? "",
        expenses_currency: initialData.expenses?.currency || "ARS",
        parking_spaces: initialData.parking_spaces ?? "",
        construction_year: initialData.construction_year ?? "",
        condition: initialData.condition || "good",
        disposition: initialData.disposition || "",
        orientation: initialData.orientation || "",
        pets_allowed: !!initialData.pets_allowed,
        professional_use: !!initialData.professional_use,
        features: initialData.features?.map(f => f.name) || []
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

  const handleFeatureToggle = (featureName) => {
    setFormData(prev => {
      const exists = prev.features.includes(featureName);
      const newFeatures = exists
        ? prev.features.filter(name => name !== featureName)
        : [...prev.features, featureName];
      return { ...prev, features: newFeatures };
    });
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
      zone_id: Number(formData.zone_id),
      operation: formData.status === "alquiler" ? "rent" : formData.status === "desarrollo" ? "development" : "sale",
      bedrooms: formData.bedrooms !== "" && formData.bedrooms !== null ? Number(formData.bedrooms) : null,
      bathrooms: formData.bathrooms !== "" && formData.bathrooms !== null ? Number(formData.bathrooms) : null,
      rooms: formData.rooms !== "" && formData.rooms !== null ? Number(formData.rooms) : null,
      area_total: formData.area !== "" && formData.area !== null ? Number(formData.area) : null,
      area_covered: formData.area_covered !== "" && formData.area_covered !== null ? Number(formData.area_covered) : null,
      latitude: formData.latitude ? Number(formData.latitude) : null,
      longitude: formData.longitude ? Number(formData.longitude) : null,
      show_exact_address: formData.showExactAddress !== undefined ? !!formData.showExactAddress : true,
      address: formData.address || null,
      expenses_amount: formData.expenses_amount !== "" && formData.expenses_amount !== null ? Number(formData.expenses_amount) : null,
      expenses_currency: formData.expenses_amount ? formData.expenses_currency : null,
      parking_spaces: formData.parking_spaces !== "" && formData.parking_spaces !== null ? Number(formData.parking_spaces) : 0,
      construction_year: formData.construction_year !== "" && formData.construction_year !== null ? Number(formData.construction_year) : null,
      condition: formData.condition || "good",
      disposition: formData.disposition || null,
      orientation: formData.orientation || null,
      pets_allowed: !!formData.pets_allowed,
      professional_use: !!formData.professional_use,
      features: formData.features,
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
        {/* Left Column: Información y Detalles Técnicos */}
        <div className="space-y-10">
          {/* Información Principal */}
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
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-semibold"
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
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-medium leading-relaxed"
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
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold bg-white"
                >
                  <option value="">Selecciona tipo...</option>
                  {propertyTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Operación</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold bg-white">
                  <option value="venta">Venta</option>
                  <option value="alquiler">Alquiler</option>
                  <option value="desarrollo">Desarrollo</option>
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
                <select name="price_currency" value={formData.price_currency} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold bg-white">
                  <option value="USD">USD</option>
                  <option value="ARS">ARS</option>
                </select>
              </div>
            </div>
          </section>

          {/* Detalles Técnicos y Superficies */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Maximize className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Detalles Técnicos y Superficie</h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Maximize className="w-3.5 h-3.5 text-blue-600" /> m² Totales
                </label>
                <input 
                  type="number" 
                  name="area" 
                  value={formData.area} 
                  onChange={handleChange} 
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold" 
                  placeholder="Ej: 120"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Maximize className="w-3.5 h-3.5 text-blue-600 rotate-90" /> m² Cubiertos
                </label>
                <input 
                  type="number" 
                  name="area_covered" 
                  value={formData.area_covered} 
                  onChange={handleChange} 
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold" 
                  placeholder="Ej: 100"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-blue-600" /> Ambientes
                </label>
                <input 
                  type="number" 
                  name="rooms" 
                  value={formData.rooms} 
                  onChange={handleChange} 
                  className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold" 
                  placeholder="Ej: 3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-blue-600" /> Dorm.
                </label>
                <input 
                  type="number" 
                  name="bedrooms" 
                  value={formData.bedrooms} 
                  onChange={handleChange} 
                  className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold" 
                  placeholder="Ej: 2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-blue-600" /> Baños
                </label>
                <input 
                  type="number" 
                  name="bathrooms" 
                  value={formData.bathrooms} 
                  onChange={handleChange} 
                  className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold" 
                  placeholder="Ej: 1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Cocheras / Garajes</label>
                <input 
                  type="number"
                  name="parking_spaces"
                  value={formData.parking_spaces}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold"
                  placeholder="Ej: 1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Año de Edificación</label>
                <input 
                  type="number"
                  name="construction_year"
                  value={formData.construction_year}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold"
                  placeholder="Ej: 2018"
                />
              </div>
            </div>
          </section>

          {/* Estado de la propiedad y Normas */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Estado y Normas</h3>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Estado de la propiedad</label>
              <select 
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold bg-white"
              >
                <option value="good">Excelente / Bueno</option>
                <option value="new">A Estrenar</option>
                <option value="under_construction">En Construcción</option>
                <option value="to_refurbish">A Refaccionar</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Disposición</label>
                <select 
                  name="disposition"
                  value={formData.disposition}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold bg-white"
                >
                  <option value="">No especifica</option>
                  <option value="front">Frente</option>
                  <option value="back">Contrafrente</option>
                  <option value="lateral">Lateral</option>
                  <option value="internal">Interno</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Orientación</label>
                <select 
                  name="orientation"
                  value={formData.orientation}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold bg-white"
                >
                  <option value="">No especifica</option>
                  <option value="north">Norte</option>
                  <option value="south">Sur</option>
                  <option value="east">Este</option>
                  <option value="west">Oeste</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                <input 
                  type="checkbox"
                  id="pets_allowed"
                  name="pets_allowed"
                  checked={formData.pets_allowed}
                  onChange={handleChange}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="pets_allowed" className="text-sm font-bold text-slate-700 cursor-pointer selection:bg-transparent select-none">
                  Acepta Mascotas
                </label>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                <input 
                  type="checkbox"
                  id="professional_use"
                  name="professional_use"
                  checked={formData.professional_use}
                  onChange={handleChange}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="professional_use" className="text-sm font-bold text-slate-700 cursor-pointer selection:bg-transparent select-none">
                  Apto Profesional / Uso Comercial
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Ubicación, Gastos y Servicios */}
        <div className="space-y-10">
          {/* Ubicación y Mapa */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Ubicación y Dirección</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Ubicación (Tucumán)</label>
                <select 
                  required 
                  name="location_id" 
                  value={formData.location_id} 
                  onChange={handleChange} 
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold bg-white"
                >
                  <option value="">Selecciona ubicación...</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.neighborhood}, {loc.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Zona</label>
                <select 
                  required 
                  name="zone_id" 
                  value={formData.zone_id} 
                  onChange={handleChange} 
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold bg-white"
                >
                  <option value="">Selecciona zona...</option>
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Dirección Escrita</label>
              <input 
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold"
                placeholder="Ej: Av. Aconquija 1200, Yerba Buena"
              />
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
          </section>

          {/* Expensas y Finanzas */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">💰</span>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Gastos y Expensas</h3>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Monto de Expensas (Opcional)</label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                  <input 
                    type="number"
                    name="expenses_amount"
                    value={formData.expenses_amount}
                    onChange={handleChange}
                    className="w-full pl-10 pr-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold text-lg"
                    placeholder="0"
                  />
                </div>
                <select 
                  name="expenses_currency" 
                  value={formData.expenses_currency} 
                  onChange={handleChange} 
                  className="w-28 px-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold bg-white"
                >
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
          </section>

          {/* Servicios y Amenities */}
          {availableFeatures.length > 0 && (
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Servicios y Amenities</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {availableFeatures.map(feat => {
                  const isChecked = formData.features.includes(feat.name);
                  const label = feat.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                  return (
                    <button
                      key={feat.id}
                      type="button"
                      onClick={() => handleFeatureToggle(feat.name)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                        isChecked
                          ? "border-blue-500 bg-blue-50/50 text-blue-700 font-bold"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 pointer-events-none"
                      />
                      <span className="text-[10px] uppercase font-black tracking-tighter leading-none">{label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>
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
