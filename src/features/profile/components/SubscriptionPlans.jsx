import React from "react";
import { Check, Crown, Gift, Clock, Sparkles, Star, Zap } from "lucide-react";

const BRAND = {
  red: "#ff0019",
  gold: "#ffda31",
  gray: "#4a4a49",
};

const PROMO_END_DATE = new Date("2026-11-10T23:59:59");
const PROMO_END_LABEL = "10/11/2026";

const PLAN_CONFIG = [
  {
    match: ["fundador", "lanzamiento"],
    badge: "Plan Fundador",
    badgeStyle: { bg: BRAND.gold, color: BRAND.gray },
    icon: "gift",
    promoNote: `Promoción válida hasta el ${PROMO_END_LABEL}`,
    extraFeatures: ["Soporte 24/7", "Asignación directa de leads"],
  },
  {
    match: ["inmobiliaria plus premium"],
    extraFeatures: ["Soporte prioritario", "Máxima visibilidad en búsquedas"],
  },
  {
    match: ["inmobiliaria premium"],
    extraFeatures: ["Soporte prioritario", "Mayor visibilidad en búsquedas"],
  },
  {
    match: ["inmobiliaria plus"],
    extraFeatures: ["Soporte 24/7"],
  },
  {
    match: ["profesional premium"],
    badge: "Más Elegido",
    badgeStyle: { bg: BRAND.red, color: "#fff" },
    icon: "crown",
    extraFeatures: ["Soporte prioritario"],
  },
  {
    match: ["profesional plus"],
    extraFeatures: ["Soporte 24/7"],
  },
  {
    match: ["profesional"],
    extraFeatures: ["Soporte 24/7"],
  },
];

const getPlanConfig = (planName = "") => {
  const name = planName.toLowerCase();
  return (
    PLAN_CONFIG.find((c) => c.match.some((m) => name.includes(m))) || {
      extraFeatures: [],
    }
  );
};

const buildFeatures = (plan, config) => {
  const features = [];

  const limit = plan.property_limit ?? plan.limit;
  features.push(
    limit
      ? `Hasta ${limit} ${limit === 1 ? "propiedad" : "propiedades"}`
      : "Propiedades ilimitadas"
  );

  if (plan.featured_limit && plan.featured_limit > 0) {
    features.push(
      `Incluye ${plan.featured_limit} ${
        plan.featured_limit === 1 ? "destacada" : "destacadas"
      }`
    );
  } else {
    features.push("Sin destacadas incluidas");
  }

  if (plan.infocoins_grant && plan.infocoins_grant > 0) {
    features.push(`Incluye ${plan.infocoins_grant} InfoMonedas`);
  }

  if (config.extraFeatures) {
    features.push(...config.extraFeatures);
  }

  return features;
};

const formatPrice = (price) => {
  const num = Number(price);
  if (isNaN(num)) return price;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export default function SubscriptionPlans({ plans = [], user, onChoose }) {
  if (!plans.length) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500">
        Cargando planes...
      </div>
    );
  }

  const userPlanId =
    user?.subscription?.plan_id ||
    user?.subscription?.plan?.id ||
    user?.plan_id;

  const promoActive = new Date() < PROMO_END_DATE;

  const visiblePlans = plans.filter((plan) => {
    if (user?.role === "admin") return true;
    if (!plan.target_role) return true;
    if (user?.role === "agent") return plan.target_role === "agent";
    return plan.target_role === "owner";
  });

  return (
    <section className="w-full">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-black text-[#4a4a49] flex items-center justify-center gap-2">
          <Sparkles className="w-7 h-7 text-[#ff0019]" /> Potenciá tu cuenta
        </h2>
        <p className="text-[#4a4a49]/70 mt-2 text-base max-w-lg mx-auto">
          Elegí el plan que mejor se adapte a tu actividad inmobiliaria y empezá a vender más rápido.
        </p>
      </div>

      {/* 👇 Grilla: máximo 2 columnas, centrada, y con un ancho máximo para que no se estiren */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
        {visiblePlans.map((plan) => {
          const config = getPlanConfig(plan.name);
          const features = buildFeatures(plan, config);
          const isCurrent = userPlanId && plan.id === userPlanId;
          const isFree = Number(plan.price) === 0;
          const isPromo = !!config.promoNote && promoActive;
          
          const cardStyle = isCurrent
            ? "bg-gradient-to-b from-white to-red-50/30 border-red-500 shadow-xl shadow-red-500/10 z-10"
            : "bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-lg";

          return (
            <article
              key={plan.id}
              className={`relative rounded-3xl border-2 p-6 flex flex-col transition-all duration-300 ${cardStyle}`}
            >
              {config.badge && (
                <span
                  className="absolute -top-3 left-6 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm whitespace-nowrap"
                  style={config.badgeStyle}
                >
                  {config.icon === "crown" ? (
                    <Crown className="w-3 h-3 inline mr-1" />
                  ) : (
                    <Gift className="w-3 h-3 inline mr-1" />
                  )}
                  {config.badge}
                </span>
              )}

              {isCurrent && (
                <span
                  className="absolute -top-3 right-6 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm whitespace-nowrap flex items-center gap-1"
                  style={{ background: BRAND.red, color: "#fff" }}
                >
                  <Star className="w-3 h-3 fill-white" /> Tu Plan
                </span>
              )}

              <div className="flex justify-between items-start mt-2">
                <div>
                  <h3 className="text-xl font-black text-[#4a4a49] uppercase tracking-wide">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-4xl font-black ${isFree ? 'text-green-600' : 'text-[#1a1a1a]'}`}>
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-sm font-bold text-slate-400">/mes</span>
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-slate-100 my-5" />

              <ul className="space-y-2.5 mb-6 flex-1">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#4a4a49]/90">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[#4a4a49]" strokeWidth={3} />
                    </span>
                    <span className="font-semibold leading-tight">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {isPromo && (
                  <div
                    className="flex items-center justify-center gap-2 text-[11px] font-bold rounded-xl px-3 py-2 mb-4"
                    style={{ background: `${BRAND.gold}40`, color: BRAND.gray }}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {config.promoNote}
                  </div>
                )}

                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl text-sm font-black bg-slate-100 text-slate-400 cursor-default select-none border border-slate-200"
                  >
                    Plan Activo
                  </button>
                ) : (
                  <button
                    onClick={() => onChoose(plan)}
                    className="w-full py-3 rounded-xl text-sm font-black text-white transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 hover:shadow-xl"
                    style={{
                      background: `linear-gradient(to right, ${BRAND.red}, #cc0014)`,
                      boxShadow: `0 8px 20px -8px ${BRAND.red}80`,
                    }}
                  >
                    <Zap className="w-4 h-4 fill-white" /> Elegir Plan
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
