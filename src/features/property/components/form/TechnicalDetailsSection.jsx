import React from "react";
import { Maximize, Home, Bed, Bath } from "lucide-react";

const LABEL = "text-xs font-black text-slate-400 uppercase tracking-widest ml-1";
const INPUT = "w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold";

const EXTRAS = [
  { value: "jardin", label: "Jardín" },
  { value: "pileta", label: "Pileta" },
  { value: "parrilla", label: "Parrilla" },
  { value: "quincho", label: "Quincho" },
  { value: "balcon", label: "Balcón" },
  { value: "terraza", label: "Terraza" },
  { value: "lavadero", label: "Lavadero" },
  { value: "patio", label: "Patio" },
  { value: "azotea", label: "Azotea" },
  { value: "fondo", label: "Fondo" },
];

const NumberField = ({ name, value, onChange, placeholder, className = INPUT }) => (
  <input type="number" name={name} value={value} onChange={onChange} className={className} placeholder={placeholder} />
);

/** Sección "Detalles Técnicos y Superficie": m², ambientes, cocheras/año y extras. */
export default function TechnicalDetailsSection({ formData, handleChange, onFeatureToggle }) {
  return (
    <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Maximize className="w-5 h-5 text-blue-600" />
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Detalles Técnicos y Superficie</h3>
      </div>

      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mb-2">
          <label className={`${LABEL} flex items-center gap-1`}><Maximize className="w-3.5 h-3.5 text-blue-600" /> m² Totales</label>
          <label className={`${LABEL} flex items-center gap-1`}><Maximize className="w-3.5 h-3.5 text-blue-600 rotate-90" /> m² Cubiertos</label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <NumberField name="area" value={formData.area} onChange={handleChange} placeholder="Ej: 120" />
          <NumberField name="area_covered" value={formData.area_covered} onChange={handleChange} placeholder="Ej: 100" />
        </div>
      </div>

      <div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 mb-2">
          <label className={`${LABEL} flex items-center gap-1`}><Home className="w-3.5 h-3.5 text-blue-600" /> Ambientes</label>
          <label className={`${LABEL} flex items-center gap-1`}><Bed className="w-3.5 h-3.5 text-blue-600" /> Dorm.</label>
          <label className={`${LABEL} flex items-center gap-1`}><Bath className="w-3.5 h-3.5 text-blue-600" /> Baños</label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NumberField name="rooms" value={formData.rooms} onChange={handleChange} placeholder="Ej: 3" className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold" />
          <NumberField name="bedrooms" value={formData.bedrooms} onChange={handleChange} placeholder="Ej: 2" className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold" />
          <NumberField name="bathrooms" value={formData.bathrooms} onChange={handleChange} placeholder="Ej: 1" className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold" />
        </div>
      </div>

      <div className="pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mb-2">
          <label className={LABEL}>Cocheras / Garajes</label>
          <label className={LABEL}>Año de Edificación</label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <NumberField name="parking_spaces" value={formData.parking_spaces} onChange={handleChange} placeholder="Ej: 1" />
          <NumberField name="construction_year" value={formData.construction_year} onChange={handleChange} placeholder="Ej: 2018" />
        </div>
      </div>

      <div className="pt-2">
        <label className={`${LABEL} mb-3 block`}>Extras de la propiedad</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {EXTRAS.map((extra) => {
            const isChecked = formData.features.includes(extra.value);
            return (
              <button
                key={extra.value}
                type="button"
                onClick={() => onFeatureToggle(extra.value)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all ${isChecked ? "border-blue-500 bg-blue-50/50 text-blue-700 font-bold" : "border-slate-200 hover:border-slate-300 text-slate-600"}`}
              >
                <input type="checkbox" checked={isChecked} readOnly className="w-4 h-4 rounded text-blue-600 border-slate-300 pointer-events-none" />
                <span className="text-[10px] uppercase font-black tracking-tighter leading-none">{extra.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
