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
  if (op === "Alquilar" || op === "Temporario") return "Alquiler";
  return "Venta"; // Comprar / Vender / Temporario -> "Venta" / "Alquiler"
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
  const [operation, setOperation] = useState("Comprar");
  const [locationTags, setLocationTags] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [propertyTypes, setPropertyTypes] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
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

  // Cuando el gate se resuelve "allowed", recordamos y navegamos o ejecutamos la búsqueda
  useEffect(() => {
    if (gateStatus === "allowed" && gateOpen) {
      setGateOpen(false);
      setLocationVerified(true);
      sessionStorage.setItem("infocasa_location_verified", "true");
      
      if (inputValue.trim()) {
        const queryParams = new URLSearchParams();
        queryParams.set("operation", mapOperationToApi(operation));
        queryParams.set("location", inputValue.trim());
        if (propertyTypes) queryParams.set("type", propertyTypes);
        if (maxPrice) queryParams.set("maxPrice", maxPrice);
        navigate(`/search?${queryParams.toString()}`);
      } else {
        navigate(`/explore/${operation}`);
      }
      
      resetGate();
    }
  }, [gateStatus, operation, inputValue, propertyTypes, maxPrice, gateOpen]);

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
    setInputValue(suggestion.city || suggestion.state || suggestion.value);
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
  };

  // — Submit
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Si la ubicación del usuario no está verificada, abrir el gate modal primero
    if (!locationVerified) {
      setGateOpen(true);
      return;
    }

    const queryParams = new URLSearchParams();
    queryParams.set("operation", mapOperationToApi(operation));

    if (inputValue.trim()) {
      queryParams.set("location", inputValue.trim());
      if (propertyTypes) {
        queryParams.set("type", propertyTypes);
      }
      if (maxPrice) {
        queryParams.set("maxPrice", maxPrice);
      }
      navigate(`/search?${queryParams.toString()}`);
    } else {
      // Si no especificó ubicación, vamos a la exploración de provincia (ExplorePage)
      navigate(`/explore/${operation}`);
    }
  };

  // — Exploración en el mapa / Gate de ubicación
  const handleMapExplore = () => {
    if (locationVerified) {
      navigate(`/explore/${operation || "Comprar"}`);
    } else {
      setGateOpen(true);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="hero-bg-mockup py-20 lg:py-32 px-6 lg:px-12 relative overflow-hidden flex items-center min-h-[620px]">
          <div className="max-w-7xl mx-auto relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
            {/* Column Left: Text & Stats */}
            <div className="lg:col-span-7 space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-black text-white leading-tight"
              >
                Encontrá tu próximo <br className="hidden md:block" /> hogar con <span className="text-white">Infocasa</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg md:text-xl text-white/90 max-w-xl"
              >
                La plataforma que conecta personas, empresas e inmobiliarias en un solo lugar.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20 max-w-md text-white"
              >
                <div>
                  <h3 className="text-3xl md:text-4xl font-extrabold">500+</h3>
                  <p className="text-xs text-white/80 mt-1 uppercase tracking-wider font-semibold">Propiedades</p>
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl font-extrabold">120+</h3>
                  <p className="text-xs text-white/80 mt-1 uppercase tracking-wider font-semibold">Inmobiliarias</p>
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl font-extrabold">10k+</h3>
                  <p className="text-xs text-white/80 mt-1 uppercase tracking-wider font-semibold">Usuarios</p>
                </div>
              </motion.div>
            </div>

            {/* Column Right: Search Box */}
            <div className="lg:col-span-5 w-full">
              <motion.form
                onSubmit={handleSearch}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-5 relative text-left"
              >
                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-full mb-2">
                  {["Comprar", "Alquilar", "Temporario"].map((op) => {
                    const active = operation === op;
                    return (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setOperation(op)}
                        className={`flex-1 text-center py-2 rounded-full font-bold text-sm transition-all duration-300 ${
                          active
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {op}
                      </button>
                    );
                  })}
                </div>

                {/* Ubicación field with GeoapifyAutocomplete */}
                <div className="space-y-1.5 relative">
                  <label className="text-xs uppercase tracking-widest font-black text-blue-600 block">
                    Ubicación
                  </label>
                  <div className="relative flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-sm">
                    <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
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
                      placeholder="¿Dónde querés vivir?"
                      autoComplete="off"
                      className="flex-1 border-none p-0 bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-0 outline-none"
                    />
                  </div>

                  {/* Suggestions List */}
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-48 sm:max-h-64 overflow-y-auto">
                      {suggestions.map((s, i) => (
                        <li key={i}>
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setInputValue(s.city || s.state || s.value);
                              setShowSuggestions(false);
                              setFocusedIdx(-1);
                              clearSuggestions();
                            }}
                            onMouseEnter={() => setFocusedIdx(i)}
                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                              i === focusedIdx
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <MapPin className="w-4 h-4 flex-shrink-0 text-slate-400" />
                            <span className="font-semibold">{s.value}</span>
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
                </div>

                {/* Filters row: Tipo and Precio */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Tipo */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-widest font-black text-blue-600 block">
                      Tipo
                    </label>
                    <div className="relative">
                      <select
                        value={propertyTypes}
                        onChange={(e) => setPropertyTypes(e.target.value)}
                        className="w-full appearance-none px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all pr-10 cursor-pointer shadow-sm outline-none"
                      >
                        <option value="">Todos</option>
                        {PROPERTY_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Precio */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-widest font-black text-blue-600 block">
                      Precio
                    </label>
                    <div className="relative">
                      <select
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full appearance-none px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all pr-10 cursor-pointer shadow-sm outline-none"
                      >
                        <option value="">Sin límite</option>
                        <option value="10000000">Hasta $10M</option>
                        <option value="30000000">Hasta $30M</option>
                        <option value="50000000">Hasta $50M</option>
                        <option value="100000000">Hasta $100M</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-extrabold text-sm uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-4"
                >
                  Buscar propiedades
                </button>
              </motion.form>
            </div>
          </div>

          {/* ========== LocationGateModal ========== */}
          <LocationGateModal
            open={gateOpen}
            status={gateStatus}
            province={userProvince}
            error={gateError}
            onAccept={handleGateAccept}
            onClose={handleGateClose}
          />
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
                <button 
                  onClick={handleMapExplore}
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold shadow-xl hover:-translate-y-1 transition-transform flex items-center gap-3"
                >
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
