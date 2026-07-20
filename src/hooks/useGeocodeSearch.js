import { useState } from "react";

// Geocodificación de texto libre → coordenadas vía Nominatim (OpenStreetMap).
// Vive en la capa de datos (hooks/) porque hace una llamada de red: los componentes
// no hacen fetch directo (ver .ai/context/architecture.md).
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/**
 * Expone `geocode(query)` que devuelve `{ latitude, longitude }` (6 decimales) o `null`.
 * Maneja su propio estado de carga/error para que la UI solo consuma.
 */
export const useGeocodeSearch = () => {
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const geocode = async (query) => {
    if (!query || !query.trim()) return null;
    setSearching(true);
    setError("");
    try {
      const res = await fetch(`${NOMINATIM_URL}?format=json&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          latitude: Number(parseFloat(data[0].lat).toFixed(6)),
          longitude: Number(parseFloat(data[0].lon).toFixed(6)),
        };
      }
      setError("No se encontró ninguna ubicación con ese nombre.");
      return null;
    } catch {
      setError("Error al conectar con el servicio de mapas.");
      return null;
    } finally {
      setSearching(false);
    }
  };

  return { geocode, searching, error, setError };
};
