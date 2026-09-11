import React, { useEffect } from "react";
import { Zap, Star, Crown, Loader2 } from "lucide-react";
import { usePublicationQuota } from "@/hooks/usePublicationQuota";

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const PLAN_DEFS = [
  { type: "basic", label: "Básica", desc: "Listado estándar en los resultados de búsqueda.", icon: <Zap className="w-6 h-6" />, quotaKey: "properties", color: "border-slate-600 hover:border-slate-400", active: "border-blue-500 bg-blue-500/10", dotColor: "#3b82f6", iconColor: "text-slate-400" },
  { type: "featured", label: "Destacada", desc: "Aparece en la sección principal del Home.", icon: <Star className="w-6 h-6" />, quotaKey: "featured", color: "border-slate-600 hover:border-amber-400", active: "border-amber-400 bg-amber-400/10", dotColor: "#fbbf24", iconColor: "text-amber-400" },
  { type: "premium", label: "Premium", desc: "Máxima visibilidad: portada del home + badge especial.", icon: <Crown className="w-6 h-6" />, quotaKey: "premium", color: "border-slate-600 hover:border-purple-400", active: "border-purple-400 bg-purple-400/10", dotColor: "#a855f7", iconColor: "text-purple-400" },
];

/**
 * Estado del cupo para una tarjeta a partir del quota del backend.
 * Devuelve { disabled, loading, text }. `available === null` = ilimitado.
 */
const cardQuota = (def, quota, loading) => {
  if (!def.quotaKey) return { disabled: false, loading: false, text: null }; // básica: siempre
  if (loading) return { disabled: true, loading: true, text: null };
  const q = quota?.[def.quotaKey];
  if (!q) return { disabled: true, loading: false, text: "Sin cupo disponible" };
  if (q.available === null) return { disabled: false, loading: false, text: "Cupo ilimitado" };
  const available = q.available ?? 0;
  return {
    disabled: available <= 0,
    loading: false,
    text: available > 0 ? `Te quedan ${available}` : "Sin cupo disponible",
  };
};

const cardClass = (def, selected, disabled) =>
  disabled ? "border-slate-700 opacity-50 cursor-not-allowed" : selected ? def.active : def.color;

const iconClass = (def, selected, disabled) =>
  disabled ? "text-slate-600" : selected ? def.iconColor : "text-slate-500";

/** Selector de tipo de publicación (solo al crear). Muestra y respeta el cupo del plan. */
export default function PublicationTypeSelector({ userPlan, value, onChange }) {
  const { data: quota, isLoading, isError } = usePublicationQuota();

  // Si la opción elegida quedó sin cupo, volver a Básica. El backend valida igual con 403.
  useEffect(() => {
    if (isLoading) return;
    const def = PLAN_DEFS.find((p) => p.type === value);
    if (def && cardQuota(def, quota, false).disabled) onChange("basic");
  }, [quota, isLoading, value, onChange]);

  return (
    <section className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] border border-slate-700 shadow-xl space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Crown className="w-5 h-5 text-amber-400" />
        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Tipo de Publicación</h3>
      </div>
      <p className="text-slate-400 text-sm font-medium -mt-4">
        Elige cómo quieres que aparezca tu propiedad. Tu plan actual: <span className="text-white font-bold">{userPlan?.name || "Sin plan"}</span>
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLAN_DEFS.map((def) => {
          const state = cardQuota(def, quota, isLoading);
          const selected = value === def.type && !state.disabled;
          return (
            <button
              key={def.type}
              type="button"
              disabled={state.disabled}
              onClick={() => !state.disabled && onChange(def.type)}
              className={`relative p-6 rounded-2xl border-2 transition-all text-left ${cardClass(def, selected, state.disabled)}`}
            >
              <div className={`mb-3 ${iconClass(def, selected, state.disabled)}`}>{def.icon}</div>
              <p className="text-white font-black text-base">{def.label}</p>
              <p className="text-slate-400 text-xs font-medium mt-1 leading-relaxed">{def.desc}</p>

              {def.quotaKey && state.loading && (
                <div className="mt-3 flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando cupo…
                </div>
              )}
              {def.quotaKey && !state.loading && state.disabled && (
                <div className="mt-3 flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                  <LockIcon /> {state.text}
                </div>
              )}
              {def.quotaKey && !state.loading && !state.disabled && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-black" style={{ color: def.dotColor }}>
                  {state.text}
                </div>
              )}

              {!state.disabled && selected && (
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full" style={{ backgroundColor: def.dotColor }} />
              )}
            </button>
          );
        })}
      </div>

      {isError && (
        <p className="text-xs text-slate-400 font-medium">
          No se pudo cargar el cupo. Podés publicar como Básica; las opciones destacadas se validan al publicar.
        </p>
      )}
    </section>
  );
}
