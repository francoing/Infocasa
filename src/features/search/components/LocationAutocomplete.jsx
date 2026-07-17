import React, { useRef, useState } from "react";
import { Search as SearchIcon, MapPin, Loader2 } from "lucide-react";
import { useGeoapifyAutocomplete } from "../../../hooks/useGeoapifyPlaces";

/**
 * Input de ciudad/ubicación con autocompletado Geoapify (capa de datos vía hook).
 * `value` es el texto actual; `onChange(cityString)` se llama al tipear o elegir sugerencia.
 */
export default function LocationAutocomplete({ value, onChange }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const inputRef = useRef(null);
  const { suggestions, loading, setQuery, clearSuggestions } = useGeoapifyAutocomplete();

  const pick = (s) => {
    onChange(s.city || s.state || s.value);
    setShowSuggestions(false);
    setFocusedIdx(-1);
    clearSuggestions();
  };

  const onKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIdx((p) => Math.min(p + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIdx((p) => Math.max(p - 1, 0));
    } else if (e.key === "Enter" && focusedIdx >= 0) {
      e.preventDefault();
      pick(suggestions[focusedIdx]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setFocusedIdx(-1);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-500 block">Ciudad / Ubicación</label>
      <div className="relative">
        <input
          ref={inputRef}
          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all outline-none"
          placeholder="Ej: Tigre"
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setQuery(e.target.value);
            setShowSuggestions(e.target.value.trim().length >= 2);
          }}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={onKeyDown}
          autoComplete="off"
        />
        <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-48 sm:max-h-64 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(s);
                  }}
                  onMouseEnter={() => setFocusedIdx(i)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                    i === focusedIdx ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <MapPin className="w-4 h-4 flex-shrink-0 text-slate-400" />
                  <span className="font-medium">{s.value}</span>
                </button>
              </li>
            ))}
            {loading && (
              <li className="px-4 py-2 text-xs text-slate-400 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Buscando…
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
