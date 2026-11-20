import React from "react";
import { Zap, Star, Crown, Coins } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/**
 * Visibilidad al crear (spec backend monetization/featured_and_archive):
 * - Común o Destacada (usa 1 destacado de la billetera, permanente).
 * - InfoMonedas opcionales: con 1 o más la propiedad pasa a Súper Destacada.
 * Ambas cosas son irreversibles.
 */
const PLAN_DEFS = [
  {
    type: "basic",
    label: "Común",
    desc: "Aparece en los resultados después de las destacadas.",
    icon: <Zap className="w-6 h-6" />,
    color: "border-slate-600 hover:border-slate-400",
    active: "border-blue-500 bg-blue-500/10",
    dotColor: "#3b82f6",
    iconColor: "text-slate-400",
  },
  {
    type: "featured",
    label: "Destacada",
    desc: "Aparece antes que las comunes. Usa 1 destacado y es permanente.",
    icon: <Star className="w-6 h-6" />,
    color: "border-slate-600 hover:border-amber-400",
    active: "border-amber-400 bg-amber-400/10",
    dotColor: "#fbbf24",
    iconColor: "text-amber-400",
  },
];

export default function PublicationTypeSelector({ value, onChange, infocoins, setInfocoins }) {
  const { user } = useAuth();

  const coinBalance = user?.infocoins_balance ?? 0;
  const featuredBalance = user?.featured_balance ?? 0;

  const getCardState = (def) => {
    if (def.type === "featured") {
      return {
        disabled: featuredBalance <= 0,
        text: featuredBalance > 0 ? `Te quedan ${featuredBalance}` : "Sin destacados",
      };
    }
    return { disabled: false, text: "Siempre disponible" };
  };

  const handleCoins = (e) => {
    const n = Number.parseInt(e.target.value, 10);
    setInfocoins(Number.isFinite(n) ? Math.max(0, Math.min(n, coinBalance)) : 0);
  };

  return (
    <section className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] border border-slate-700 shadow-xl space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Crown className="w-5 h-5 text-amber-400" />
        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Visibilidad</h3>
      </div>
      <p className="text-slate-400 text-sm font-medium -mt-4">
        Elegí cómo querés que aparezca tu propiedad en el marketplace.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {PLAN_DEFS.map((def) => {
          const state = getCardState(def);
          const selected = value === def.type && !state.disabled;

          return (
            <div
              key={def.type}
              role="radio"
              aria-checked={selected}
              aria-disabled={state.disabled}
              tabIndex={state.disabled ? -1 : 0}
              onClick={() => !state.disabled && onChange(def.type)}
              onKeyDown={(e) => {
                if (!state.disabled && (e.key === "Enter" || e.key === " ")) onChange(def.type);
              }}
              className={`relative p-6 rounded-2xl border-2 transition-all text-left flex flex-col ${
                state.disabled
                  ? "border-slate-700 opacity-50 cursor-not-allowed"
                  : selected
                    ? def.active
                    : `${def.color} cursor-pointer`
              }`}
            >
              <div className={`mb-3 ${state.disabled ? "text-slate-600" : selected ? def.iconColor : "text-slate-500"}`}>{def.icon}</div>
              <p className="text-white font-black text-base">{def.label}</p>
              <p className="text-slate-400 text-xs font-medium mt-1 leading-relaxed">{def.desc}</p>
              {state.disabled ? (
                <div className="mt-3 flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                  <LockIcon /> {state.text}
                </div>
              ) : (
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-black" style={{ color: def.dotColor }}>
                  {state.text}
                </div>
              )}
              {selected && <div className="absolute top-3 right-3 w-3 h-3 rounded-full" style={{ backgroundColor: def.dotColor }} />}
            </div>
          );
        })}
      </div>

      <div className="p-6 rounded-2xl border-2 border-red-500/40 bg-red-500/5">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-300" />
          <p className="text-white font-black text-base">Súper Destacada con InfoMonedas (opcional)</p>
        </div>
        <p className="text-slate-400 text-xs font-medium mt-1 leading-relaxed">
          Con 1 InfoMoneda o más aparece primero en el marketplace, aunque no esté destacada. Entre las súper destacadas,
          primero van las que tienen más InfoMonedas.
        </p>
        <label className="mt-4 flex items-center gap-3">
          <span className="text-xs font-bold text-red-200 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5" /> InfoMonedas a asignar
          </span>
          <input
            type="number"
            min="0"
            max={coinBalance}
            value={infocoins || ""}
            placeholder="0"
            disabled={coinBalance <= 0}
            onChange={handleCoins}
            aria-label="InfoMonedas a asignar"
            className="w-28 px-3 py-2 rounded-lg border border-red-500/50 focus:border-red-400 outline-none text-sm font-bold text-white bg-slate-900/50 disabled:opacity-50"
          />
          <span className="text-xs font-bold text-slate-400">Saldo: {coinBalance}</span>
        </label>
      </div>

      <p className="text-slate-500 text-[11px] font-semibold">
        Los destacados y las InfoMonedas que asignes no se pueden quitar ni recuperar.
      </p>
    </section>
  );
}
