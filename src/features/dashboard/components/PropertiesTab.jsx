import React from "react";
import { Search } from "lucide-react";
import PropertyRow from "./PropertyRow";

/** Barra de filtros de propiedades (búsqueda local aplicada con "Buscar"). */
function PropertyFilters({ localSearch, setLocalSearch, localOperation, setLocalOperation, localStatus, setLocalStatus, hasActiveFilters, onApply, onClear }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Buscar</label>
          <input
            type="text"
            placeholder="Buscar por título, ubicación..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 outline-none text-xs font-bold text-slate-700 bg-white"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Operación</label>
          <select
            value={localOperation}
            onChange={(e) => setLocalOperation(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 outline-none text-xs font-bold text-slate-700 bg-white cursor-pointer"
          >
            <option value="">Todas</option>
            <option value="sale">Venta</option>
            <option value="rent">Alquiler</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estado</label>
          <select
            value={localStatus}
            onChange={(e) => setLocalStatus(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 outline-none text-xs font-bold text-slate-700 bg-white cursor-pointer"
          >
            <option value="">Todos</option>
            <option value="published">Publicado</option>
            <option value="draft">Borrador</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <button
          onClick={onApply}
          className="flex-1 md:flex-initial px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/10"
        >
          <Search className="w-3.5 h-3.5" />
          Buscar
        </button>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex-1 md:flex-initial px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all active:scale-95"
          >
            Limpiar Filtros
          </button>
        )}
      </div>
    </div>
  );
}

/** Tab de propiedades publicadas (rol vendedor): filtros + filas con reducción de precio. */
export default function PropertiesTab({ properties, filters, rowProps }) {
  const hasAppliedFilters = filters.propSearch || filters.propOperation || filters.propStatus;

  return (
    <div className="space-y-6">
      <PropertyFilters
        localSearch={filters.localSearch}
        setLocalSearch={filters.setLocalSearch}
        localOperation={filters.localOperation}
        setLocalOperation={filters.setLocalOperation}
        localStatus={filters.localStatus}
        setLocalStatus={filters.setLocalStatus}
        hasActiveFilters={hasAppliedFilters}
        onApply={filters.onApply}
        onClear={filters.onClear}
      />

      <div className="grid grid-cols-1 gap-4">
        {properties.length > 0 ? (
          properties.map((prop) => (
            <PropertyRow
              key={prop.id}
              prop={prop}
              expanded={rowProps.expandedId === prop.id}
              onToggleExpand={rowProps.onToggleExpand}
              onDelete={rowProps.onDelete}
              reductionPercent={rowProps.reductionPercent}
              setReductionPercent={rowProps.setReductionPercent}
              reductionCustom={rowProps.reductionCustom}
              setReductionCustom={rowProps.setReductionCustom}
              reducingId={rowProps.reducingId}
              onReducePrice={rowProps.onReducePrice}
            />
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-500">
              {hasAppliedFilters
                ? "No se encontraron propiedades con los filtros seleccionados."
                : "No tienes propiedades publicadas todavía."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
