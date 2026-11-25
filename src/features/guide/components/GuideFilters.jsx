import React, { useState } from "react";
import { LocateFixed, X } from "lucide-react";
import { withFilter } from "@/hooks/guide.query";
import { Checkbox, GUIDE_PROVINCES, Select, inputClass } from "./GuideFields";

/**
 * Filtros de la búsqueda de la Guía. Recibe los filtros actuales (de la URL) y avisa los
 * nuevos con `onChange(next)`; la página los vuelve a escribir en la URL.
 */
export default function GuideFilters({ filters, categories = [], onChange, onClear }) {
  const [geoError, setGeoError] = useState("");
  const [cityDraft, setCityDraft] = useState(filters.works_in ?? "");
  const set = (key, value) => onChange(withFilter(filters, key, value));
  const category = categories.find((c) => c.slug === filters.category);
  const trades = category ? category.trades : categories.flatMap((c) => c.trades);

  const locateMe = () => {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError("Tu navegador no permite usar la ubicación.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const next = { ...withFilter(filters, "lat", coords.latitude.toFixed(5)), lng: coords.longitude.toFixed(5) };
        onChange({ ...next, radius_km: filters.radius_km || 10 });
      },
      () => setGeoError("No pudimos obtener tu ubicación. Revisá el permiso del navegador.")
    );
  };

  const clearNear = () => {
    const next = { ...filters };
    delete next.lat;
    delete next.lng;
    delete next.radius_km;
    delete next.page;
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-900">Filtros</h2>
        <button type="button" onClick={onClear} className="text-xs font-bold text-red-600 hover:underline">
          Limpiar
        </button>
      </div>

      <Select
        label="Categoría"
        value={filters.category ?? ""}
        onChange={(e) => set("category", e.target.value)}
        placeholder="Todas"
        options={categories.map((c) => ({ value: c.slug, label: c.name }))}
      />
      <Select
        label="Rubro"
        value={filters.trade ?? ""}
        onChange={(e) => set("trade", e.target.value)}
        placeholder="Todos"
        options={trades.map((t) => ({ value: t.slug, label: t.name }))}
      />
      <Select
        label="Provincia"
        value={filters.province ?? ""}
        onChange={(e) => set("province", e.target.value)}
        placeholder="Todas"
        options={GUIDE_PROVINCES}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          set("works_in", cityDraft.trim());
        }}
        className="flex flex-col gap-1.5"
      >
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Trabaja en la localidad</span>
        <div className="flex gap-2">
          <input value={cityDraft} onChange={(e) => setCityDraft(e.target.value)} placeholder="Ej: Yerba Buena" className={inputClass} />
          <button type="submit" className="px-3 rounded-xl bg-slate-900 text-white text-xs font-bold">OK</button>
        </div>
        <span className="text-xs text-slate-400">Incluye a quienes cubren esa localidad o toda la provincia.</span>
      </form>

      <div className="flex flex-col gap-3">
        <Checkbox label="Atención a domicilio" checked={!!filters.home_service} onChange={(v) => set("home_service", v ? 1 : "")} />
        <Checkbox label="Con local físico" checked={!!filters.has_store} onChange={(v) => set("has_store", v ? 1 : "")} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cercanía</span>
        {filters.lat ? (
          <div className="flex items-center gap-2">
            <select value={filters.radius_km ?? 10} onChange={(e) => set("radius_km", e.target.value)} className={inputClass} aria-label="Radio">
              {[5, 10, 25, 50, 100].map((km) => (
                <option key={km} value={km}>A menos de {km} km</option>
              ))}
            </select>
            <button type="button" onClick={clearNear} aria-label="Quitar cercanía" className="p-2 rounded-lg hover:bg-slate-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={locateMe}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <LocateFixed className="w-4 h-4" /> Cerca mío
          </button>
        )}
        {geoError && <p className="text-xs text-red-600 font-semibold">{geoError}</p>}
      </div>
    </div>
  );
}
