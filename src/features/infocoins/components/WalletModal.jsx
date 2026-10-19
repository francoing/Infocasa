import React, { useEffect } from "react";
import { X, Wallet, ShoppingCart, ArrowRight } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import Loader from "@/common/components/Loader";

/**
 * Modal de billetera: saldo + historial + botón de compra.
 * `open: true` dispara el fetch (vía useWallet con enabled: open).
 */
export default function WalletModal({ open, onClose, onBuyPackages }) {
  const { balance, transactions, loading, error, refetch } = useWallet({ enabled: open });

  // Refresca al abrir (por si compró/asignó monedas mientras estaba cerrado)
  useEffect(() => {
    if (open) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const reasonLabel = (reason) => {
    switch (reason) {
      case "plan_grant": return "Plan";
      case "package_purchase": return "Compra de paquete";
      case "property_assignment": return "Asignación a propiedad";
      default: return reason;
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900">Mi billetera</h2>
              <p className="text-xs text-slate-500">InfoMonedas disponibles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saldo */}
        <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-white border-b border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo actual</p>
          <p className="text-4xl font-black text-slate-900 mt-1">
            {loading ? "…" : balance}
            <span className="text-base font-bold text-slate-400 ml-2">infomonedas</span>
          </p>
          <button
            onClick={onBuyPackages}
            className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
          >
            <ShoppingCart className="w-4 h-4" /> Comprar más
          </button>
        </div>

        {/* Historial */}
        <div className="px-6 py-4 max-h-80 overflow-y-auto">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Movimientos recientes
          </p>

          {loading && (
            <div className="py-8 flex justify-center">
              <Loader inline />
            </div>
          )}

          {!loading && error && (
            <div className="py-4 text-sm text-red-600 bg-red-50 rounded-xl px-4">{error}</div>
          )}

          {!loading && !error && transactions.length === 0 && (
            <p className="py-6 text-sm text-slate-500 text-center">
              Todavía no tenés movimientos.
            </p>
          )}

          {!loading && !error && transactions.length > 0 && (
            <ul className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <li key={t.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {reasonLabel(t.reason)}
                      {t.property?.title && (
                        <span className="text-slate-500 font-normal"> · {t.property.title}</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(t.created_at).toLocaleDateString("es-AR", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-black shrink-0 ${
                      t.amount > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.amount > 0 ? "+" : ""}{t.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}