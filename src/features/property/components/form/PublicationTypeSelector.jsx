import React from "react";
import { Zap, Star, Crown } from "lucide-react";

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const buildPlans = (canFeatured, canPremium) => [
  { type: "basic", label: "Básica", desc: "Listado estándar en los resultados de búsqueda.", icon: <Zap className="w-6 h-6" />, locked: false, requiredPlan: null, color: "border-slate-600 hover:border-slate-400", active: "border-blue-500 bg-blue-500/10", dotColor: "#3b82f6", iconColor: "text-slate-400" },
  { type: "featured", label: "Destacada", desc: "Aparece en la sección principal del Home.", icon: <Star className="w-6 h-6" />, locked: !canFeatured, requiredPlan: "Premium", color: "border-slate-600 hover:border-amber-400", active: "border-amber-400 bg-amber-400/10", dotColor: "#fbbf24", iconColor: "text-amber-400" },
  { type: "premium", label: "Premium", desc: "Máxima visibilidad: portada del home + badge especial.", icon: <Crown className="w-6 h-6" />, locked: !canPremium, requiredPlan: "Premium", color: "border-slate-600 hover:border-purple-400", active: "border-purple-400 bg-purple-400/10", dotColor: "#a855f7", iconColor: "text-purple-400" },
];

const cardClass = (plan, selected) =>
  plan.locked ? "border-slate-700 opacity-50 cursor-not-allowed" : selected ? plan.active : plan.color;

const iconClass = (plan, selected) =>
  plan.locked ? "text-slate-600" : selected ? plan.iconColor : "text-slate-500";

/** Selector de tipo de publicación (solo al crear). Bloquea destacada/premium según el plan. */
export default function PublicationTypeSelector({ userPlan, value, onChange }) {
  const canFeatured = (userPlan?.featured_limit ?? 0) > 0;
  const plans = buildPlans(canFeatured, canFeatured);

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
        {plans.map((plan) => {
          const selected = value === plan.type;
          return (
            <button
              key={plan.type}
              type="button"
              disabled={plan.locked}
              onClick={() => !plan.locked && onChange(plan.type)}
              className={`relative p-6 rounded-2xl border-2 transition-all text-left ${cardClass(plan, selected)}`}
            >
              <div className={`mb-3 ${iconClass(plan, selected)}`}>{plan.icon}</div>
              <p className="text-white font-black text-base">{plan.label}</p>
              <p className="text-slate-400 text-xs font-medium mt-1 leading-relaxed">{plan.desc}</p>
              {plan.locked && (
                <div className="mt-3 flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                  <LockIcon /> Requiere plan {plan.requiredPlan}
                </div>
              )}
              {!plan.locked && selected && (
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full" style={{ backgroundColor: plan.dotColor }} />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
