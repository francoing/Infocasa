import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Eye, Heart, ExternalLink, Edit, Trash2, ChevronDown, ChevronUp, TrendingDown, Percent, Loader2 } from "lucide-react";

/** Panel expandible de reducción de precio (dentro de PropertyRow). */
function PriceReductionPanel({ prop, reductionPercent, setReductionPercent, reductionCustom, setReductionCustom, reducingId, onReducePrice }) {
  const isReducing = reducingId === prop.id;
  const hasCustom = !!reductionCustom[prop.id];

  return (
    <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex flex-col md:flex-row justify-between gap-6">
      <div className="flex-1">
        <h4 className="font-bold text-slate-900 text-sm mb-1">Ajustar Precio (Reducción Directa)</h4>
        <p className="text-slate-500 text-xs">Aplica una reducción porcentual al valor de venta y registra un badge visual de descuento en la publicación.</p>
        {prop.priceHistory?.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historial de rebajas:</p>
            {prop.priceHistory.map((h, i) => (
              <p key={i} className="text-xs font-semibold text-green-600">
                Rebaja del {h.percentage}% (USD {h.oldPrice.toLocaleString()} → USD {h.newPrice.toLocaleString()}) el {new Date(h.date).toLocaleDateString()}
              </p>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descuento</span>
          <div className="flex gap-2">
            {[5, 10, 15].map((pct) => (
              <button
                key={pct}
                onClick={() => setReductionPercent(pct)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${reductionPercent === pct && !hasCustom ? "bg-amber-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"}`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Otro % / Aplicar</span>
          <div className="flex items-center gap-2">
            <div className="relative w-28">
              <input
                type="number"
                placeholder="% personalizado"
                value={reductionCustom[prop.id] || ""}
                onChange={(e) => setReductionCustom((prev) => ({ ...prev, [prop.id]: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-600 outline-none text-xs font-bold"
              />
              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            </div>
            <button
              onClick={() => onReducePrice(prop)}
              disabled={isReducing || (!hasCustom && !reductionPercent)}
              className="px-5 py-2 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-1"
            >
              {isReducing ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingDown className="w-3 h-3" />}
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Fila de una propiedad publicada: datos, métricas, acciones y reducción de precio. */
export default function PropertyRow({ prop, expanded, onToggleExpand, onDelete, ...reduction }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 flex flex-col md:flex-row items-center gap-6">
        <div className="w-full md:w-32 h-24 rounded-xl overflow-hidden flex-shrink-0">
          <img src={prop.imageUrl} alt={prop.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-lg truncate">{prop.title}</h3>
            {prop.priceHistory?.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-600 rounded-full uppercase whitespace-nowrap">
                Precio reducido
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4 text-slate-400" /> {prop.location}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <p className="font-black text-slate-900">USD {prop.price.toLocaleString()}</p>
            <div className="flex items-center gap-3 ml-2 border-l border-slate-200 pl-4">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg" title="Visitas">
                <Eye className="w-3.5 h-3.5 text-blue-500" /> {prop.viewsCount || 0}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg" title="Favoritos">
                <Heart className="w-3.5 h-3.5 text-red-500" /> {prop.favoritesCount || 0}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <Link to={`/property/${prop.id}`} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Ver publicación" target="_blank">
            <ExternalLink className="w-5 h-5" />
          </Link>
          <Link to={`/dashboard/properties/edit/${prop.id}`} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Editar">
            <Edit className="w-5 h-5" />
          </Link>
          <button onClick={() => onDelete(prop.id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Eliminar">
            <Trash2 className="w-5 h-5" />
          </button>
          <button onClick={() => onToggleExpand(prop.id)} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all" title="Ajustar Precio">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {expanded && <PriceReductionPanel prop={prop} {...reduction} />}
    </div>
  );
}
