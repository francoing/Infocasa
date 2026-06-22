import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2, MapPin, Search } from "lucide-react";
import Layout from "../../../common/components/Layout";
import ProvinceMap from "../../home/components/ProvinceMap";
import { mapProperty } from "../../../hooks/useProperties";
import { useGeoapifyAutocomplete } from "../../../hooks/useGeoapifyPlaces";
import { CITIES } from "../../../mock/data/cities";
import { api } from "../../../api/api";

const OPERATION_MAP = {
  Comprar: { api: "sale", label: "Comprá", searchOp: "Venta" },
  Alquilar: { api: "rent", label: "Alquilá", searchOp: "Alquiler" },
};

export default function ExplorePage() {
  const { operation } = useParams();
  const navigate = useNavigate();
  const opConfig = OPERATION_MAP[operation];

  const [explorationProperties, setExplorationProperties] = useState([]);
  const [explorationLoading, setExplorationLoading] = useState(true);
  const [explorationError, setExplorationError] = useState(null);

  // — Geoapify autocomplete para el buscador
  const { suggestions, loading: geoLoading, setQuery, clearSuggestions } = useGeoapifyAutocomplete();
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);

  // Fetch properties cuando se monta la página
  useEffect(() => {
    if (!opConfig) {
      setExplorationLoading(false);
      setExplorationError("Operación no válida");
      return;
    }

    let cancelled = false;

    const fetchProperties = async () => {
      setExplorationLoading(true);
      setExplorationError(null);
      try {
        const res = await api.get(`/properties/search?operation=${opConfig.api}&per_page=50`);
        if (cancelled) return;
        const mapped = (res.data || []).map(p => mapProperty(p));
        setExplorationProperties(mapped);
      } catch (err) {
        if (cancelled) return;
        setExplorationError(err?.message || "Error al cargar propiedades");
        setExplorationProperties([]);
      } finally {
        if (!cancelled) setExplorationLoading(false);
      }
    };

    fetchProperties();

    return () => { cancelled = true; };
  }, [opConfig]);

  // Agrupar propiedades por ciudad para los marcadores del mapa
  const cityGroups = useMemo(() => {
    const groups = {};

    explorationProperties.forEach(prop => {
      const loc = prop.locationDetails;
      if (!loc?.city) return;

      if (!groups[loc.city]) {
        const cityLookup = CITIES.find(c => c.name === loc.city);
        groups[loc.city] = {
          name: loc.city,
          province: loc.province || '',
          lat: prop.latitude || cityLookup?.lat,
          lng: prop.longitude || cityLookup?.lng,
          description: '',
        };
      }

      groups[loc.city].properties = (groups[loc.city].properties || []);
      groups[loc.city].properties.push(prop);

      if (!groups[loc.city].lat && prop.latitude) {
        groups[loc.city].lat = prop.latitude;
        groups[loc.city].lng = prop.longitude;
      }
    });

    Object.values(groups).forEach(g => {
      g.description = `${g.properties.length} ${g.properties.length === 1 ? 'propiedad' : 'propiedades'} disponible${g.properties.length === 1 ? '' : 's'}`;
    });

    return Object.values(groups).filter(g => g.lat && g.lng);
  }, [explorationProperties]);

  // Click en marcador → navegar a search con la ciudad y operación
  const handleCityClick = (cityName) => {
    const params = new URLSearchParams();
    params.set("location", cityName);
    params.set("operation", opConfig.searchOp);
    navigate(`/search?${params.toString()}`);
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
        </div>

        {/* Mapa */}
        <div>
          {explorationLoading ? (
            <div className="flex items-center justify-center h-[350px] md:h-[420px] bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
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
          ) : cityGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[350px] md:h-[420px] bg-slate-50 rounded-xl border border-slate-200">
              <MapPin className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm text-slate-400 font-medium">
                No hay propiedades disponibles para {operation.toLowerCase()} en este momento.
              </p>
            </div>
          ) : (
            <ProvinceMap
              cities={cityGroups}
              onCityClick={handleCityClick}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
