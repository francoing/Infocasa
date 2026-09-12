import { useEffect } from "react";
import { api } from "../api/api";
import { queryClient } from "../lib/queryClient";

/**
 * Registra un escaneo de QR cuando la URL incluye `?ref=qr`.
 * Es un hook (no un componente) porque la arquitectura del proyecto
 * solo permite importar `api` desde `src/hooks/**`.
 */
export function useRegisterQrScan(propertyId) {
  useEffect(() => {
    if (!propertyId) return;

    const params = new URLSearchParams(window.location.search);
    const isQrRef = params.get("ref") === "qr";

    if (isQrRef) {
      api.post(`/properties/${propertyId}/qr-scan`)
        .then(() => {
          // Invalidar la query del dashboard para que el contador se actualice
          queryClient.invalidateQueries({ queryKey: ["me_properties"] });
        })
        .catch((err) => {
          // No mostrar error al usuario, es solo un registro
          console.warn("No se pudo registrar el escaneo de QR:", err);
        });
    }
  }, [propertyId]);
}