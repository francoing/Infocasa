import React, { useState, useEffect } from "react";
import { Camera, MapPin, Bed, Bath, Maximize, Loader2, Save, Sparkles, Zap, Star, Crown, Home, ShieldCheck, Upload, FileText, X, AlertCircle } from "lucide-react";
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
  features: [],
  certification_document: null
};

const EXTRAS = [
  { value: "jardin", label: "Jardín" },
  { value: "pileta", label: "Pileta" },
  { value: "parrilla", label: "Parrilla" },
  { value: "quincho", label: "Quincho" },
  { value: "balcon", label: "Balcón" },
  { value: "terraza", label: "Terraza" },
  { value: "lavadero", label: "Lavadero" },
  { value: "patio", label: "Patio" },
  { value: "azotea", label: "Azotea" },
  { value: "fondo", label: "Fondo" },
];

export default function PropertyForm({ initialData = null, onSubmit, onCancel, loading = false, userPlan = null }) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [locations, setLocations] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [zones, setZones] = useState([]);
  const [availableFeatures, setAvailableFeatures] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [formError, setFormError] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");


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
        status: initialData.operationRaw === "temporary_rent" ? "temporary_rent" : initialData.operationRaw === "rent" ? "alquiler" : initialData.operationRaw === "development" ? "desarrollo" : "venta",
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
        features: initialData.features?.map(f => f.name) || [],
        certification_document: initialData.certificationDocumentUrl
          ? { existingUrl: initialData.certificationDocumentUrl, name: "Comprobante ya cargado" }
          : null
      });
    }
  }, [initialData]);

  /** Cuando se cargan locations + hay initialData → derivar provincia/departamento */
  useEffect(() => {
    if (initialData && locations.length > 0) {
      const locId = initialData.locationDetails?.id || initialData.location_id;
      if (locId) {
        const loc = locations.find(l => l.id == locId);
        if (loc) {
          setSelectedProvince(loc.province);
          setSelectedDepartment(loc.department);
        }
      }
    }
  }, [initialData, locations]);

  /** Cuando cambian los filtros, si la ubicación elegida ya no está disponible → resetear */
  useEffect(() => {
    if (locations.length === 0 || !formData.location_id) return;

    const currentZoneName = zones.find(z => z.id == formData.zone_id)?.name || "";
    const zoneKw = getZoneKeyword(currentZoneName);

    const stillExists = locations.some(l => {
      if (selectedProvince && l.province !== selectedProvince) return false;
      if (selectedDepartment && l.department !== selectedDepartment) return false;
      if (zoneKw && !l.neighborhood.toLowerCase().includes(zoneKw)) return false;
      return l.id == formData.location_id;
    });

    if (!stillExists) {
      setFormData(prev => ({ ...prev, location_id: "" }));
    }
  }, [selectedProvince, selectedDepartment, formData.zone_id, formData.location_id, locations]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProvinceChange = (e) => {
    const prov = e.target.value;
    setSelectedProvince(prov);
    setSelectedDepartment("");
    setFormData(prev => ({ ...prev, location_id: "" }));
  };

  const handleDepartmentChange = (e) => {
    const dept = e.target.value;
    setSelectedDepartment(dept);
    setFormData(prev => ({ ...prev, location_id: "" }));
  };

  /** Deriva un keyword de búsqueda desde el nombre de la zona (Zona Norte → "norte", Centro → "centro") */
  const getZoneKeyword = (zoneName) => {
    if (!zoneName) return "";
    const name = zoneName.toLowerCase();
    if (name.includes("norte")) return "norte";
    if (name.includes("sur")) return "sur";
    if (name.includes("este")) return "este";
    if (name.includes("oeste")) return "oeste";
    if (name.includes("centro")) return "centro";
    return "";
  };

  /** Busca la ubicación más cercana a unas coordenadas dentro de la lista */
  const findClosestLocation = (lat, lng, locs) => {
    let closest = null;
    let minDist = Infinity;
    for (const loc of locs) {
      const dlat = lat - parseFloat(loc.latitude);
      const dlng = lng - parseFloat(loc.longitude);
      const dist = dlat * dlat + dlng * dlng;
      if (dist < minDist) {
        minDist = dist;
        closest = loc;
      }
    }
    return closest;
  };

  /** Cuando el usuario marca un punto en el mapa → auto-completar cascade */
  const handleMapLocationChange = ({ latitude, longitude }) => {
    setFormData(prev => ({ ...prev, latitude, longitude }));
    if (latitude != null && longitude != null && locations.length > 0) {
      const closest = findClosestLocation(latitude, longitude, locations);
      if (closest) {
        setSelectedProvince(closest.province);
        setSelectedDepartment(closest.department);
        setFormData(prev => ({ ...prev, location_id: closest.id }));
      }
    }
  };

  const handleImagesChange = (images) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: images.length > 0 ? (images[0] instanceof File ? "" : images[0]) : "",
      gallery: images
    }));
  };

  const handleCertDocChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, certification_document: file }));
  };

  const clearCertDoc = () => {
    setFormData(prev => ({ ...prev, certification_document: null }));
  };

  const isTempRent = formData.status === 'temporary_rent';

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

    // Validar provincia y departamento
    if (!selectedProvince) {
      setFormError("Debes seleccionar una provincia.");
      return;
    }
    if (!selectedDepartment) {
      setFormError("Debes seleccionar un departamento.");
      return;
    }

    // Validar certificación para Alquiler Temporario
    if (isTempRent && !formData.certification_document) {
      setFormError("Para Alquiler Temporario es obligatorio adjuntar un comprobante de servicio que acredite el domicilio.");
      return;
    }
    setFormError("");

    const priceVal = Number(formData.price);
    const currencyVal = formData.price_currency || "USD";

    // Mapear operación al valor de API
    let operation;
    if (formData.status === "alquiler") operation = "rent";
    else if (formData.status === "temporary_rent") operation = "temporary_rent";
    else if (formData.status === "desarrollo") operation = "development";
    else operation = "sale";

    // Construir FormData (el backend espera multipart/form-data)
    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    fd.append("price_amount", priceVal);
    fd.append("price_currency", currencyVal);
    fd.append("location_id", Number(formData.location_id));
    fd.append("province", selectedProvince || "");
    fd.append("department", selectedDepartment || "");
    fd.append("property_type_id", Number(formData.property_type_id));
    fd.append("zone_id", Number(formData.zone_id));
    fd.append("operation", operation);
    if (formData.bedrooms !== "") fd.append("bedrooms", Number(formData.bedrooms));
    if (formData.bathrooms !== "") fd.append("bathrooms", Number(formData.bathrooms));
    if (formData.rooms !== "") fd.append("rooms", Number(formData.rooms));
    if (formData.area !== "") fd.append("area_total", Number(formData.area));
    if (formData.area_covered !== "") fd.append("area_covered", Number(formData.area_covered));
    if (formData.latitude) fd.append("latitude", Number(formData.latitude));
    if (formData.longitude) fd.append("longitude", Number(formData.longitude));
    fd.append("show_exact_address", formData.showExactAddress ? "1" : "0");
    if (formData.address) fd.append("address", formData.address);
    if (formData.expenses_amount !== "") {
      fd.append("expenses_amount", Number(formData.expenses_amount));
      fd.append("expenses_currency", formData.expenses_currency);
    }
    fd.append("parking_spaces", formData.parking_spaces !== "" ? Number(formData.parking_spaces) : 0);
    if (formData.construction_year !== "") fd.append("construction_year", Number(formData.construction_year));
    fd.append("condition", formData.condition || "good");
    if (formData.disposition) fd.append("disposition", formData.disposition);
    if (formData.orientation) fd.append("orientation", formData.orientation);
    fd.append("pets_allowed", formData.pets_allowed ? "1" : "0");
    fd.append("professional_use", formData.professional_use ? "1" : "0");
    fd.append("status", "published");
    fd.append("publication_type", formData.publication_type);

    // Features como array
    formData.features.forEach(f => fd.append("features[]", f));

    // Imágenes (si son Files)
    const imageFiles = formData.gallery.filter(item => item instanceof File);
    imageFiles.forEach(file => fd.append("images[]", file));

    // Certificación (solo para temporarios)
    if (isTempRent && formData.certification_document instanceof File) {
      fd.append("certification_document", formData.certification_document);
    }

    onSubmit(fd);
  };

  // ---- Datos derivados de la cascada provincia → departamento → ubicación ----
  const provinces = [...new Set(locations.map(l => l.province))].sort();
  const departments = [...new Set(
    locations
      .filter(l => !selectedProvince || l.province === selectedProvince)
      .map(l => l.department)
  )].sort();
  const selectedZoneName = zones.find(z => z.id == formData.zone_id)?.name || "";
  const zoneKeyword = getZoneKeyword(selectedZoneName);
  const filteredLocations = locations.filter(l => {
    // Filtro por provincia
    if (selectedProvince && l.province !== selectedProvince) return false;
    // Filtro por departamento
    if (selectedDepartment && l.department !== selectedDepartment) return false;
    // Filtro adicional por zona (coincide con el barrio)
    if (zoneKeyword && !l.neighborhood.toLowerCase().includes(zoneKeyword)) return false;
    return true;
  });

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

            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mb-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Propiedad</label>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Operación</label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold bg-white">
                  <option value="venta">Venta</option>
                  <option value="alquiler">Alquiler</option>
                  <option value="temporary_rent">Alquiler Temporario</option>
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

            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mb-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Maximize className="w-3.5 h-3.5 text-blue-600" /> m² Totales
                </label>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Maximize className="w-3.5 h-3.5 text-blue-600 rotate-90" /> m² Cubiertos
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold"
                  placeholder="Ej: 120"
                />
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

            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 mb-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-blue-600" /> Ambientes
                </label>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-blue-600" /> Dorm.
                </label>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-blue-600" /> Baños
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="number"
                  name="rooms"
                  value={formData.rooms}
                  onChange={handleChange}
                  className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold"
                  placeholder="Ej: 3"
                />
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold"
                  placeholder="Ej: 2"
                />
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

            <div className="pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mb-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Cocheras / Garajes</label>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Año de Edificación</label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <input
                  type="number"
                  name="parking_spaces"
                  value={formData.parking_spaces}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold"
                  placeholder="Ej: 1"
                />
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

            {/* Extras de la propiedad */}
            <div className="pt-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Extras de la propiedad</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {EXTRAS.map(extra => {
                  const isChecked = formData.features.includes(extra.value);
                  return (
                    <button
                      key={extra.value}
                      type="button"
                      onClick={() => handleFeatureToggle(extra.value)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all ${isChecked
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
                      <span className="text-[10px] uppercase font-black tracking-tighter leading-none">{extra.label}</span>
                    </button>
                  );
                })}
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

            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mb-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Disposición</label>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Orientación</label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

            {/* Fila 1: Provincia + Departamento */}
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mb-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Provincia</label>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Departamento</label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <select
                  required
                  value={selectedProvince}
                  onChange={handleProvinceChange}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold bg-white"
                >
                  <option value="">Selecciona provincia...</option>
                  {provinces.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <select
                  required
                  value={selectedDepartment}
                  onChange={handleDepartmentChange}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold bg-white"
                >
                  <option value="">Selecciona departamento...</option>
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fila 2: Ubicación + Zona */}
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mb-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Ubicación</label>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Zona</label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <select
                  required
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold bg-white"
                >
                  <option value="">Selecciona ubicación...</option>
                  {filteredLocations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.neighborhood}, {loc.city}
                    </option>
                  ))}
                </select>
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
                onChange={handleMapLocationChange}
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

          {/* Certificación — solo para Alquiler Temporario */}
          {isTempRent && (
            <section className="bg-white p-8 rounded-[2.5rem] border border-emerald-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Certificación de Domicilio</h3>
              </div>

              <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                <p className="text-xs font-bold text-amber-800 leading-relaxed">
                  Para publicar un <strong>Alquiler Temporario</strong> necesitás adjuntar una <strong>boleta de servicio</strong> (luz, gas, agua, internet) del domicilio.
                  Esto verifica que la dirección existe y te corresponde.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  Comprobante de servicio <span className="text-red-500">*</span>
                  {formData.certification_document && (
                    <span className="text-emerald-600 normal-case font-bold text-[10px] flex items-center gap-1 ml-2">
                      <FileText className="w-3 h-3" /> Archivo seleccionado
                    </span>
                  )}
                </label>

                {!formData.certification_document ? (
                  <label className="flex flex-col items-center justify-center w-full min-h-[100px] px-6 py-6 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group">
                    <Upload className="w-7 h-7 text-slate-300 group-hover:text-emerald-500 transition-colors mb-2" />
                    <span className="text-sm font-bold text-slate-500 group-hover:text-emerald-600 transition-colors">
                      Hacé clic para subir tu boleta
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">PDF, JPG o PNG — Máx. 5 MB</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleCertDocChange}
                      className="hidden"
                    />
                  </label>
                ) : formData.certification_document.existingUrl ? (
                  <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                      <FileText className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900">Comprobante ya cargado</p>
                      <p className="text-[11px] text-emerald-600 font-semibold">Aprobado / En revisión</p>
                    </div>
                    <label className="p-2 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer" title="Reemplazar archivo">
                      <Upload className="w-5 h-5 text-blue-400 hover:text-blue-600" />
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleCertDocChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={clearCertDoc}
                      className="p-2 hover:bg-red-50 rounded-xl transition-colors"
                      title="Eliminar archivo"
                    >
                      <X className="w-5 h-5 text-red-400 hover:text-red-600" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                      <FileText className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {formData.certification_document.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {(formData.certification_document.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearCertDoc}
                      className="p-2 hover:bg-red-50 rounded-xl transition-colors"
                      title="Eliminar archivo"
                    >
                      <X className="w-5 h-5 text-red-400 hover:text-red-600" />
                    </button>
                  </div>
                )}
              </div>

              {formError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-red-700">{formError}</p>
                </div>
              )}
            </section>
          )}

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
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${isChecked
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
        const canPremium = featuredLimit > 0;

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
                  className={`relative p-6 rounded-2xl border-2 transition-all text-left ${plan.locked
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
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
