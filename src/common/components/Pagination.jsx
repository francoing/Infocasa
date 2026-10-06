import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { buildPageRange, PAGE_GAP } from "../../lib/pagination";

const btnBase =
  "min-w-[38px] h-[38px] px-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1";

/**
 * Paginador compartido de los listados (dashboard). Server-side: recibe la `meta`
 * normalizada del backend (ver `readPaginated`) y avisa la página elegida.
 *
 * No se renderiza si hay una sola página — los listados chicos quedan limpios.
 */
export default function Pagination({ meta, onPageChange, className, itemLabel = "resultados" }) {
  if (!meta || meta.lastPage <= 1) return null;

  const { currentPage, lastPage, total, from, to } = meta;
  const pages = buildPageRange(currentPage, lastPage);
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= lastPage;

  const go = (page) => {
    if (page < 1 || page > lastPage || page === currentPage) return;
    onPageChange(page);
  };

  return (
    <nav
      aria-label="Paginación"
      className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 pt-2", className)}
    >
      <p className="text-xs font-medium text-slate-500 order-2 sm:order-1">
        Mostrando <span className="font-bold text-slate-700">{from}–{to}</span> de{" "}
        <span className="font-bold text-slate-700">{total}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <button
          type="button"
          onClick={() => go(currentPage - 1)}
          disabled={isFirst}
          aria-label="Página anterior"
          className={cn(
            btnBase,
            isFirst
              ? "bg-slate-50 text-slate-300 cursor-not-allowed"
              : "bg-white border border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Números: solo desde sm. En mobile queda "Página X de Y". */}
        <div className="hidden sm:flex items-center gap-1.5">
          {pages.map((page, i) =>
            page === PAGE_GAP ? (
              <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-slate-400 font-bold select-none">
                …
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => go(page)}
                aria-label={`Ir a la página ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
                className={cn(
                  btnBase,
                  page === currentPage
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600"
                )}
              >
                {page}
              </button>
            )
          )}
        </div>

        <span className="sm:hidden text-xs font-bold text-slate-600 px-2">
          Página {currentPage} de {lastPage}
        </span>

        <button
          type="button"
          onClick={() => go(currentPage + 1)}
          disabled={isLast}
          aria-label="Página siguiente"
          className={cn(
            btnBase,
            isLast
              ? "bg-slate-50 text-slate-300 cursor-not-allowed"
              : "bg-white border border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600"
          )}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
