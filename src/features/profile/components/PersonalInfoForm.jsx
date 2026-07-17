import React from "react";
import { User as UserIcon, Phone, Loader2, Save } from "lucide-react";

/** Formulario de información personal (nombre + teléfono). */
export default function PersonalInfoForm({ form, setForm, loading, onSubmit }) {
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
          <UserIcon className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Información Personal</h2>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Nombre completo</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={set("name")}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-all"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-2">Cód. Área</label>
            <input
              type="text"
              value={form.phone_area}
              onChange={set("phone_area")}
              placeholder="Ej: 11"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-all"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Teléfono / Celular</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={form.phone_number}
                onChange={set("phone_number")}
                placeholder="Ej: 12345678"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-all"
              />
            </div>
          </div>
        </div>
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}
