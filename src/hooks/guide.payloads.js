/**
 * Formularios de la InfoCasa Guía ↔ payloads del backend, vista previa y errores 422.
 * Helpers puros (sin estado ni HTTP). Lectura del contrato en `guide.mappers.js`.
 */
import { SCHEDULE_DAYS, cleanSocial } from "./guide.mappers";

/** Coordenada numérica o null (el mapa es opcional). */
const toCoord = (v) => (v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? null : Number(v));

const nullIfEmpty = (v) => (v === "" || v === undefined ? null : v);

/** Formulario de perfil → body de POST/PUT `guide/me/advertiser`. */
export function toAdvertiserPayload(form, { creating = false } = {}) {
  const payload = {
    type: form.type,
    name: form.name?.trim(),
    cuit: nullIfEmpty(form.cuit?.trim()),
    description: nullIfEmpty(form.description?.trim()),
    phone: nullIfEmpty(form.phone?.trim()),
    whatsapp: nullIfEmpty(form.whatsapp?.trim()),
    contact_email: nullIfEmpty(form.contactEmail?.trim()),
    website: nullIfEmpty(form.website?.trim()),
    social: cleanSocial(form.social),
    address: nullIfEmpty(form.address?.trim()),
    province: nullIfEmpty(form.province),
    city: nullIfEmpty(form.city?.trim()),
    neighborhood: nullIfEmpty(form.neighborhood?.trim()),
    trade_ids: (form.tradeIds ?? []).map(Number),
  };
  if (creating) payload.accept_terms = !!form.acceptTerms;
  return payload;
}

/** Formulario de publicación → body de POST/PUT `guide/me/listings`. */
export function toListingPayload(form, { asDraft = false } = {}) {
  const coverageCities = String(form.coverageCities ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const schedule = Object.fromEntries(
    SCHEDULE_DAYS.map(({ key }) => [key, nullIfEmpty(form.schedule?.[key]?.trim?.() ?? "")])
  );
  return {
    trade_id: Number(form.tradeId) || null,
    title: form.title?.trim(),
    description: form.description?.trim(),
    video_url: nullIfEmpty(form.videoUrl?.trim()),
    phone: nullIfEmpty(form.phone?.trim()),
    whatsapp: nullIfEmpty(form.whatsapp?.trim()),
    contact_email: nullIfEmpty(form.contactEmail?.trim()),
    website: nullIfEmpty(form.website?.trim()),
    social: cleanSocial(form.social),
    address: nullIfEmpty(form.address?.trim()),
    province: nullIfEmpty(form.province),
    city: nullIfEmpty(form.city?.trim()),
    neighborhood: nullIfEmpty(form.neighborhood?.trim()),
    latitude: toCoord(form.latitude),
    longitude: toCoord(form.longitude),
    coverage_type: form.coverageType === "province" ? "province" : "cities",
    coverage_cities: form.coverageType === "province" ? [] : coverageCities,
    home_service: !!form.homeService,
    has_store: !!form.hasStore,
    store_only: !!form.storeOnly,
    schedule,
    as_draft: asDraft,
  };
}

/** Copia campos con un valor por defecto (`obj` puede ser null). */
const withDefaults = (obj, defaults) =>
  Object.fromEntries(Object.entries(defaults).map(([k, fallback]) => [k, obj?.[k] ?? fallback]));

const LISTING_FORM_DEFAULTS = {
  title: "", description: "", videoUrl: "", address: "", province: "", city: "", neighborhood: "",
  latitude: null, longitude: null, coverageType: "cities", homeService: false, hasStore: false, storeOnly: false,
};

/** Publicación mapeada (o null) → estado inicial del formulario de edición. */
export function listingToForm(listing) {
  const own = listing?.ownContact ?? {};
  return {
    ...withDefaults(listing, LISTING_FORM_DEFAULTS),
    tradeId: listing?.trade?.id ? String(listing.trade.id) : "",
    ...withDefaults(own, { phone: "", whatsapp: "", website: "" }),
    contactEmail: own.email ?? "",
    social: cleanSocial(own.social),
    coverageCities: (listing?.coverageCities ?? []).join(", "),
    schedule: { ...(listing?.schedule ?? {}) },
  };
}

/** Perfil mapeado (o null) → estado inicial del formulario de perfil. */
export function advertiserToForm(advertiser) {
  return {
    type: advertiser?.type ?? "trade_provider",
    name: advertiser?.name ?? "",
    cuit: advertiser?.cuit ?? "",
    description: advertiser?.description ?? "",
    phone: advertiser?.phone ?? "",
    whatsapp: advertiser?.whatsapp ?? "",
    contactEmail: advertiser?.contactEmail ?? "",
    website: advertiser?.website ?? "",
    social: { ...(advertiser?.social ?? {}) },
    address: advertiser?.address ?? "",
    province: advertiser?.province ?? "",
    city: advertiser?.city ?? "",
    neighborhood: advertiser?.neighborhood ?? "",
    tradeIds: (advertiser?.trades ?? []).map((t) => t.id),
    acceptTerms: false,
  };
}

/**
 * Vista previa: arma una publicación "como la verá el público" desde el formulario, con el
 * contacto heredado del perfil cuando el campo está vacío. `photos` = [{ id?, url }].
 */
export function buildListingPreview(form, { advertiser = null, categories = [], photos = [] } = {}) {
  const category = categories.find((c) => c.trades.some((t) => String(t.id) === String(form.tradeId)));
  const trade = category?.trades.find((t) => String(t.id) === String(form.tradeId));
  const pick = (own, inherited) => (own?.trim?.() ? own.trim() : inherited ?? "");
  const ownSocial = cleanSocial(form.social);
  const cities = String(form.coverageCities ?? "").split(",").map((c) => c.trim()).filter(Boolean);
  return {
    id: null,
    slug: null,
    title: form.title || "Título de tu publicación",
    description: form.description || "",
    category: category ? { id: category.id, slug: category.slug, name: category.name } : null,
    trade: trade ? { id: trade.id, slug: trade.slug, name: trade.name } : null,
    advertiser,
    photos: photos.map((p, i) => ({ id: p.id ?? `new-${i}`, url: p.url, orderIndex: i })),
    coverUrl: photos[0]?.url ?? null,
    videoUrl: form.videoUrl || null,
    contact: {
      phone: pick(form.phone, advertiser?.phone),
      whatsapp: pick(form.whatsapp, advertiser?.whatsapp),
      email: pick(form.contactEmail, advertiser?.contactEmail),
      website: pick(form.website, advertiser?.website),
      social: Object.keys(ownSocial).length ? ownSocial : advertiser?.social ?? {},
    },
    address: form.address ?? "",
    province: form.province ?? "",
    city: form.city ?? "",
    neighborhood: form.neighborhood ?? "",
    latitude: toCoord(form.latitude),
    longitude: toCoord(form.longitude),
    coverageType: form.coverageType === "province" ? "province" : "cities",
    coverageCities: form.coverageType === "province" ? [] : cities,
    homeService: !!form.homeService,
    hasStore: !!form.hasStore,
    storeOnly: !!form.storeOnly,
    schedule: Object.fromEntries(Object.entries(form.schedule ?? {}).filter(([, v]) => v?.trim?.())),
  };
}

/** Errores 422 del backend (`{ campo: [msg] }`) → `{ campo: msg }` con la primera línea. */
export const firstErrors = (errors) =>
  Object.fromEntries(Object.entries(errors ?? {}).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)]));
