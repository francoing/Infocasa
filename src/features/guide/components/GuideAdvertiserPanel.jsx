import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, LifeBuoy } from "lucide-react";
import Loader from "@/common/components/Loader";
import { useMyGuideAdvertiser } from "@/hooks/useGuideAdvertiser";
import { useMyGuideListings } from "@/hooks/useGuideListings";
import GuideAdvertiserForm from "./GuideAdvertiserForm";
import GuideInquiriesList from "./GuideInquiriesList";
import GuideMyListings from "./GuideMyListings";
import GuideStatusBadge from "./GuideStatusBadge";

/** Sub-pestañas del panel. "Mi suscripción" y "Estadísticas" llegan en la Etapa 2. */
const GUIDE_PANEL_TABS = [
  { id: "publicaciones", label: "Mis publicaciones" },
  { id: "consultas", label: "Consultas recibidas" },
  { id: "visitas", label: "Visitas" },
  { id: "perfil", label: "Mi perfil" },
];

/**
 * Pestaña "InfoCasa Guía" del dashboard (cualquier rol). Sin perfil muestra el alta;
 * con perfil, sus sub-pestañas. `initialTab` sale de `?guia=` en la URL.
 */
export default function GuideAdvertiserPanel({ initialTab = "publicaciones" }) {
  const { data: advertiser, isLoading } = useMyGuideAdvertiser();
  const { data: listings = [] } = useMyGuideListings({ enabled: !!advertiser });
  const [tab, setTab] = useState(GUIDE_PANEL_TABS.some((t) => t.id === initialTab) ? initialTab : "publicaciones");

  if (isLoading) return <Loader inline className="py-16" />;

  if (!advertiser) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Creá tu perfil en InfoCasa Guía</h2>
        <GuideAdvertiserForm advertiser={null} onSaved={() => setTab("publicaciones")} />
      </div>
    );
  }

  const suspended = advertiser.status === "suspended";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-100 p-5">
        <div className="flex items-center gap-3 min-w-0">
          <p className="font-bold text-slate-900 truncate">{advertiser.name}</p>
          <GuideStatusBadge status={advertiser.status} />
        </div>
        <div className="flex flex-wrap gap-4">
          <Link to={`/guia/${advertiser.slug}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:underline">
            Ver mi perfil público <ExternalLink className="w-4 h-4" />
          </Link>
          <Link to="/contacto" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:underline">
            <LifeBuoy className="w-4 h-4" /> Solicitar asistencia
          </Link>
        </div>
      </div>

      {suspended && (
        <p className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm font-semibold text-red-700">
          Tu perfil de anunciante está suspendido: tus publicaciones no se muestran. Escribinos desde Contacto si creés que es un error.
        </p>
      )}

      <div className="flex flex-wrap gap-2" role="tablist">
        {GUIDE_PANEL_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${tab === t.id ? "bg-slate-900 text-white" : "bg-white text-slate-500 border border-slate-200 hover:text-slate-800"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "publicaciones" && <GuideMyListings listings={listings} disabled={suspended} />}
      {tab === "consultas" && <GuideInquiriesList />}
      {tab === "visitas" && <GuideVisits listings={listings} />}
      {tab === "perfil" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8">
          <GuideAdvertiserForm key={advertiser.id} advertiser={advertiser} />
        </div>
      )}
    </div>
  );
}

function GuideVisits({ listings }) {
  const total = listings.reduce((sum, l) => sum + l.viewsCount, 0);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-4">
      <p className="text-sm text-slate-500">
        Total: <span className="font-black text-slate-900 text-lg">{total}</span> visitas a tus publicaciones.
      </p>
      <ul className="divide-y divide-slate-100">
        {[...listings].sort((a, b) => b.viewsCount - a.viewsCount).map((l) => (
          <li key={l.id} className="flex items-center justify-between gap-4 py-3">
            <span className="text-sm font-semibold text-slate-700 truncate">{l.title}</span>
            <span className="text-sm font-black text-slate-900 shrink-0">{l.viewsCount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
