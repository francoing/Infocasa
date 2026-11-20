import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { VERSIONS, CURRENT_VERSION, formatVersionDate } from "../../../data/versions";

const BRAND = {
  red: "#ff0019",
  gold: "#ffda31",
  gray: "#4a4a49",
};

/** Historial de versiones de la plataforma (contenido estático en data/versions.js). */
export default function VersionesPage() {
  return (
    <div className="w-full">
      <section className="relative overflow-hidden" style={{ background: BRAND.red }}>
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20 text-center">
          <span className="inline-block bg-white/15 text-white border border-white/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-5 backdrop-blur-sm">
            Versiones
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Novedades de InfoCasa</h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto font-medium">
            Estás usando la versión <strong>{CURRENT_VERSION}</strong>. Acá vas a encontrar todo lo que vamos sumando a la plataforma.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-14 space-y-8">
        {VERSIONS.map((release, index) => (
          <article key={release.version} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-2xl font-black" style={{ color: BRAND.gray }}>
                Versión {release.version}
              </h2>
              {index === 0 && (
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"
                  style={{ background: BRAND.gold, color: BRAND.gray }}
                >
                  <Sparkles className="w-3 h-3" /> Actual
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-400 mb-6">
              {release.title} · {formatVersionDate(release.date)}
            </p>
            <ul className="space-y-3">
              {release.highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-medium" style={{ color: BRAND.gray }}>
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: BRAND.red }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  );
}
