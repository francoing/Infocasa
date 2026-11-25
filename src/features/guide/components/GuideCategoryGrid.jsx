import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, Building2, Hammer, ShoppingBag } from "lucide-react";
import { guideSearchUrl } from "@/hooks/guide.query";

const ICONS = {
  profesionales: Briefcase,
  "oficios-y-servicios": Hammer,
  "comercios-y-proveedores": ShoppingBag,
  empresas: Building2,
};

/** Las categorías de la Guía con sus rubros (cada uno lleva a la búsqueda filtrada). */
export default function GuideCategoryGrid({ categories = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {categories.map((category) => {
        const Icon = ICONS[category.slug] ?? Briefcase;
        return (
          <section key={category.id} className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-4 hover:shadow-lg transition-all">
            <Link to={guideSearchUrl({ category: category.slug })} className="flex items-center gap-3 group">
              <span className="w-11 h-11 rounded-xl bg-[#ffda31] text-[#4a4a49] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </span>
              <span>
                <span className="block font-bold text-slate-900 group-hover:text-red-600 transition-colors">{category.name}</span>
                <span className="block text-xs text-slate-400 font-semibold">
                  {category.listingsCount} {category.listingsCount === 1 ? "publicación" : "publicaciones"}
                </span>
              </span>
            </Link>
            <ul className="flex flex-wrap gap-2">
              {category.trades.map((trade) => (
                <li key={trade.id}>
                  <Link
                    to={guideSearchUrl({ category: category.slug, trade: trade.slug })}
                    className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-slate-600 hover:border-red-200 hover:text-red-600 transition-all"
                  >
                    {trade.name}
                    {trade.listingsCount > 0 && <span className="text-slate-400"> · {trade.listingsCount}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
