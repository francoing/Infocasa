import React from "react";

/** Barra de filtros de consultas (estado + rango de fechas). Compartida por las tabs de leads. */
export default function LeadFilters({ status, setStatus, from, setFrom, to, setTo }) {
  const hasFilters = status || from || to;

  const clear = () => {
    setStatus("");
    setFrom("");
    setTo("");
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estado</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 outline-none text-xs font-bold text-slate-700 bg-white cursor-pointer"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="contacted">Contactado</option>
            <option value="closed">Cerrado</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Desde</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 outline-none text-xs font-bold text-slate-700 bg-white"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hasta</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 outline-none text-xs font-bold text-slate-700 bg-white"
          />
        </div>
      </div>
      {hasFilters && (
        <button
          onClick={clear}
          className="w-full md:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all active:scale-95"
        >
          Limpiar Filtros
        </button>
      )}
    </div>
  );
}
