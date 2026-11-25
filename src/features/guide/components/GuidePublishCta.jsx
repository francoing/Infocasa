import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const GUIDE_PANEL_PATH = "/dashboard?tab=guia";

/**
 * Llamado a publicar en la Guía. Con sesión va al panel; sin sesión, al registro actual y,
 * al terminar, vuelve al panel de la Guía (`state.next`).
 */
export default function GuidePublishCta({ user }) {
  const target = user
    ? { to: GUIDE_PANEL_PATH }
    : { to: "/register", state: { next: GUIDE_PANEL_PATH } };

  return (
    <div className="rounded-3xl bg-[#1a1a1a] text-white p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h2 className="text-2xl font-black">¿Ofrecés un servicio para la casa?</h2>
        <p className="text-white/70 mt-1">Publicá gratis en InfoCasa Guía y recibí consultas de tu zona.</p>
      </div>
      <Link
        {...target}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ffda31] text-[#1a1a1a] font-black hover:brightness-95 transition-all active:scale-95"
      >
        Publicá gratis en la Guía <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  );
}
