import React from "react";
import { Check, Crown, Gift, Clock } from "lucide-react";

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
      `Hasta ${plan.featured_limit} ${
        plan.featured_limit === 1 ? "destacada" : "destacadas"
      }`
    );
  } else {
    features.push("Sin destacadas");
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
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#4a4a49]">
          Planes y suscripción
        </h2>
        <p className="text-[#4a4a49]/70 mt-1 text-sm">
          Elegí el plan que mejor se adapte a tu actividad inmobiliaria.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {visiblePlans.map((plan) => {
          const config = getPlanConfig(plan.name);
          const features = buildFeatures(plan, config);
          const isCurrent = userPlanId && plan.id === userPlanId;
          const isFree = Number(plan.price) === 0;
          const isPromo = !!config.promoNote && promoActive;

          const hasBadgeRow = !!config.badge || isCurrent;

          return (
            <article
              key={plan.id}
              className="relative bg-white rounded-3xl border-2 p-6 flex flex-col transition-all hover:shadow-xl"
              style={{
                borderColor: isCurrent
                  ? BRAND.red
                  : isPromo
                  ? BRAND.gold
                  : "#e2e8f0",
              }}
            >
              {/* FILA DE BADGES — reservamos altura SIEMPRE para alinear títulos */}
              <div className="flex items-center justify-between gap-2 mb-4 min-h-[24px]">
                {config.badge && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                    style={config.badgeStyle}
                  >
                    {config.icon === "crown" ? (
                      <Crown className="w-3 h-3" />
                    ) : (
                      <Gift className="w-3 h-3" />
                    )}
                    {config.badge}
                  </span>
                )}

                {isCurrent && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ml-auto"
                    style={{ background: BRAND.red, color: "#fff" }}
                  >
                    Tu Plan
                  </span>
                )}
              </div>

              {/* TÍTULO Y PRECIO */}
              <h3 className="text-lg font-black text-[#4a4a49]">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mt-2 mb-5">
                <span
                  className="text-3xl font-black"
                  style={{ color: isFree ? BRAND.red : BRAND.gray }}
                >
                  {formatPrice(plan.price)}
                </span>
                <span className="text-sm font-bold text-[#4a4a49]/60">/mes</span>
              </div>

              {/* FEATURES */}
              <ul className="space-y-2.5 mb-6 flex-1">
                {features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-[#4a4a49]/85"
                  >
                    <span
                      className="w-4 h-4 mt-0.5 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: `${BRAND.gold}80`,
                        color: BRAND.red,
                      }}
                    >
                      <Check className="w-2.5 h-2.5" strokeWidth={4} />
                    </span>
                    <span className="font-medium">{f}</span>
                  </li>
                ))}
              </ul>

              {/* NOTA DE PROMO */}
              {isPromo && (
                <div
                  className="flex items-center gap-2 text-xs font-bold rounded-xl px-3 py-2 mb-4"
                  style={{ background: `${BRAND.gold}40`, color: BRAND.gray }}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {config.promoNote}
                </div>
              )}

              {/* BOTÓN */}
              {isCurrent ? (
                <button
                  disabled
                  className="w-full py-3 rounded-xl text-sm font-black bg-slate-100 text-slate-400 cursor-default select-none"
                >
                  Plan Seleccionado
                </button>
              ) : (
                <button
                  onClick={() => onChoose(plan)}
                  className="w-full py-3 rounded-xl text-sm font-black text-white transition-all active:scale-[0.98]"
                  style={{
                    background: BRAND.red,
                    boxShadow: `0 8px 20px -8px ${BRAND.red}80`,
                  }}
                >
                  Elegir Plan
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}