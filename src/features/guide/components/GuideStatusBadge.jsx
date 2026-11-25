import React from "react";
import { cn } from "@/lib/utils";
import { guideStatusMeta } from "@/hooks/guide.mappers";

const TONES = {
  slate: "bg-slate-100 text-slate-600 border-slate-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  red: "bg-red-50 text-red-700 border-red-200",
};

/** Etiqueta de estado de una publicación o anunciante de la Guía. */
export default function GuideStatusBadge({ status, className }) {
  const { label, tone } = guideStatusMeta(status);
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border",
        TONES[tone] ?? TONES.slate,
        className
      )}
    >
      {label}
    </span>
  );
}
