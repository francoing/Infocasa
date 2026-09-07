import React from "react";
import { TrendingDown } from "lucide-react";

const PRICE_LABELS = {
  Alquiler: "Precio de Alquiler",
  Desarrollo: "Precio de Desarrollo",
};

/** Caja de precio + indicador de rebaja (si hay historial de precios). */
export default function PropertyPriceBox({ property }) {
  const symbol = property.priceCurrency === "USD" ? "USD" : "$";
  const lastDrop = property.priceHistory?.[property.priceHistory.length - 1];

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
      <div>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
          {PRICE_LABELS[property.operation] || "Precio de Venta"}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-slate-900">
            {symbol} {property.price.toLocaleString()}
            {property.operation === "Alquiler" && <span className="text-sm font-bold text-slate-500"> /mes</span>}
          </span>
        </div>
        {lastDrop && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-green-600">
            <TrendingDown className="w-4 h-4" />
            <span>Rebajado de {symbol} {lastDrop.oldPrice.toLocaleString()} ({lastDrop.percentage}% off)</span>
          </div>
        )}
      </div>
    </div>
  );
}
