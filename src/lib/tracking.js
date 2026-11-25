/**
 * Medición de conversiones (spec `specs/tracking/conversions/spec.md`).
 *
 * La app NUNCA habla con los píxeles (gtag, fbq, ttq): solo empuja eventos `ic_*` al
 * `dataLayer` y Google Tag Manager (GTM-5W5C5Z79) los reparte a Google Ads, GA4, Meta y
 * TikTok. Las vistas de página de la SPA las resuelve GTM (historial + medición mejorada).
 *
 * Reglas:
 * - El registro va SIN valor (solo `account_type`).
 * - Solo los pagos de Mercado Pago (infomonedas y planes) llevan monto real en ARS, el que
 *   devuelve el backend al verificar el pago (`transaction_amount` de MP).
 * - `event_id` de un pago = `mp_<payment_id>`: el backend manda el mismo a la Conversions
 *   API de Meta y Meta lo cuenta una sola vez.
 * - Medir nunca rompe la UI: todo va en try/catch.
 */

const TRACKED_PREFIX = "ic_tracked_";

function push(event, params = {}) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...params });
  } catch {
    /* nunca romper la UI por medición */
  }
}

function newEventId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** true la primera vez que se ve `key` en este navegador (evita contar dos veces un pago al recargar). */
function once(key) {
  try {
    const k = `${TRACKED_PREFIX}${key}`;
    if (window.localStorage.getItem(k)) return false;
    window.localStorage.setItem(k, "1");
  } catch {
    /* sin storage: se mide igual */
  }
  return true;
}

function readCookie(name) {
  try {
    const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Cookies del píxel de Meta (`_fbp`, `_fbc`) para mandarlas al crear la preferencia de pago:
 * el backend las reenvía a la Conversions API y mejora la coincidencia de usuarios.
 * Devuelve solo las que existen.
 */
export function getMetaCookies() {
  const out = {};
  const fbp = readCookie("_fbp");
  const fbc = readCookie("_fbc");
  if (fbp) out.fbp = fbp;
  if (fbc) out.fbc = fbc;
  return out;
}

/** Registro exitoso (POST /auth/register OK). Sin valor: solo el tipo de cuenta. */
export function trackSignUp(role) {
  push("ic_sign_up", {
    account_type: role || "buyer",
    method: "email",
    event_id: newEventId("signup"),
  });
}

/**
 * Pago de Mercado Pago verificado por el backend.
 * @param {{ id: string|number, amount: number, name?: string, kind: 'infomonedas'|'plan' }} payment
 *   `id` = payment_id de MP; `amount` = monto real cobrado (ARS).
 */
export function trackPayment({ id, amount, name, kind } = {}) {
  const value = Number(amount);
  if (!id || !(value > 0) || !once(`pay_${id}`)) return;
  push(kind === "plan" ? "ic_subscribe" : "ic_purchase", {
    transaction_id: String(id),
    event_id: `mp_${id}`,
    value,
    currency: "ARS",
    item_name: name,
    item_category: kind,
  });
}

/**
 * Datos de conversión de un pago aprobado, a partir de la respuesta de verify
 * (`payment: { id, amount, currency, name }`, ver api-contract). `null` si no está aprobado
 * o falta el pago: así nunca se mide un pago sin confirmar.
 * Sirve para infomonedas (`purchase_status`) y planes (`subscription.active`).
 *
 * @param {object|null|undefined} data respuesta del backend
 * @param {'infomonedas'|'plan'} kind
 */
export function approvedPaymentConversion(data, kind) {
  const approved = kind === "plan" ? data?.subscription?.active === true : data?.purchase_status === "approved";
  const payment = data?.payment;
  if (!approved || !payment?.id || !(Number(payment.amount) > 0)) return null;
  return { id: payment.id, amount: Number(payment.amount), name: payment.name, kind };
}

/** Consulta enviada desde la ficha (POST /leads OK). */
export function trackLead(propertyId) {
  push("ic_lead", {
    property_id: String(propertyId),
    method: "form",
    event_id: newEventId("lead"),
  });
}

/** ID de la propiedad si la URL actual es una ficha (`/property/:id`). */
export function propertyIdFromPath(pathname) {
  const match = /^\/property\/([^/?#]+)/.exec(pathname || "");
  return match ? match[1] : undefined;
}

/**
 * Clic en WhatsApp. Botón flotante (visible en todas las páginas): si se toca desde una
 * ficha, el evento lleva el `property_id`. La InfoCasa Guía reusa el mismo evento con
 * `extra = { section: "guia", guide_listing_id?, guide_advertiser_id? }` (spec `guide/directory`)
 * para separarlo en GTM sin crear un evento nuevo.
 */
export function trackWhatsApp(pathname, extra = {}) {
  const propertyId = extra.section ? undefined : propertyIdFromPath(pathname);
  const params = Object.fromEntries(
    Object.entries(extra).filter(([, v]) => v !== undefined && v !== null && v !== "").map(([k, v]) => [k, String(v)])
  );
  push("ic_whatsapp", {
    ...(propertyId ? { property_id: propertyId } : {}),
    ...params,
    method: "whatsapp",
    page_path: pathname,
    event_id: newEventId("wa"),
  });
}
