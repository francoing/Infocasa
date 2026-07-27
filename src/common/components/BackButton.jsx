import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Botón "Volver" global: vuelve a la página anterior del historial. Si no hay
 * historial previo (se entró directo por URL o es la primera vista), va al home.
 * Pensado sobre todo para mobile, donde no siempre hay una nav visible.
 */
export default function BackButton({ className = "" }) {
  const navigate = useNavigate();
  // react-router guarda un índice en el state del historial: 0 = primera entrada.
  const canGoBack = typeof window !== "undefined" && window.history.state?.idx > 0;

  return (
    <button
      type="button"
      onClick={() => navigate(canGoBack ? -1 : "/")}
      aria-label="Volver a la página anterior"
      className={cn(
        "inline-flex items-center gap-2 min-h-[44px] rounded-full border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur",
        "hover:border-slate-300 hover:bg-white hover:text-blue-600 active:scale-95 transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
        className
      )}
    >
      <ArrowLeft className="w-[18px] h-[18px]" />
      Volver
    </button>
  );
}
