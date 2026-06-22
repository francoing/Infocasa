import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, ShieldCheck, Map, ArrowRight, BarChart3, Loader2, X, Check, Home, Building, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../../../common/components/Layout";
import PropertyCard from "../../../common/components/PropertyCard";
import { useProperties } from "../../../hooks/useProperties";
import { useGeoapifyAutocomplete } from "../../../hooks/useGeoapifyPlaces";
import { useUserProvince } from "../../../hooks/useUserProvince";
import LocationGateModal from "../components/LocationGateModal";

/* ---------- Constantes ---------- */

const OPERATIONS = [
  { id: "Comprar", icon: Home, desc: "Encontrá tu próximo hogar" },
  { id: "Alquilar", icon: Search, desc: "El mejor lugar para alquilar" },
  { id: "Vender", icon: Building, desc: "Publicá tu propiedad" },
];

const PROPERTY_TYPES = ["Departamento", "Casa", "PH", "Terreno"];
const ROOMS = ["1", "2", "3", "4+"];
const BATHROOMS = ["1", "2", "3+"];

/* ---------- Helpers ---------- */

const mapOperationToApi = (op) => {
  if (op === "Alquilar") return "Alquiler";
  return "Venta"; // Comprar / Vender → "Venta"
};

/* ---------- Componente SelectGroup ---------- */

