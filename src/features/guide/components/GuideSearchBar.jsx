import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search } from "lucide-react";
import { guideSearchUrl } from "@/hooks/guide.query";

/**
 * Buscador de la Guía: qué (oficio, profesión, comercio, producto) + dónde (localidad donde
 * tiene que trabajar). Navega a `/guia/buscar` conservando los filtros extra que reciba.
 */
export default function GuideSearchBar({ initialQ = "", initialWhere = "", baseFilters = {}, compact = false }) {
  const navigate = useNavigate();
  const [q, setQ] = useState(initialQ);
  const [where, setWhere] = useState(initialWhere);

  const submit = (e) => {
    e.preventDefault();
    navigate(guideSearchUrl({ ...baseFilters, q: q.trim(), works_in: where.trim(), page: undefined }));
  };

  return (
    <form
      onSubmit={submit}
      role="search"
      className={`flex flex-col md:flex-row gap-2 bg-white rounded-2xl shadow-xl ${compact ? "p-2" : "p-3"}`}
    >
      <label className="flex items-center gap-2 flex-1 px-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="¿Qué necesitás? Ej: electricista, corralón, arquitecto"
          aria-label="Qué buscás"
          className="w-full py-3 outline-none text-sm font-medium text-slate-700 bg-transparent"
        />
      </label>
      <label className="flex items-center gap-2 md:w-64 px-3 md:border-l border-slate-100">
        <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          value={where}
          onChange={(e) => setWhere(e.target.value)}
          placeholder="Localidad"
          aria-label="Localidad"
          className="w-full py-3 outline-none text-sm font-medium text-slate-700 bg-transparent"
        />
      </label>
      <button
        type="submit"
        className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all active:scale-95"
      >
        Buscar
      </button>
    </form>
  );
}
