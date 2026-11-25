import React from "react";
import { Link } from "react-router-dom";
import { Home, MapPin, Store, Wrench } from "lucide-react";
import { coverageText } from "@/hooks/guide.mappers";

/** Tarjeta de resultado de la Guía: lleva a la ficha `/guia/publicacion/:slug`. */
export default function GuideListingCard({ listing }) {
  const advertiser = listing.advertiser;
  const cover = listing.coverUrl || advertiser?.logoUrl;
  const place = [listing.city, listing.province].filter(Boolean).join(", ");

  return (
    <Link
      to={`/guia/publicacion/${listing.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all"
    >
      <div className="relative h-44 bg-slate-100">
        {cover ? (
          <img src={cover} alt={listing.title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Wrench className="w-12 h-12" />
          </div>
        )}
        {listing.trade?.name && (
          <span className="absolute top-3 left-3 bg-[#ffda31] text-[#4a4a49] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
            {listing.trade.name}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 p-5 flex-1">
        <h3 className="font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
          {listing.title}
        </h3>
        {advertiser?.name && <p className="text-sm font-semibold text-slate-500">{advertiser.name}</p>}
        <p className="text-sm text-slate-500 line-clamp-2">{listing.description}</p>

        <div className="mt-auto pt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
          {place && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {place}
            </span>
          )}
          {listing.homeService && (
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <Home className="w-3.5 h-3.5" /> A domicilio
            </span>
          )}
          {listing.hasStore && (
            <span className="inline-flex items-center gap-1 text-blue-700">
              <Store className="w-3.5 h-3.5" /> Local
            </span>
          )}
        </div>
        {listing.coverageType === "province" || listing.coverageCities.length > 0 ? (
          <p className="text-[11px] text-slate-400">Trabaja en: {coverageText(listing)}</p>
        ) : null}
      </div>
    </Link>
  );
}
