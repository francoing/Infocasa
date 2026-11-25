/**
 * Mappers puros de la InfoCasa Guía: contrato del backend (snake_case) → objetos de UI
 * (camelCase) y formularios → payloads. Sin estado ni HTTP. Contrato: `api-contract.md` → Guía.
 */

export const ADVERTISER_TYPES = [
  { value: "professional", label: "Profesional independiente" },
  { value: "trade_provider", label: "Prestador de oficios" },
  { value: "store", label: "Comercio" },
  { value: "company", label: "Empresa" },
  { value: "venture", label: "Emprendimiento" },
];

export const INQUIRY_TYPES = [
  { value: "info", label: "Información" },
  { value: "budget", label: "Presupuesto" },
  { value: "availability", label: "Precio y disponibilidad" },
  { value: "other", label: "Otro" },
];

export const SCHEDULE_DAYS = [
  { key: "mon", label: "Lunes" },
  { key: "tue", label: "Martes" },
  { key: "wed", label: "Miércoles" },
  { key: "thu", label: "Jueves" },
  { key: "fri", label: "Viernes" },
  { key: "sat", label: "Sábado" },
  { key: "sun", label: "Domingo" },
];

export const SOCIAL_NETWORKS = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "tiktok", label: "TikTok" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "youtube", label: "YouTube" },
  { key: "x", label: "X" },
];

const STATUS_META = {
  draft: { label: "Borrador", tone: "slate" },
  pending_approval: { label: "En revisión", tone: "amber" },
  published: { label: "Publicada", tone: "emerald" },
  paused: { label: "Pausada", tone: "slate" },
  rejected: { label: "Rechazada", tone: "red" },
  suspended: { label: "Suspendida", tone: "red" },
  active: { label: "Activo", tone: "emerald" },
};

/** Etiqueta y tono de un estado de publicación o anunciante. */
export const guideStatusMeta = (status) => STATUS_META[status] ?? { label: status ?? "—", tone: "slate" };

const advertiserTypeLabel = (type) => ADVERTISER_TYPES.find((t) => t.value === type)?.label ?? "";

const inquiryTypeLabel = (type) => INQUIRY_TYPES.find((t) => t.value === type)?.label ?? "Otro";

export const cleanSocial = (social) =>
  Object.fromEntries(Object.entries(social ?? {}).filter(([, v]) => typeof v === "string" && v.trim() !== ""));

/** Número para wa.me: solo dígitos. `null` si no hay número usable. */
export const whatsappDigits = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length >= 8 ? digits : null;
};

/** URL absoluta para una red social: acepta URL completa o @usuario. */
export const socialUrl = (network, value) => {
  const v = String(value ?? "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v.replace(/^@/, "");
  const bases = {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    tiktok: "https://www.tiktok.com/@",
    linkedin: "https://www.linkedin.com/in/",
    youtube: "https://www.youtube.com/@",
    x: "https://x.com/",
  };
  return bases[network] ? `${bases[network]}${handle}` : null;
};

/** URL embebible de YouTube/Vimeo (o `null`). */
export const videoEmbedUrl = (url) => {
  if (!url) return null;
  const yt = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i.exec(url);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = /vimeo\.com\/(?:video\/)?(\d+)/i.exec(url);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
};

const mapGuideTrade = (t) => ({
  id: t.id,
  slug: t.slug,
  name: t.name,
  categoryId: t.category_id,
  order: t.order ?? 0,
  active: t.active !== false,
  listingsCount: t.listings_count ?? 0,
});

export const mapGuideCategory = (c) => ({
  id: c.id,
  slug: c.slug,
  name: c.name,
  order: c.order ?? 0,
  active: c.active !== false,
  listingsCount: c.listings_count ?? 0,
  trades: (c.trades ?? []).map(mapGuideTrade),
});

/** Copia campos con un valor por defecto: `pick(obj, { camel: "snake" }, "")`. */
const pick = (obj, fields, fallback) =>
  Object.fromEntries(Object.entries(fields).map(([to, from]) => [to, obj?.[from] ?? fallback]));

const ADVERTISER_TEXT = {
  description: "description", phone: "phone", whatsapp: "whatsapp", contactEmail: "contact_email",
  website: "website", address: "address", province: "province", city: "city",
  neighborhood: "neighborhood", cuit: "cuit",
};
const ADVERTISER_NULLABLE = {
  logoUrl: "logo_url", latitude: "latitude", longitude: "longitude", shareUrl: "share_url",
  user: "user", createdAt: "created_at",
};

export function mapGuideAdvertiser(a) {
  if (!a) return null;
  const listings = a.listings ?? [];
  return {
    id: a.id,
    slug: a.slug,
    type: a.type,
    typeLabel: advertiserTypeLabel(a.type),
    name: a.name,
    status: a.status,
    ...pick(a, ADVERTISER_TEXT, ""),
    ...pick(a, ADVERTISER_NULLABLE, null),
    social: cleanSocial(a.social),
    trades: (a.trades ?? []).map(mapGuideTrade),
    listings: listings.map(mapGuideListing),
    listingsCount: a.listings_count ?? listings.length,
  };
}

const LISTING_NULLABLE = {
  category: "category", trade: "trade", videoUrl: "video_url", ownContact: "own_contact",
  publishedAt: "published_at", createdAt: "created_at", shareUrl: "share_url", rejectionReason: "rejection_reason",
};
const LOCATION_TEXT = { address: "address", province: "province", city: "city", neighborhood: "neighborhood" };
const CONTACT_TEXT = { phone: "phone", whatsapp: "whatsapp", email: "email", website: "website" };

const mapPhotos = (photos) => (photos ?? []).map((p) => ({ id: p.id, url: p.url, orderIndex: p.order_index ?? 0 }));

export function mapGuideListing(l) {
  if (!l) return null;
  const photos = mapPhotos(l.photos);
  const coverage = l.coverage ?? {};
  return {
    id: l.id,
    slug: l.slug,
    title: l.title,
    description: l.description ?? "",
    status: l.status,
    ...pick(l, LISTING_NULLABLE, null),
    advertiser: mapGuideAdvertiser(l.advertiser),
    photos,
    coverUrl: l.cover_url ?? photos[0]?.url ?? null,
    contact: { ...pick(l.contact, CONTACT_TEXT, ""), social: cleanSocial(l.contact?.social) },
    ...pick(l.location, LOCATION_TEXT, ""),
    ...pick(l.location, { latitude: "latitude", longitude: "longitude" }, null),
    coverageType: coverage.type ?? "cities",
    coverageCities: coverage.cities ?? [],
    homeService: !!l.home_service,
    hasStore: !!l.has_store,
    storeOnly: !!l.store_only,
    schedule: l.schedule ?? {},
    ...pick(l, { viewsCount: "views_count", inquiriesCount: "inquiries_count" }, 0),
  };
}

export const mapGuideInquiry = (i) => ({
  id: i.id,
  listing: i.listing ?? null,
  name: i.name,
  email: i.email,
  phone: i.phone ?? "",
  type: i.type,
  typeLabel: inquiryTypeLabel(i.type),
  message: i.message,
  readAt: i.read_at ?? null,
  isRead: !!i.read_at,
  createdAt: i.created_at ?? null,
});

/** Texto de cobertura para la ficha ("Toda la provincia de X" / localidades). */
export function coverageText(listing) {
  if (!listing) return "";
  if (listing.coverageType === "province") {
    return listing.province ? `Toda la provincia de ${listing.province}` : "Toda la provincia";
  }
  const cities = [listing.city, ...(listing.coverageCities ?? [])].filter(Boolean);
  return [...new Set(cities)].join(", ");
}
