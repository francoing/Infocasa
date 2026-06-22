import { useState, useCallback } from "react";

const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
const REVERSE_GEO_URL = "https://api.geoapify.com/v1/geocode/reverse";

/** Provincias habilitadas para usar la aplicación */
const ALLOWED_PROVINCES = ["Tucumán", "Santiago del Estero"];

const initialState = {
  status: "idle", // idle | checking | allowed | blocked | error
  province: null,
  error: null,
  coords: null, // { lat, lng }
};

/**
 * useUserProvince — Hook para detectar la provincia del usuario
 * vía Geolocation API + reverse geocoding de Geoapify.
 *
 * Retorna:
 *   status       — idem arriba
 *   province     — nombre de la provincia detectada (o null)
 *   error        — mensaje de error (o null)
 *   coords       — { lat, lng } de la ubicación (o null)
 *   checkProvince — dispara la detección
 *   reset        — vuelve a idle
 */
export function useUserProvince() {
  const [state, setState] = useState(initialState);

  const checkProvince = useCallback(() => {
    // El browser soporta geolocation?
    if (!navigator.geolocation) {
      setState({
        status: "error",
        province: null,
        error: "Tu navegador no soporta geolocalización",
        coords: null,
      });
      return;
    }

    setState({
      status: "checking",
      province: null,
      error: null,
      coords: null,
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const params = new URLSearchParams({
            lat: latitude,
            lon: longitude,
            apiKey: API_KEY,
          });

          const res = await fetch(`${REVERSE_GEO_URL}?${params}`);

          if (!res.ok) {
            setState({
              status: "error",
              province: null,
              error: `Error al verificar ubicación (${res.status})`,
              coords: null,
            });
            return;
          }

          const data = await res.json();
          const province = data.features?.[0]?.properties?.state || "";

          if (!province) {
            setState({
              status: "error",
              province: null,
              error: "No se pudo determinar tu provincia",
              coords: null,
            });
            return;
          }

          if (ALLOWED_PROVINCES.includes(province)) {
            setState({
              status: "allowed",
              province,
              error: null,
              coords: { lat: latitude, lng: longitude },
            });
          } else {
            setState({
              status: "blocked",
              province,
              error: null,
              coords: null,
            });
          }
        } catch (err) {
          setState({
            status: "error",
            province: null,
            error: "Error de red al verificar ubicación",
            coords: null,
          });
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setState({
            status: "blocked",
            province: null,
            error: "Permiso de ubicación denegado",
            coords: null,
          });
        } else {
          setState({
            status: "error",
            province: null,
            error: "No se pudo obtener tu ubicación",
            coords: null,
          });
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 min de caché
      }
    );
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return { ...state, checkProvince, reset };
}
