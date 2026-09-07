import React from "react";
import { Link } from "react-router-dom";
import Layout from "../../../common/components/Layout";

/**
 * Shell de las páginas legales (Términos, Privacidad). Envuelve en el Layout
 * (header + footer de la marca) y da una tipografía de lectura larga consistente.
 * Los primitivos (Section, Clause, P, UL, OL, Note) se comparten entre páginas.
 */
export default function LegalDoc({ kicker, title, version, updated, intro, toc, children }) {
  return (
    <Layout>
      <div className="bg-slate-50">
        <header className="bg-white border-b-4 border-[#ff0019]">
          <div className="max-w-3xl mx-auto px-6 py-14">
            {kicker && (
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ff0019] mb-3">
                {kicker}
              </p>
            )}
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight text-balance">
              {title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs font-medium text-slate-500">
              {version && <span>Versión {version}</span>}
              {updated && <span>Última actualización: {updated}</span>}
            </div>
            {intro && <p className="mt-6 text-slate-600 leading-relaxed">{intro}</p>}
          </div>
        </header>

        <article className="max-w-3xl mx-auto px-6 py-12 space-y-12">
          {toc && toc.length > 0 && (
            <nav className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">
                Contenido
              </p>
              <ul className="space-y-2">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-sm font-semibold text-slate-700 hover:text-[#ff0019] transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {children}

          <footer className="pt-8 border-t border-slate-200 text-sm text-slate-500">
            <p>
              ¿Dudas sobre este documento? Escribinos a{" "}
              <a className="font-semibold text-[#ff0019] hover:underline" href="mailto:soporte@infocasa.com.ar">
                soporte@infocasa.com.ar
              </a>
              .
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold">
              <Link to="/terminos-y-condiciones" className="text-slate-600 hover:text-[#ff0019]">
                Términos y condiciones
              </Link>
              <Link to="/politica-de-privacidad" className="text-slate-600 hover:text-[#ff0019]">
                Política de privacidad
              </Link>
              <Link to="/" className="text-slate-600 hover:text-[#ff0019]">
                Volver al inicio
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </Layout>
  );
}

export function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-lg font-black uppercase tracking-wide text-slate-900 border-l-4 border-[#ff0019] pl-4 mb-5">
        {title}
      </h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

export function Clause({ n, title, children }) {
  return (
    <div className="space-y-2">
      <h3 className="font-black text-slate-900 text-[15px]">
        {n != null && <span className="text-[#ff0019]">{n}. </span>}
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function P({ children, className = "" }) {
  return <p className={`text-slate-600 leading-relaxed text-[15px] ${className}`.trim()}>{children}</p>;
}

export function UL({ children }) {
  return (
    <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-relaxed text-[15px] marker:text-[#ff0019]">
      {children}
    </ul>
  );
}

export function OL({ children }) {
  return (
    <ol className="list-decimal pl-5 space-y-2 text-slate-600 leading-relaxed text-[15px] marker:text-[#ff0019] marker:font-bold">
      {children}
    </ol>
  );
}

export function Note({ children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-[15px] text-slate-600 leading-relaxed">
      {children}
    </div>
  );
}