function SelectGroup({ label, options, value, onChange, placeholder }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{label}</p>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all pr-10 cursor-pointer"
        >
          <option value="">{placeholder || `Seleccionar ${label.toLowerCase()}`}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

/* ========== HomePage ========== */

export default function HomePage() {
  const { data: properties, loading, error } = useProperties();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // — Estado del formulario
  const [operation, setOperation] = useState("");
  const [locationTags, setLocationTags] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [propertyTypes, setPropertyTypes] = useState("");
  const [rooms, setRooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [step, setStep] = useState(1); // 1 → operación, 2 → ubicación
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // — Gate de ubicación → solo pregunta ubicación UNA VEZ
  const { status: gateStatus, province: userProvince, error: gateError, checkProvince, reset: resetGate } = useUserProvince();
  const [gateOpen, setGateOpen] = useState(false);
  const [locationVerified, setLocationVerified] = useState(() =>
    sessionStorage.getItem("infocasa_location_verified") === "true"
  );

  // Cuando el gate se resuelve "allowed", recordamos y navegamos
  useEffect(() => {
    if (gateStatus === "allowed" && gateOpen) {
      setGateOpen(false);
      setLocationVerified(true);
      sessionStorage.setItem("infocasa_location_verified", "true");
      navigate(`/explore/${operation}`);
      resetGate();
    }
  }, [gateStatus]);

  const handleGateAccept = () => {
    checkProvince();
  };

  const handleGateClose = () => {
    setGateOpen(false);
    if (gateStatus !== "allowed") {
      setOperation("");
    }
    resetGate();
  };

  const featured = properties.slice(0, 6);

  // — Manejo de tags de ubicación
  const addLocationTag = (value) => {
    const trimmed = value.trim();
    if (trimmed && !locationTags.includes(trimmed)) {
      setLocationTags([...locationTags, trimmed]);
    }
    setInputValue("");
  };

  // — Geoapify Autocomplete
  const { suggestions, loading: geoLoading, setQuery, clearSuggestions } = useGeoapifyAutocomplete();
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const removeLocationTag = (tag) => {
    setLocationTags(locationTags.filter((t) => t !== tag));
  };

  const selectSuggestion = (suggestion) => {
    addLocationTag(suggestion.city || suggestion.state || suggestion.value);
    setShowSuggestions(false);
    setFocusedIdx(-1);
    clearSuggestions();
  };

  const handleTagKeyDown = (e) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIdx((prev) => Math.min(prev + 1, suggestions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIdx((prev) => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === "Enter" && focusedIdx >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[focusedIdx]);
        return;
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
        setFocusedIdx(-1);
        return;
      }
    }
    if (e.key === "Enter") {
      e.preventDefault();
      addLocationTag(inputValue);
      setShowSuggestions(false);
    }
  };

  // — Submit
  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();

    queryParams.set("operation", mapOperationToApi(operation));

    if (locationTags.length > 0) {
      queryParams.set("location", locationTags.join(","));
    }
    if (propertyTypes) {
      queryParams.set("type", propertyTypes);
    }
    if (rooms) {
      queryParams.set("rooms", rooms);
    }
    if (bathrooms) {
      queryParams.set("bathrooms", bathrooms);
    }

    navigate(`/search?${queryParams.toString()}`);
  };

  // — Selección de operación → abre gate de ubicación
  const selectOperation = (op) => {
    setOperation(op);
    if (locationVerified) {
      navigate(`/explore/${op}`);
    } else {
      setGateOpen(true);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="hero-gradient py-20 lg:py-32 px-6 lg:px-12 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight"
            >
              Encuentra tu próximo capítulo <br className="hidden md:block" /> en la vida de lujo.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12"
            >
              Experimenta el motor de búsqueda de propiedades más refinado, diseñado para quienes valoran la claridad, la velocidad y la estética premium.
            </motion.p>
            
            {
              /* ========== FORMULARIO NORMAL (sin exploración) ========== */
              <motion.form
                onSubmit={handleSearch}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100 max-w-2xl mx-auto space-y-6"
              >
                {/* ========== NIVEL 1: Botones de Operación ========== */}
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-widest font-bold text-slate-400 text-center">
                    ¿Qué querés hacer?
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {OPERATIONS.map((op) => {
                      const Icon = op.icon;
                      const active = operation === op.id;
                      return (
                        <button
                          key={op.id}
                          type="button"
                          onClick={() => selectOperation(op.id)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                            active
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 ring-2 ring-blue-600 ring-offset-2"
                              : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                          {op.id}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ========== NIVEL 2: Búsqueda Inteligente con Tags ========== */}
                <AnimatePresence>
                  {step >= 2 && (
                    <motion.div
                      key="level2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <p className="text-xs uppercase tracking-widest font-bold text-slate-400">
                        Ubicación o características
                      </p>
                      <div className="relative flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                          {locationTags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeLocationTag(tag)}
                                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                          <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => {
                              setInputValue(e.target.value);
                              setQuery(e.target.value);
                              setShowSuggestions(e.target.value.trim().length >= 2);
                            }}
                            onKeyDown={handleTagKeyDown}
                            onFocus={() => setShowSuggestions(suggestions.length > 0)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            placeholder={locationTags.length === 0 ? "Ej: Barrio Norte, Centro, Córdoba..." : ""}
                            autoComplete="off"
                            className="flex-1 min-w-[120px] border-none p-0 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-0 outline-none"
                          />
                        </div>
                        {inputValue && (
                          <button
                            type="button"
                            onClick={() => addLocationTag(inputValue)}
                            className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex-shrink-0"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {/* — Dropdown Geoapify — */}
                      {showSuggestions && suggestions.length > 0 && (
                        <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-48 sm:max-h-64 overflow-y-auto">
                          {suggestions.map((s, i) => (
                            <li key={i}>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  selectSuggestion(s);
                                }}
                                onMouseEnter={() => setFocusedIdx(i)}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                                  i === focusedIdx
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                <MapPin className="w-4 h-4 flex-shrink-0 text-slate-400" />
                                <span className="font-medium">{s.value}</span>
                              </button>
                            </li>
                          ))}
                          {geoLoading && (
                            <li className="px-4 py-2 text-xs text-slate-400 flex items-center gap-2">
                              <Loader2 className="w-3 h-3 animate-spin" /> Buscando…
                            </li>
                          )}
                        </ul>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ========== Botón de Acción ========== */}
                {step >= 2 && (
                  <button
                    type="button"
                    onClick={() => setFilterModalOpen(true)}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    Buscar propiedades
                  </button>
                )}

                {/* ========== Modal de Filtros ========== */}
                <AnimatePresence>
                  {filterModalOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                      onClick={() => setFilterModalOpen(false)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-8 w-full max-w-[480px] max-h-[90vh] overflow-y-auto flex flex-col"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-bold text-slate-900">Filtros adicionales</h3>
                          <button
                            type="button"
                            onClick={() => setFilterModalOpen(false)}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            <X className="w-5 h-5 text-slate-500" />
                          </button>
                        </div>

                        <div className="space-y-5 flex-1">
                          <SelectGroup label="Tipo de Propiedad" options={PROPERTY_TYPES} value={propertyTypes} onChange={setPropertyTypes} />
                          <div className="grid grid-cols-2 gap-5">
                            <SelectGroup label="Ambientes" options={ROOMS} value={rooms} onChange={setRooms} />
                            <SelectGroup label="Baños" options={BATHROOMS} value={bathrooms} onChange={setBathrooms} />
                          </div>
                        </div>

                        <div className="flex gap-3 mt-8 pt-5 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => { setPropertyTypes(""); setRooms(""); setBathrooms(""); }}
                            className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                          >
                            Limpiar filtros
                          </button>
                          <button
                            type="button"
                            onClick={handleSearch}
                            className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                          >
                            <Search className="w-4 h-4" /> Buscar
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.form>
            }

            {/* ========== LocationGateModal ========== */}
            <LocationGateModal
              open={gateOpen}
              status={gateStatus}
              province={userProvince}
              error={gateError}
              onAccept={handleGateAccept}
              onClose={handleGateClose}
            />
          </div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-slate-100/20 rounded-full blur-3xl"></div>
        </section>

        {/* Featured Properties */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 w-full">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Propiedades Destacadas</h2>
              <p className="text-slate-500 mt-2">Propiedades de lujo seleccionadas por su excelencia.</p>
            </div>
            <Link to="/search" className="text-blue-600 font-semibold border-b-2 border-blue-600/20 pb-1 hover:border-blue-600 transition-all">
              Ver todas las propiedades
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
              Error al cargar las propiedades.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.length > 0 ? (
                featured.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))
              ) : (
                <p className="text-center col-span-full py-12 text-slate-500 font-medium italic">No se encontraron propiedades destacadas.</p>
              )}
            </div>
          )}
        </section>

        {/* Value Proposition / Bento */}
        <section className="bg-slate-50 py-24 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 bg-white p-10 lg:p-14 rounded-3xl border border-slate-200 flex flex-col justify-between shadow-sm">
                <div className="max-w-md">
                  <h2 className="text-3xl font-bold text-slate-900 mb-6">Información del mercado que te impulsa.</h2>
                  <p className="text-slate-600 mb-8">Accede a datos en tiempo real, tendencias de precios históricos e informes comunitarios directamente en tu panel de propiedad.</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="bg-slate-100 p-4 rounded-2xl">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="bg-slate-100 p-4 rounded-2xl">
                    <Map className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="bg-slate-100 p-4 rounded-2xl">
                    <ShieldCheck className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="md:col-span-4 bg-blue-600 p-10 lg:p-14 rounded-3xl flex flex-col justify-center text-white">
                <ShieldCheck className="w-12 h-12 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Solo Agentes Certificados</h3>
                <p className="text-blue-100/80 mb-8">Cada profesional en nuestra plataforma es evaluado por su experiencia, conocimiento local e integridad.</p>
                <Link to="/register" className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors w-full text-center">
                  Postular como Agente
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Map CTA Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 w-full">
          <div className="relative h-[450px] rounded-3xl overflow-hidden shadow-2xl">
            <img 
              className="w-full h-full object-cover grayscale opacity-40" 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200"
              alt="Search Map"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-transparent flex items-center px-10 md:px-20">
              <div className="max-w-md text-white">
                <h2 className="text-3xl font-bold mb-4">Buscar en el Mapa</h2>
                <p className="text-blue-100 mb-8">Visualiza tu futuro vecindario. Mira la proximidad a parques, escuelas y servicios esenciales en tiempo real.</p>
                <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold shadow-xl hover:-translate-y-1 transition-transform flex items-center gap-3">
                  Explorar Mapa Local
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
