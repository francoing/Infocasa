import React from "react";
import { Sparkles, Loader2, Check } from "lucide-react";

// Capitaliza la primera letra de cada palabra, respetando acentos
const formatLabel = (name) =>
  name
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** Sección "Servicios y Amenities": chips togglables desde el backend. */
export default function AmenitiesSection({
  availableFeatures,
  features,
  onFeatureToggle,
  loading,
}) {
  return (
    <section className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
          Servicios y Amenities
        </h3>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm font-bold py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando servicios...
        </div>
      ) : availableFeatures.length === 0 ? (
        <p className="text-slate-400 text-sm font-medium py-4">
          No hay servicios disponibles para seleccionar.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {availableFeatures.map((feat) => {
            const isChecked = features.includes(feat.name);
            return (
              <button
                key={feat.id}
                type="button"
                onClick={() => onFeatureToggle(feat.name)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm font-bold transition-all ${
                  isChecked
                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {isChecked ? (
                  <Check className="w-4 h-4 shrink-0" strokeWidth={3} />
                ) : (
                  <span className="w-4 h-4 shrink-0 rounded-full border-2 border-slate-300" />
                )}
                <span className="whitespace-nowrap">{formatLabel(feat.name)}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}