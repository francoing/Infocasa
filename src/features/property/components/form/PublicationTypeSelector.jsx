import React, { useEffect } from "react";
import { Zap, Star, Crown, Loader2, Coins } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const PLAN_DEFS = [
  { 
    type: "basic", 
    label: "Básica", 
    desc: "Listado estándar en los resultados de búsqueda.", 
    icon: <Zap className="w-6 h-6" />, 
    color: "border-slate-600 hover:border-slate-400", 
    active: "border-blue-500 bg-blue-500/10", 
    dotColor: "#3b82f6", 
    iconColor: "text-slate-400" 
  },
  { 
    type: "featured", 
    label: "Destacada", 
    desc: "Aparece en la sección principal del Home.", 
    icon: <Star className="w-6 h-6" />, 
    color: "border-slate-600 hover:border-amber-400", 
    active: "border-amber-400 bg-amber-400/10", 
    dotColor: "#fbbf24", 
    iconColor: "text-amber-400" 
  },
  { 
    type: "premium", 
    label: "Súper Destacado", 
    desc: "Máxima visibilidad. Se activa usando InfoMonedas.", 
    icon: <Crown className="w-6 h-6" />, 
    color: "border-slate-600 hover:border-purple-400", 
    active: "border-purple-400 bg-purple-400/10", 
    dotColor: "#a855f7", 
    iconColor: "text-purple-400" 
  },
];

export default function PublicationTypeSelector({ 
  value, 
  onChange,
  infocoins,           
  setInfocoins        
}) {
  const { user } = useAuth();

  const userBalance = user?.infocoins_balance ?? 0; 
  const userFeatured = user?.featured_balance ?? 0; 

  const getCardState = (def) => {
    if (def.type === "premium") {
      return { 
        disabled: userBalance <= 0, 
        loading: false, 
        text: userBalance > 0 ? `Saldo: ${userBalance}` : "Sin InfoMonedas" 
      };
    }

    if (def.type === "featured") {
      return {
        disabled: userFeatured <= 0,
        loading: false,
        text: userFeatured > 0 ? `Te quedan ${userFeatured}` : "Sin destacados"
      };
    }

    return { disabled: false, loading: false, text: "Siempre disponible" };
  };

  useEffect(() => {
    if (value === "premium") {
      if (infocoins === 0 && userBalance > 0) {
        setInfocoins(1);
      }
    } else {
      if (infocoins !== 0) {
        setInfocoins(0);
      }
    }
  }, [value, infocoins, setInfocoins, userBalance]);

  return (
    <section className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] border border-slate-700 shadow-xl space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Crown className="w-5 h-5 text-amber-400" />
        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Tipo de Publicación</h3>
      </div>
      <p className="text-slate-400 text-sm font-medium -mt-4">
        Elige cómo quieres que aparezca tu propiedad.
      </p>
      
      {/* 👇 Agregamos items-start para que las tarjetas no se estiren entre sí */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {PLAN_DEFS.map((def) => {
          const state = getCardState(def);
          const selected = value === def.type && !state.disabled;
          const isPremium = def.type === "premium";

          return (
            <div
              key={def.type}
              onClick={() => !state.disabled && onChange(def.type)}
              className={`relative p-6 rounded-2xl border-2 transition-all text-left flex flex-col ${
                state.disabled ? "border-slate-700 opacity-50 cursor-not-allowed" : 
                selected ? def.active : `${def.color} cursor-pointer`
              }`}
            >
              <div className={`mb-3 ${state.disabled ? "text-slate-600" : selected ? def.iconColor : "text-slate-500"}`}>{def.icon}</div>
              <p className="text-white font-black text-base">{def.label}</p>
              <p className="text-slate-400 text-xs font-medium mt-1 leading-relaxed">{def.desc}</p>

              {state.loading && (
                <div className="mt-3 flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando...
                </div>
              )}
              {!state.loading && state.disabled && (
                <div className="mt-3 flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                  <LockIcon /> {state.text}
                </div>
              )}
              {!state.loading && !state.disabled && !isPremium && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-black" style={{ color: def.dotColor }}>
                  {state.text}
                </div>
              )}

              {isPremium && (
                <div className={`mt-3 inline-flex items-center gap-1.5 text-xs font-black ${state.disabled ? 'text-slate-500' : 'text-purple-400'}`}>
                  Saldo: {userBalance}
                </div>
              )}

              {/* 👇 Ajustamos el contenedor del input para que no deforme la tarjeta */}
              {isPremium && selected && (
                <div className="mt-4 pt-4 border-t border-purple-500/30 w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" /> Asignar
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={userBalance}
                    value={infocoins || ""}
                    onChange={(e) => setInfocoins(Math.min(Number(e.target.value), userBalance))}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-3 py-2 rounded-lg border border-purple-500/50 focus:border-purple-400 outline-none text-sm font-bold text-white bg-slate-900/50"
                  />
                </div>
              )}

              {!state.disabled && selected && (
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full" style={{ backgroundColor: def.dotColor }} />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
