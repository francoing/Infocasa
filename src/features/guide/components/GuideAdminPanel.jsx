import React, { useState } from "react";
import GuideAdminAdvertisers from "./GuideAdminAdvertisers";
import GuideAdminListings from "./GuideAdminListings";
import GuideAdminTaxonomy from "./GuideAdminTaxonomy";

const TABS = [
  { id: "listings", label: "Publicaciones", Component: GuideAdminListings },
  { id: "advertisers", label: "Anunciantes", Component: GuideAdminAdvertisers },
  { id: "taxonomy", label: "Categorías y rubros", Component: GuideAdminTaxonomy },
];

/** Pestaña "InfoCasa Guía" del dashboard admin. */
export default function GuideAdminPanel() {
  const [tab, setTab] = useState("listings");
  const Active = TABS.find((t) => t.id === tab).Component;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${tab === t.id ? "bg-amber-600 text-white" : "bg-white text-slate-500 border border-slate-200 hover:text-slate-800"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Active />
    </div>
  );
}
