import React from "react";

/** Sección "Gastos y Expensas": monto + moneda de expensas (opcional). */
export default function ExpensesSection({ formData, handleChange }) {
  return (
    <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">💰</span>
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Gastos y Expensas</h3>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Monto de Expensas (Opcional)</label>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
            <input
              type="number"
              name="expenses_amount"
              value={formData.expenses_amount}
              onChange={handleChange}
              className="w-full pl-10 pr-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold text-lg"
              placeholder="0"
            />
          </div>
          <select
            name="expenses_currency"
            value={formData.expenses_currency}
            onChange={handleChange}
            className="w-28 px-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold bg-white"
          >
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>
    </section>
  );
}
