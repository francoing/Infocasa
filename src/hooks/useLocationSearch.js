import { useState, useMemo } from "react";
import { usePropertyFormRefs } from "./usePropertyFormRefs";
import { buildLocationSuggestions } from "./useLocationSearch.helpers";

/**
 * Autocomplete de ubicaciones por INVENTARIO (reemplaza a Geoapify en la búsqueda).
 * Sugiere solo lugares donde hay propiedades, con sus coords reales. Es local (sin red por
 * tecleo) sobre las `/locations` ya cacheadas → instantáneo y sin depender de una API key.
 *
 * Interfaz compatible con `useGeoapifyAutocomplete` (drop-in):
 *   { suggestions, loading, setQuery, clearSuggestions }
 */
export function useLocationSearch() {
  const { locations, loadingRefs } = usePropertyFormRefs();
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => buildLocationSuggestions(locations, query), [locations, query]);

  return {
    suggestions,
    loading: loadingRefs,
    setQuery,
    clearSuggestions: () => setQuery(""),
  };
}
