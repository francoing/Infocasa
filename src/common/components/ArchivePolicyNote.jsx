import React from "react";
import { Archive } from "lucide-react";

/**
 * Política de archivo por suscripción vencida (spec backend monetization/featured_and_archive).
 * `variant="plan"` agrega qué pasa al cambiar a un plan con menos propiedades.
 */
const ARCHIVE_POLICY_TEXT =
  "Si tu suscripción vence, tus propiedades se desactivan y quedan archivadas 30 días. Si volvés a suscribirte en ese plazo, vuelven como estaban (con sus destacados e InfoMonedas); si no, se eliminan definitivamente.";

const ARCHIVE_PLAN_LIMIT_TEXT =
  "Si al volver elegís un plan con menos propiedades, recuperás hasta el límite del plan (primero las súper destacadas y las destacadas); el resto se elimina al cumplirse los 30 días.";

export default function ArchivePolicyNote({ variant = "property", className = "" }) {
  return (
    <div
      role="note"
      className={`flex items-start gap-2 text-left text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 ${className}`}
    >
      <Archive className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
      <span>
        {ARCHIVE_POLICY_TEXT}
        {variant === "plan" && <span className="block font-medium mt-1">{ARCHIVE_PLAN_LIMIT_TEXT}</span>}
      </span>
    </div>
  );
}
