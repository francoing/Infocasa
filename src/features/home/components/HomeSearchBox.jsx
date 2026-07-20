import React from "react";
import { motion } from "framer-motion";
import { MapPin, Loader2, ChevronDown } from "lucide-react";

const PROPERTY_TYPES = ["Departamento", "Casa", "PH", "Terreno"];
const PRICE_OPTIONS = [
  { value: "10000000", label: "Hasta $10M" },
  { value: "30000000", label: "Hasta $30M" },
  { value: "50000000", label: "Hasta $50M" },
  { value: "100000000", label: "Hasta $100M" },
];
const TABS = ["Comprar", "Alquilar", "Temporario"];

/** Caja de búsqueda del hero. Recibe toda la API de `useHomeSearch` vía `s`. */
export default function HomeSearchBox({ s }) {
  return (
    <motion.form
      onSubmit={s.handleSearch}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-5 relative text-left"
    >
      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-full mb-2">
        {TABS.map((op) => (
          <button
            key={op}
            type="button"
            onClick={() => s.setOperation(op)}
            className={`flex-1 text-center py-2 rounded-full font-bold text-sm transition-all duration-300 ${
              s.operation === op ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {op}
          </button>
        ))}
      </div>

      {/* Ubicación con autocompletado Geoapify */}
      <div className="space-y-1.5 relative z-20">
        <label className="text-xs uppercase tracking-widest font-black text-blue-600 block">Ubicación</label>
        <div className="relative">
          <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-sm">
            <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <input
              ref={s.inputRef}
              type="text"
              value={s.inputValue}
              onChange={(e) => {
                s.setInputValue(e.target.value);
                s.setQuery(e.target.value);
                s.setShowSuggestions(e.target.value.trim().length >= 2);
              }}
              onKeyDown={s.handleTagKeyDown}
              onFocus={() => s.setShowSuggestions(s.suggestions.length > 0)}
              onBlur={() => setTimeout(() => s.setShowSuggestions(false), 200)}
              placeholder="¿Dónde querés vivir?"
              autoComplete="off"
              className="flex-1 border-none p-0 bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-0 outline-none"
            />
          </div>

          {s.showSuggestions && s.suggestions.length > 0 && (
            <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-48 sm:max-h-64 overflow-y-auto">
              {s.suggestions.map((sug, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      s.selectSuggestion(sug);
                    }}
                    onMouseEnter={() => s.setFocusedIdx(i)}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                      i === s.focusedIdx ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <MapPin className="w-4 h-4 flex-shrink-0 text-slate-400" />
                    <span className="font-semibold">{sug.value}</span>
                  </button>
                </li>
              ))}
              {s.geoLoading && (
                <li className="px-4 py-2 text-xs text-slate-400 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Buscando…
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Tipo y Precio */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-widest font-black text-blue-600 block">Tipo</label>
          <div className="relative">
            <select
              value={s.propertyTypes}
              onChange={(e) => s.setPropertyTypes(e.target.value)}
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

        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-widest font-black text-blue-600 block">Precio</label>
          <div className="relative">
            <select
              value={s.maxPrice}
              onChange={(e) => s.setMaxPrice(e.target.value)}
              className="w-full appearance-none px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all pr-10 cursor-pointer shadow-sm outline-none"
            >
              <option value="">Sin límite</option>
              {PRICE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-4 bg-blue-600 text-white rounded-xl font-extrabold text-sm uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-4"
      >
        Buscar propiedades
      </button>
    </motion.form>
  );
}
