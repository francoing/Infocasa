import React from "react";
import { Sparkles } from "lucide-react";

const LABEL = "text-xs font-black text-slate-400 uppercase tracking-widest ml-1";

/** Sección "Información Principal": título, descripción, tipo/operación, precio/moneda. */
export default function MainInfoSection({ formData, handleChange, propertyTypes }) {
  return (
    <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Información Principal</h3>
      </div>

      <div className="space-y-2">
        <label className={LABEL}>Título de la publicación</label>
        <input
          required
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-semibold"
          placeholder="Ej: Mansión Moderna en Yerba Buena"
        />
      </div>

      <div className="space-y-2">
        <label className={LABEL}>Descripción detallada</label>
        <textarea
          required
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-medium leading-relaxed"
          placeholder="Describe las características principales..."
        />
      </div>

      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mb-2">
          <label className={LABEL}>Tipo de Propiedad</label>
          <label className={LABEL}>Operación</label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <select
            required
            name="property_type_id"
            value={formData.property_type_id}
            onChange={handleChange}
            className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold bg-white"
          >
            <option value="">Selecciona tipo...</option>
            {propertyTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <select name="status" value={formData.status} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold bg-white">
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
            <option value="temporary_rent">Alquiler Temporario</option>
            <option value="desarrollo">Desarrollo</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-2">
          <label className={LABEL}>Precio</label>
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
            <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full pl-10 pr-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-black text-xl" placeholder="0" />
          </div>
        </div>
        <div className="col-span-1 space-y-2">
          <label className={LABEL}>Moneda</label>
          <select name="price_currency" value={formData.price_currency} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold bg-white">
            <option value="USD">USD</option>
            <option value="ARS">ARS</option>
          </select>
        </div>
      </div>
    </section>
  );
}
