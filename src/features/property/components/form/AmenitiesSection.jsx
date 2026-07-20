import React from "react";
import { Sparkles } from "lucide-react";

const formatLabel = (name) => name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Sección "Servicios y Amenities": toggles de features disponibles (desde el backend). */
export default function AmenitiesSection({ availableFeatures, features, onFeatureToggle }) {
  return (
    <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Servicios y Amenities</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {availableFeatures.map((feat) => {
          const isChecked = features.includes(feat.name);
          return (
            <button
              key={feat.id}
              type="button"
              onClick={() => onFeatureToggle(feat.name)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${isChecked ? "border-blue-500 bg-blue-50/50 text-blue-700 font-bold" : "border-slate-200 hover:border-slate-300 text-slate-600"}`}
            >
              <input type="checkbox" checked={isChecked} readOnly className="w-4 h-4 rounded text-blue-600 border-slate-300 pointer-events-none" />
              <span className="text-[10px] uppercase font-black tracking-tighter leading-none">{formatLabel(feat.name)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
