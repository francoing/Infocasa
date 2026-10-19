import React, { useEffect, useState } from "react";
import { X, Coins, AlertTriangle, Loader2 } from "lucide-react";
import { useAssignInfocoins } from "@/hooks/useAssignInfocoins";
import { useWallet } from "@/hooks/useWallet";

/**
 * Modal para asignar infomonedas a una propiedad.
 *
 * - `open: true` + `property` → muestra el formulario.
 * - Al confirmar, llama a `assign(property.id, amount)`.
 * - Al éxito, llama a `onSuccess(result)` para que el padre refresque la lista.
 */
export default function AssignInfocoinsModal({ open, property, onClose, onSuccess }) {
  const { assign, loading, error } = useAssignInfocoins();
  const { balance, refetch: refetchWallet } = useWallet({ enabled: open });

  const [amount, setAmount] = useState("");
  const [localError, setLocalError] = useState(null);

  // Resetea el form al abrir una nueva propiedad
  useEffect(() => {
    if (open) {
      setAmount("");
      setLocalError(null);
    }
  }, [open, property?.id]);

  if (!open || !property) return null;

  const parsedAmount = Number.parseInt(amount, 10);
  const isValidAmount =
    Number.isFinite(parsedAmount) && parsedAmount > 0 && parsedAmount <= balance;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setLocalError("Ingresá una cantidad mayor a 0.");
      return;
    }
    if (parsedAmount > balance) {
      setLocalError("No tenés suficientes infomonedas.");
      return;
    }

    try {
      const res = await assign(property.id, parsedAmount);
      await refetchWallet(); // actualiza el saldo global
      onSuccess?.(res);
    } catch {
      // el hook ya setea `error`; lo mostramos abajo
    }
  };

  const maxHint =
    property?.infocoins_count > 0
      ? `Ya tenés ${property.infocoins_count} asignada${property.infocoins_count === 1 ? "" : "s"}.`
      : "Todavía no tiene infomonedas asignadas.";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900">Asignar InfoMonedas</h2>
              <p className="text-xs text-slate-500 truncate max-w-[220px]">
                {property.title}
              </p>
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

        <form onSubmit={handleSubmit} className="p-6">
          {/* Saldo y actual */}
          <div className="flex items-center justify-between text-sm mb-5">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tu saldo
              </p>
              <p className="text-xl font-black text-slate-900">{balance}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                En esta propiedad
              </p>
              <p className="text-xl font-black text-slate-900">
                {property.infocoins_count ?? 0}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-4">{maxHint}</p>

          {/* Input */}
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Cantidad a asignar</span>
            <input
              type="number"
              min="1"
              max={balance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-lg font-bold"
              placeholder="Ej: 5"
              autoFocus
            />
          </label>

          {/* Atajos */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[1, 5, 10, 20].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setAmount(String(n))}
                disabled={n > balance}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                +{n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAmount(String(balance))}
              disabled={balance <= 0}
              className="px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-sm font-bold text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Todo ({balance})
            </button>
          </div>

          {/* Aviso irreversibilidad */}
          <div className="mt-5 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800">
              <strong>Esta acción es irreversible.</strong> Las infomonedas asignadas a una
              propiedad no se pueden recuperar.
            </p>
          </div>

          {/* Errores */}
          {(localError || error) && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
              {localError || error}
            </div>
          )}

          {/* Botones */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isValidAmount || loading}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Asignando…
                </>
              ) : (
                <>Asignar</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}