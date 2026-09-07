import { useState, useEffect, useRef, useCallback } from "react";

const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
const GEOAPIFY_URL = "https://api.geoapify.com/v1/geocode/autocomplete";

/**
 * Hook para autocomplete de ubicaciones vía Geoapify Geocoding API.
 * Filtrado a Argentina (countrycode:ar).
 *
 * Retorna:
 *   suggestions   — array de { value, lat, lon, formatted }
 *   loading       — boolean
 *   error         — string | null
 *   setQuery      — function a llamar en onChange del input
 *   clearSuggestions — limpiar después de seleccionar
 */
export function useGeoapifyAutocomplete() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const hasKey = Boolean(API_KEY);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  useEffect(() => {
    if (!hasKey) return;

    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setError(null);
      return;
    }

    // Cancelar fetch anterior
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Debounce 300ms
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          text: query.trim(),
          filter: "countrycode:ar",
          limit: "6",
          lang: "es",
          apiKey: API_KEY,
        });

        const res = await fetch(`${GEOAPIFY_URL}?${params}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          setError(`Error ${res.status}: ${res.statusText}`);
          setSuggestions([]);
          return;
        }

        const data = await res.json();

        const mapped = (data.features || []).map((f) => ({
          value: f.properties.formatted,
          lat: f.properties.lat,
          lon: f.properties.lon,
          city: f.properties.city || f.properties.county || "",
          state: f.properties.state || "",
          formatted: f.properties.formatted,
        }));

        setSuggestions(mapped);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Error al obtener sugerencias.");
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(debounceRef.current);
      if (controller) controller.abort();
    };
  }, [query]);

  return { suggestions, loading, error, setQuery, clearSuggestions };
}
