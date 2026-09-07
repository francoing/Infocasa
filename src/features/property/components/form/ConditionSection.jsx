import React from "react";
import { Home } from "lucide-react";

const LABEL = "text-xs font-black text-slate-400 uppercase tracking-widest ml-1";
const SELECT = "w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold bg-white";

const CheckboxCard = ({ id, name, checked, onChange, children }) => (
  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
    <input type="checkbox" id={id} name={name} checked={checked} onChange={onChange} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer" />
    <label htmlFor={id} className="text-sm font-bold text-slate-700 cursor-pointer selection:bg-transparent select-none">{children}</label>
  </div>
);

/** Sección "Estado y Normas": condición, disposición/orientación, mascotas/uso profesional. */
export default function ConditionSection({ formData, handleChange }) {
  return (
    <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Home className="w-5 h-5 text-blue-600" />
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Estado y Normas</h3>
      </div>

      <div className="space-y-2">
        <label className={LABEL}>Estado de la propiedad</label>
        <select name="condition" value={formData.condition} onChange={handleChange} className={SELECT}>
          <option value="good">Excelente / Bueno</option>
          <option value="new">A Estrenar</option>
          <option value="under_construction">En Construcción</option>
          <option value="to_refurbish">A Refaccionar</option>
        </select>
      </div>

      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mb-2">
          <label className={LABEL}>Disposición</label>
          <label className={LABEL}>Orientación</label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <select name="disposition" value={formData.disposition} onChange={handleChange} className={SELECT}>
            <option value="">No especifica</option>
            <option value="front">Frente</option>
            <option value="back">Contrafrente</option>
            <option value="lateral">Lateral</option>
            <option value="internal">Interno</option>
          </select>
          <select name="orientation" value={formData.orientation} onChange={handleChange} className={SELECT}>
            <option value="">No especifica</option>
            <option value="north">Norte</option>
            <option value="south">Sur</option>
            <option value="east">Este</option>
            <option value="west">Oeste</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <CheckboxCard id="pets_allowed" name="pets_allowed" checked={formData.pets_allowed} onChange={handleChange}>Acepta Mascotas</CheckboxCard>
        <CheckboxCard id="professional_use" name="professional_use" checked={formData.professional_use} onChange={handleChange}>Apto Profesional / Uso Comercial</CheckboxCard>
      </div>
    </section>
  );
}
