// Geocodificación puntual para el selector de ubicación del mapa.
// Vive en hooks/ para mantener el fetch fuera de componentes (boundary de datos).
//
// Las direcciones argentinas con altura ("Av. Perón 1500") no se resuelven por
// texto libre: el geocoder cae al centroide de la localidad. Además, la geocodificación
// estructurada exige el nombre CANÓNICO de la calle ("Avenida Juan Domingo Perón").
// Por eso el componente resuelve la calle vía autocomplete (useGeoapifyPlaces) y luego
// fija la altura con `geocodeStructured`. El pin manual se resuelve con `reverseGeocode`.

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
const GEOAPIFY = "https://api.geoapify.com/v1/geocode";

const round6 = (n) => Number(Number(n).toFixed(6));
const coordsOf = (p) => ({ latitude: round6(p.lat), longitude: round6(p.lon) });
const isAreaLevel = (type) => type === "city" || type === "state" || type === "county";

/** Geocodifica la altura con el nombre canónico de la calle (paso 2 del flujo del mapa). */
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

/** Geocodificación inversa: coords → dirección legible (calle + altura). Para el pin manual. */
export async function reverseGeocode(latitude, longitude) {
  if (!GEOAPIFY_KEY) return null;
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    lang: "es",
    limit: "1",
    apiKey: GEOAPIFY_KEY,
  });
  const res = await fetch(`${GEOAPIFY}/reverse?${params}`);
  if (!res.ok) return null;
  const p = (await res.json()).features?.[0]?.properties;
  if (!p) return null;
  const street = [p.street, p.housenumber].filter(Boolean).join(" ");
  return street || p.address_line1 || p.formatted || null;
}
