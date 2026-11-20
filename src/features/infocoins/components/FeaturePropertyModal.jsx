import React from "react";
import { X, Star, AlertTriangle, Loader2 } from "lucide-react";
import { useFeatureProperty } from "@/hooks/useFeatureProperty";
import { useWallet } from "@/hooks/useWallet";

/**
 * Confirmación para destacar una propiedad: usa 1 destacado, es permanente y no se
 * puede repetir (spec backend monetization/featured_and_archive).
 */
export default function FeaturePropertyModal({ open, property, onClose, onSuccess }) {
  const { feature, loading, error } = useFeatureProperty();
  const { featuredBalance, loading: walletLoading } = useWallet({ enabled: open });

  if (!open || !property) return null;

  const noBalance = !walletLoading && featuredBalance < 1;

  const handleConfirm = async () => {
    try {
      const res = await feature(property.id);
      onSuccess?.(res);
    } catch {
      // el hook ya expone `error`
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div role="dialog" aria-modal="true" aria-labelledby="feature-modal-title" className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-white flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h2 id="feature-modal-title" className="font-bold text-lg text-slate-900">Destacar propiedad</h2>
              <p className="text-xs text-slate-500 truncate max-w-[220px]">{property.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between text-sm mb-5">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Destacados disponibles</p>
              <p className="text-xl font-black text-slate-900">{walletLoading ? "…" : featuredBalance}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Costo</p>
              <p className="text-xl font-black text-slate-900">1</p>
            </div>
          </div>

          <p className="text-sm text-slate-600">
            La propiedad va a aparecer antes que las comunes en el marketplace. Si además le asignás InfoMonedas, pasa a
            Súper Destacada.
          </p>

          <div className="mt-5 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800">
              <strong>Esta acción es permanente.</strong> El destacado no se puede quitar ni recuperar.
            </p>
          </div>

          {(noBalance || error) && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
              {error || "No tenés destacados disponibles. Se suman al contratar un plan pago."}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors">
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading || walletLoading || noBalance}
              className="inline-flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-amber-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Destacando…</>) : <>Destacar (usa 1)</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
