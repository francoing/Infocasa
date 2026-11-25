/**
 * Filtros de la búsqueda de la Guía: URL (`/guia/buscar?…`) ↔ params del backend.
 * Helpers puros (sin estado, sin HTTP). Contrato: `GET guide/listings`.
 */

const TEXT_KEYS = ["q", "category", "trade", "province", "city", "works_in", "neighborhood"];
const FLAG_KEYS = ["home_service", "has_store"];
const GEO_KEYS = ["lat", "lng", "radius_km"];

/** URLSearchParams → objeto de filtros normalizado (solo claves conocidas y con valor). */
export function readGuideFilters(searchParams) {
  const get = (k) => searchParams.get(k)?.trim() ?? "";
  const filters = {};
  for (const k of TEXT_KEYS) {
    const v = get(k);
    if (v) filters[k] = v;
  }
  for (const k of FLAG_KEYS) {
    if (["1", "true"].includes(get(k))) filters[k] = 1;
  }
  if (get("lat") && get("lng")) {
    for (const k of GEO_KEYS) {
      const v = get(k);
      if (v) filters[k] = v;
    }
  }
  const page = Number(get("page"));
  if (page > 1) filters.page = page;
  return filters;
}

/** Objeto de filtros → query string para la URL del front (sin vacíos). */
export function guideSearchUrl(filters = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== "" && v !== false && v !== 0) qs.set(k, String(v));
  }
  const str = qs.toString();
  return `/guia/buscar${str ? `?${str}` : ""}`;
}

/** Cambia un filtro y vuelve a la página 1 (cualquier cambio de filtro reinicia el paginado). */
export function withFilter(filters, key, value) {
  const next = { ...filters, [key]: value };
  delete next.page;
  if (value === "" || value === null || value === undefined || value === false) delete next[key];
  if (key === "category") delete next.trade; // el rubro pertenece a la categoría
  return next;
}

/** Cantidad de filtros activos (para el badge del botón de filtros en mobile). */
export const activeFilterCount = (filters) =>
  Object.keys(filters).filter((k) => !["page", "q", "lng", "radius_km"].includes(k)).length;
