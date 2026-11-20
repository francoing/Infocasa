import React from "react";
import { Info } from "lucide-react";

/** Texto único del aviso: los planes pagos son un pago único (spec backend monetization/mercadopago_hardening). */
export const ONE_TIME_PAYMENT_TEXT = "Pago único: el plan no se renueva automáticamente.";

/**
 * Aviso de que el pago del plan no se renueva solo.
 * `detail` agrega una segunda línea (p. ej. qué pasa al vencer).
 */
export default function OneTimePaymentNote({ detail, className = "" }) {
  return (
    <div
      role="note"
      className={`flex items-start gap-2 text-left text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 ${className}`}
    >
      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-500" aria-hidden="true" />
      <span>
        {ONE_TIME_PAYMENT_TEXT}
        {detail && <span className="block font-medium text-slate-500">{detail}</span>}
      </span>
    </div>
  );
}
