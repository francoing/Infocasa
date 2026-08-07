// Helper puro para el geocoding directo (texto → coords). Sin fetch ni estado.

/**
 * Toma la respuesta de Geoapify (geocode/search) y devuelve el foco del mapa del
 * primer resultado: { lat, lng, bbox } o null si no hay un resultado usable.
 * Nota: Geoapify usa `lon`; acá lo normalizamos a `lng` (lo que consume el mapa).
 */
export const parseFirstGeocode = (data) => {
  const f = data?.features?.[0];
  const lat = f?.properties?.lat;
  const lon = f?.properties?.lon;
  if (lat == null || lon == null) return null;
  return {
    lat,
    lng: lon,
    bbox: Array.isArray(f.bbox) && f.bbox.length === 4 ? f.bbox : null,
  };
};
