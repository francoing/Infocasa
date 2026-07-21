// Geocodificación puntual (una llamada al hacer clic en "Buscar" del mapa).
// Vive en hooks/ para mantener el fetch fuera de componentes (boundary de datos).
//
// Las direcciones argentinas con altura ("Av. Perón 1500") no se resuelven por
// texto libre: el geocoder cae al centroide de la localidad. Además, la geocodificación
// estructurada exige el nombre CANÓNICO de la calle ("Avenida Juan Domingo Perón"),
// que el usuario nunca tipea. Por eso el flujo es en dos pasos:
//   1) Autocomplete (fuzzy) resuelve "Av Peron" → nombre oficial de la calle.
//   2) Geocode estructurado (housenumber + calle oficial + city/state) ubica la altura.
// Fallback: Nominatim texto libre (nivel calle) si Geoapify no tiene el dato.

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
const GEOAPIFY = "https://api.geoapify.com/v1/geocode";

const round6 = (n) => Number(Number(n).toFixed(6));
const coordsOf = (p) => ({ latitude: round6(p.lat), longitude: round6(p.lon) });
const isAreaLevel = (type) => type === "city" || type === "state" || type === "county";

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

/** Paso 1: resuelve el nombre canónico de la calle (y su punto) vía autocomplete fuzzy. */
async function resolveStreet(street, province, department) {
  const params = new URLSearchParams({
    text: [street, department, province].filter(Boolean).join(" "),
    filter: "countrycode:ar",
    limit: "1",
    lang: "es",
    apiKey: GEOAPIFY_KEY,
  });
  const res = await fetch(`${GEOAPIFY}/autocomplete?${params}`);
  if (!res.ok) return null;
  return (await res.json()).features?.[0]?.properties || null;
}

/** Paso 2: geocodifica la altura con el nombre canónico de la calle. */
export async function geocodeStructured(housenumber, street, city, state) {
  const params = new URLSearchParams({
    housenumber,
    street,
    city: city || "",
    state: state || "",
    country: "Argentina",
    lang: "es",
    limit: "1",
    apiKey: GEOAPIFY_KEY,
  });
  const res = await fetch(`${GEOAPIFY}/search?${params}`);
  if (!res.ok) return null;
  const p = (await res.json()).features?.[0]?.properties;
  if (!p || isAreaLevel(p.result_type)) return null;
  return coordsOf(p);
}

/** Fallback: Nominatim texto libre, sesgado por provincia/departamento. */
async function geocodeFreeText(raw, province, department) {
  const q = [raw, department, province, "Argentina"].filter(Boolean).join(", ");
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ar&q=${encodeURIComponent(q)}`,
  );
  if (!res.ok) return null;
  const first = (await res.json())?.[0];
  return first ? coordsOf({ lat: first.lat, lon: first.lon }) : null;
}

/**
 * Geocodifica una dirección sesgada por provincia/departamento.
 * @returns {Promise<{latitude:number, longitude:number}|null>}
 */
export async function geocodeAddress(raw, { province = "", department = "" } = {}) {
  const query = raw.trim();
  if (!query) return null;

  const { housenumber, street } = parseAddress(query);

  if (GEOAPIFY_KEY && street) {
    const canonical = await resolveStreet(street, province, department);
    if (canonical?.street) {
      if (housenumber) {
        const precise = await geocodeStructured(
          housenumber,
          canonical.street,
          canonical.city || department,
          canonical.state || province,
        );
        if (precise) return precise;
      }
      if (canonical.lat != null && canonical.lon != null) return coordsOf(canonical);
    }
  }

  return geocodeFreeText(query, province, department);
}
