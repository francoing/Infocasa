import React from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, Loader2, Coins } from "lucide-react";
import { useInfocoinPaymentResult } from "@/hooks/useInfocoinPurchase";

/**
 * Página de retorno del checkout de MP.
 *
 * Rutas: /payment/success, /payment/failure, /payment/pending
 *
 * MP agrega a la URL: payment_id, status, external_reference, preference_id, ...
 * La verificación (idempotente, acredita las monedas aunque el webhook no haya llegado)
 * vive en el hook `useInfocoinPaymentResult` (capa de datos).
 */
export default function PaymentResultPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const variant = location.pathname.split("/").pop(); // success | failure | pending
  const state = useInfocoinPaymentResult({ variant, query: searchParams });

  const icon = (() => {
    if (state.loading) return <Loader2 className="w-14 h-14 text-blue-600 animate-spin" />;
    if (state.status === "approved") return <CheckCircle2 className="w-14 h-14 text-green-600" />;
    if (state.status === "rejected") return <XCircle className="w-14 h-14 text-red-600" />;
    return <Clock className="w-14 h-14 text-yellow-500" />;
  })();

  const title = (() => {
    if (state.loading) return "Verificando tu pago…";
    if (state.status === "approved") return "¡Compra aprobada!";
    if (state.status === "rejected") return "Pago rechazado";
    if (state.status === "error") return "No pudimos verificar el pago";
    return "Pago pendiente";
  })();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-4">{icon}</div>

        <h1 className="text-2xl font-black text-slate-900">{title}</h1>
        <p className="mt-2 text-slate-600">{state.message}</p>

        {state.balance !== null && (
          <div className="mt-6 inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-5 py-3 rounded-2xl font-bold">
            <Coins className="w-5 h-5" /> Saldo actual: {state.balance} infomonedas
          </div>
        )}

        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
          >
            Ir al panel
          </Link>
          <Link
            to="/infocoins/comprar"
            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-900 px-5 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all"
          >
            Comprar más
          </Link>
        </div>
      </div>
    </div>
  );
}