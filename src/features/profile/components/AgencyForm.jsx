import React from "react";
import { Building, Loader2, Save } from "lucide-react";

const TAX_CONDITIONS = ["Responsable Inscripto", "Monotributista", "Exento", "Consumidor Final"];

/** Formulario de datos de la inmobiliaria (solo para rol agent). */
export default function AgencyForm({ form, setForm, loading, onSubmit }) {
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
          <Building className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Información de la Inmobiliaria</h2>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nombre Comercial</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={set("name")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nombre de Fantasía</label>
            <input
              type="text"
              required
              value={form.fantasy_name}
              onChange={set("fantasy_name")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-all font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Razón Social</label>
            <input
              type="text"
              required
              value={form.business_name}
              onChange={set("business_name")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">CUIT</label>
            <input
              type="text"
              required
              value={form.cuit}
              onChange={set("cuit")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-all font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Condición Fiscal</label>
            <select
              required
              value={form.tax_condition}
              onChange={set("tax_condition")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-all font-medium"
            >
              <option value="">Selecciona una condición</option>
              {TAX_CONDITIONS.map((c) => (
                <option key={c} value={c}>{c === "Exento" ? "IVA Exento" : c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Dirección Comercial</label>
            <input
              type="text"
              value={form.address}
              onChange={set("address")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-all font-medium"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Guardar Inmobiliaria
          </button>
        </div>
      </form>
    </div>
  );
}
