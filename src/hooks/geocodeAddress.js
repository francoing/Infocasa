// Geocodificación puntual (una llamada al hacer clic en "Buscar" del mapa).
// Vive en hooks/ para mantener el fetch fuera de componentes (boundary de datos).
//
// Estrategia: las direcciones argentinas con altura ("Av. Perón 1500") no se
// resuelven bien por texto libre — el geocoder cae al centroide de la localidad.
// Geoapify estructurado (housenumber + street + city/state) sí ubica la altura.
// Fallback: Nominatim texto libre (al menos acierta la calle).

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

const round6 = (n) => Number(Number(n).toFixed(6));

/** Separa "Avenida Perón al 1500" → { housenumber: "1500", street: "Avenida Perón" }.
 *  Solo mira lo previo a la primera coma: provincia/departamento vienen de los selects. */
export const parseAddress = (raw) => {
  const head = raw.split(",")[0];
  const cleaned = head.replace(/\bal\b/gi, " ").replace(/\s+/g, " ").trim();
  const match = cleaned.match(/\d+/);
  const housenumber = match ? match[0] : "";
  const street = (match ? cleaned.replace(match[0], "") : cleaned).replace(/[,\s]+$/g, "").trim();
  return { housenumber, street: street || cleaned };
};

async function geocodeStructured(housenumber, street, province, department) {
  const params = new URLSearchParams({
    housenumber,
    street,
    city: department || "",
    state: province || "",
    country: "Argentina",
    lang: "es",
    limit: "1",
    apiKey: GEOAPIFY_KEY,
  });
  const res = await fetch(`https://api.geoapify.com/v1/geocode/search?${params}`);
  if (!res.ok) return null;
  const feat = (await res.json()).features?.[0];
  if (!feat) return null;
  // Rechazar resultados que degradaron a localidad/provincia (no ubican la altura).
  const type = feat.properties.result_type;
  if (type === "city" || type === "state" || type === "county") return null;
  return { latitude: round6(feat.properties.lat), longitude: round6(feat.properties.lon) };
}

async function geocodeFreeText(raw, province, department) {
  const q = [raw, department, province, "Argentina"].filter(Boolean).join(", ");
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ar&q=${encodeURIComponent(q)}`,
  );
  if (!res.ok) return null;
  const first = (await res.json())?.[0];
  if (!first) return null;
  return { latitude: round6(first.lat), longitude: round6(first.lon) };
}

/**
 * Geocodifica una dirección sesgada por provincia/departamento.
 * @returns {Promise<{latitude:number, longitude:number}|null>}
 */
export async function geocodeAddress(raw, { province = "", department = "" } = {}) {
  const query = raw.trim();
  if (!query) return null;

  const { housenumber, street } = parseAddress(query);
  if (GEOAPIFY_KEY && housenumber && street) {
    const structured = await geocodeStructured(housenumber, street, province, department);
    if (structured) return structured;
  }
  return geocodeFreeText(query, province, department);
}
