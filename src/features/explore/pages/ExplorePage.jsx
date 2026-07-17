import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Search } from "lucide-react";
import Layout from "../../../common/components/Layout";
import ProvinceMap from "../../home/components/ProvinceMap";
import { useExploreProperties } from "../../../hooks/useExploreProperties";
import { useGeoapifyAutocomplete } from "../../../hooks/useGeoapifyPlaces";

const OPERATION_MAP = {
  Comprar: { api: "sale", label: "Comprá", searchOp: "Venta" },
  Alquilar: { api: "rent", label: "Alquilá", searchOp: "Alquiler" },
};

export default function ExplorePage() {
  const { operation } = useParams();
  const navigate = useNavigate();
  const opConfig = OPERATION_MAP[operation];

  // Capa de datos: react-query (loading/error/cancelación). No fetchea si la operación es inválida.
  const {
    properties: explorationProperties,
    loading: explorationLoading,
    error: explorationError,
  } = useExploreProperties(opConfig?.api);

  // — Geoapify autocomplete para el buscador
  const { suggestions, loading: geoLoading, setQuery, clearSuggestions } = useGeoapifyAutocomplete();
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);

  // Click en marcador → navegar al detalle de la propiedad
  const handlePropertyClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  // Selección de sugerencia Geoapify → navegar a search
  const selectSuggestion = (suggestion) => {
    const value = suggestion.city || suggestion.state || suggestion.value;
    const params = new URLSearchParams();
    params.set("location", value);
    params.set("operation", opConfig.searchOp);
    navigate(`/search?${params.toString()}`);
    clearSuggestions();
  };

  const handleSearchKeyDown = (e) => {
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
    if (e.key === "Enter" && searchValue.trim()) {
      e.preventDefault();
      const params = new URLSearchParams();
      params.set("location", searchValue.trim());
      params.set("operation", opConfig.searchOp);
      navigate(`/search?${params.toString()}`);
    }
  };

  // Si la operación no es válida
  if (!opConfig) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
          <p className="text-lg font-bold text-slate-900">Operación no válida</p>
          <p className="text-sm text-slate-500">La operación "{operation}" no existe.</p>
          <Link to="/" className="text-blue-600 font-semibold hover:underline">Volver al inicio</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {opConfig.label} en tu zona
            </h1>
            <p className="text-xs text-slate-400">
              Buscá por ubicación o seleccioná una localidad en el mapa
            </p>
          </div>
        </div>

        {/* Buscador de ubicaciones */}
        <div className="relative mb-4">
          <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setQuery(e.target.value);
                setShowSuggestions(e.target.value.trim().length >= 2);
              }}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Buscar por ciudad, barrio o dirección..."
              className="flex-1 border-none p-0 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-0 outline-none"
            />
          </div>

          {/* Dropdown Geoapify */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-48 sm:max-h-64 overflow-y-auto">
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }}
                    onMouseEnter={() => setFocusedIdx(i)}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${i === focusedIdx
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
                  <img src="/img/Icono.png" alt="" className="w-3 h-3 object-contain animate-heartbeat inline-block" /> Buscando…
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Mapa */}
        <div>
          {explorationLoading ? (
            <div className="flex items-center justify-center h-[350px] md:h-[420px] bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex flex-col items-center gap-3">
                <img src="/img/Icono.png" alt="Cargando..." className="w-10 h-10 object-contain animate-heartbeat" />
                <span className="text-sm text-slate-400 font-medium">Cargando propiedades...</span>
              </div>
            </div>
          ) : explorationError ? (
            <div className="flex flex-col items-center justify-center h-[350px] md:h-[420px] bg-red-50 rounded-xl border border-red-100">
              <p className="text-sm text-red-500 font-medium">{explorationError}</p>
              <p className="text-xs text-slate-400 mt-2">Intentá de nuevo más tarde.</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 text-xs font-bold text-blue-600 hover:underline"
              >
                Reintentar
              </button>
            </div>
          ) : explorationProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[350px] md:h-[420px] bg-slate-50 rounded-xl border border-slate-200">
              <MapPin className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm text-slate-400 font-medium">
                No hay propiedades disponibles para {operation.toLowerCase()} en este momento.
              </p>
            </div>
          ) : (
            <ProvinceMap
              properties={explorationProperties}
              onPropertyClick={handlePropertyClick}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
