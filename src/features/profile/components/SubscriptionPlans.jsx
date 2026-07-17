import React from "react";
import { Crown, CheckCircle } from "lucide-react";

function PlanCard({ plan, isCurrentPlan, isPopular, onChoose }) {
  const cardClass = isCurrentPlan
    ? "border-blue-600 bg-blue-50/50 shadow-md"
    : isPopular
      ? "border-amber-400 shadow-lg scale-[1.02] bg-white"
      : "border-slate-100 bg-white hover:border-blue-200";

  const buttonClass = isCurrentPlan
    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
    : isPopular
      ? "bg-amber-400 text-amber-950 hover:bg-amber-500"
      : "bg-slate-900 text-white hover:bg-slate-800";

  return (
    <div className={`relative flex flex-col p-6 rounded-3xl border-2 transition-all ${cardClass}`}>
      {isPopular && !isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full shadow-sm">
          Más Elegido
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full shadow-sm">
          Tu Plan
        </div>
      )}

      <h3 className="text-xl font-black text-slate-900 mb-2">{plan.name}</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-3xl font-black text-slate-900">${plan.price}</span>
        <span className="text-slate-500 font-bold text-sm">/año</span>
      </div>

      <div className="flex-1 space-y-3 mb-8">
        {plan.features?.map((feature, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
            <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isCurrentPlan || isPopular ? "text-blue-600" : "text-slate-400"}`} />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <button
        disabled={isCurrentPlan}
        onClick={() => onChoose(plan)}
        className={`w-full py-3 rounded-xl font-bold transition-all shadow-sm ${buttonClass}`}
      >
        {isCurrentPlan ? "Plan Seleccionado" : "Elegir Plan"}
      </button>
    </div>
  );
}

/** Sección "Mi Suscripción y Planes": plan actual + grilla de planes disponibles. */
export default function SubscriptionPlans({ plans, user, onChoose }) {
  const currentPlanId = user?.subscription?.plan?.id;

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl">
            <Crown className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Mi Suscripción y Planes</h2>
        </div>
        {user?.subscription?.plan && (
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Plan Actual:</span>
            <span className="text-sm font-black text-blue-600 uppercase">{user.subscription.plan.name}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={currentPlanId === plan.id}
            isPopular={plan.name?.toLowerCase().includes("premium")}
            onChoose={onChoose}
          />
        ))}
      </div>
    </div>
  );
}
