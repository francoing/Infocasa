// Helpers puros del autocomplete por INVENTARIO (ubicaciones reales de propiedades).
// Sin fetch ni estado (ver .ai/context/architecture.md).

const normalize = (value) =>
  value ? value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim() : "";

// Una ubicación entra si tiene propiedades publicadas. Si el backend todavía no manda
// `properties_count` (rollout), no filtramos (null/undefined → se incluye).
const hasProperties = (loc) => loc.properties_count == null || loc.properties_count > 0;

const cityOf = (loc) => loc.city || loc.department || "";

/**
 * Sugerencias de ubicación a partir del inventario (`/locations`). Filtra por lugares con
 * propiedades, matchea el texto (ciudad/departamento/provincia, sin acentos) y dedupe por
 * ciudad+provincia. Devuelve `{ value, label, city, state, lat, lon, bbox }`:
 *   value  → texto de búsqueda (matchea `city` del backend) e input.
 *   label  → "Ciudad, Provincia" para el dropdown.
 */
export const buildLocationSuggestions = (locations = [], query = "", limit = 6) => {
  const q = normalize(query);
  if (q.length < 2) return [];

  const seen = new Set();
  const out = [];
  for (const loc of locations) {
    if (!hasProperties(loc)) continue;
    const city = cityOf(loc);
    if (!city) continue;
    const province = loc.province || "";
    const haystack = [city, loc.department, province].map(normalize);
    if (!haystack.some((h) => h.includes(q))) continue;

    const key = `${normalize(city)}|${normalize(province)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      value: city,
      label: province ? `${city}, ${province}` : city,
      city,
      state: province,
      lat: loc.latitude != null ? Number(loc.latitude) : null,
      lon: loc.longitude != null ? Number(loc.longitude) : null,
      bbox: null,
    });
    if (out.length >= limit) break;
  }
  return out;
};

/**
 * Coords de una ubicación por texto (para el zoom del mapa cuando no vienen coords en la URL).
 * Match exacto por ciudad/departamento primero; luego "contiene". Devuelve `{ lat, lng, bbox }`.
 */
export const findLocationFocus = (locations = [], text = "") => {
  const t = normalize(text);
  if (!t) return null;
  const loc =
    locations.find((l) => normalize(cityOf(l)) === t) ||
    locations.find((l) => [l.city, l.department, l.province].map(normalize).some((h) => h && h.includes(t)));
  if (!loc || loc.latitude == null || loc.longitude == null) return null;
  return { lat: Number(loc.latitude), lng: Number(loc.longitude), bbox: null };
};
