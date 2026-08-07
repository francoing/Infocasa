import { useState, useEffect, useRef } from "react";
import { parseFirstGeocode } from "./useGeoapifyGeocode.helpers";

const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
const GEOCODE_URL = "https://api.geoapify.com/v1/geocode/search";

/**
 * Geocoding directo one-shot: texto → { lat, lng, bbox } (o null).
 * Se usa para centrar el mapa cuando llega una `location` por texto pero SIN coords
 * (ej. búsqueda que no eligió sugerencia). Cachea por query y cancela en cambios.
 *
 * @param {string}  query    texto de ubicación a geocodificar
 * @param {boolean} enabled  si es false no hace la llamada (ej. ya hay coords)
 */
export function useGeoapifyGeocode(query, enabled = true) {
  const [result, setResult] = useState(null);
  const cache = useRef({});

  useEffect(() => {
    const q = (query || "").trim();
    if (!enabled || !API_KEY || q.length < 2) {
      setResult(null);
      return;
    }
    if (cache.current[q] !== undefined) {
      setResult(cache.current[q]);
      return;
    }

    const controller = new AbortController();
    (async () => {
      try {
        const params = new URLSearchParams({
          text: q,
          filter: "countrycode:ar",
          limit: "1",
          lang: "es",
          apiKey: API_KEY,
        });
        const res = await fetch(`${GEOCODE_URL}?${params}`, { signal: controller.signal });
        if (!res.ok) {
          setResult(null);
          return;
        }
        const parsed = parseFirstGeocode(await res.json());
        cache.current[q] = parsed;
        setResult(parsed);
      } catch (err) {
        if (err.name !== "AbortError") setResult(null);
      }
    })();

    return () => controller.abort();
  }, [query, enabled]);

  return result;
}
