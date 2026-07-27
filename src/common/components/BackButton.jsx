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
        "inline-flex items-center gap-1.5 px-3 py-2 -ml-1 rounded-lg text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100 active:scale-95 transition-all",
        className
      )}
    >
      <ArrowLeft className="w-4 h-4" />
      Volver
    </button>
  );
}
