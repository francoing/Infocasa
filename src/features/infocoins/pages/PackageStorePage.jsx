import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Loader2, Coins } from "lucide-react";
import { usePackages } from "@/hooks/usePackages";
import { infocoinsApi } from "@/api/infocoins";
import Loader from "@/common/components/Loader";

export default function PackageStorePage() {
  const navigate = useNavigate();
  const { packages, loading, error } = usePackages();
  const [buyingId, setBuyingId] = useState(null);
  const [buyError, setBuyError] = useState(null);

  const handleBuy = async (pkg) => {
    setBuyingId(pkg.id);
    setBuyError(null);
    try {
      const res = await infocoinsApi.createPurchasePreference(pkg.id);
      // Guardamos el purchase_id para que la página de retorno lo pueda usar
      // si MP no lo manda en la URL (por si el back_urls lo perdió).
      sessionStorage.setItem(
        "pending_infocoin_purchase",
        JSON.stringify({
          purchase_id: res.purchase_id,
          preference_id: res.preference_id,
          infocoins: pkg.infocoins,
        })
      );
      // Redirigimos al checkout de MP
      window.location.href = res.redirect_url;
    } catch (err) {
      setBuyError(err?.message || "No se pudo iniciar la compra.");
      setBuyingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al panel
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
          <Coins className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Comprar InfoMonedas</h1>
          <p className="text-slate-500">
            Mientras más monedas tenga una propiedad, más arriba aparece en el marketplace.
          </p>
        </div>
      </div>

      {error && (
        <div className="my-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {buyError && (
        <div className="my-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm">{buyError}</div>
      )}

      {loading ? (
        <Loader inline className="py-20" />
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => {
            const isBuying = buyingId === pkg.id;
            const unitPrice = (Number(pkg.price) / pkg.infocoins).toFixed(0);

            return (
              <div
                key={pkg.id}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                {pkg.infocoins >= 100 && (
                  <span className="absolute -top-3 right-4 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full">
                    MEJOR PRECIO
                  </span>
                )}

                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Paquete
                </p>
                <p className="mt-1 text-5xl font-black text-slate-900">
                  {pkg.infocoins}
                </p>
                <p className="text-sm font-bold text-slate-500">infomonedas</p>

                <div className="my-5 border-t border-dashed border-slate-200" />

                <p className="text-2xl font-black text-slate-900">
                  ${Number(pkg.price).toLocaleString("es-AR")}
                  <span className="text-sm font-bold text-slate-500 ml-1">ARS</span>
                </p>
                <p className="text-xs text-slate-500">${unitPrice} por moneda</p>

                <button
                  onClick={() => handleBuy(pkg)}
                  disabled={!!buyingId}
                  className="mt-6 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isBuying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Redirigiendo…
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" /> Comprar
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}