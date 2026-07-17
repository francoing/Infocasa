import React from "react";
import { Lock, Loader2, Save } from "lucide-react";

/** Formulario de cambio de contraseña. */
export default function PasswordForm({ form, setForm, loading, onSubmit }) {
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
          <Lock className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Seguridad y Contraseña</h2>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña Actual</label>
          <input
            type="password"
            required
            value={form.current_password}
            onChange={set("current_password")}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-all"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nueva Contraseña</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={set("password")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password_confirmation}
              onChange={set("password_confirmation")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-all"
            />
          </div>
        </div>
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Actualizar Contraseña
          </button>
        </div>
      </form>
    </div>
  );
}
