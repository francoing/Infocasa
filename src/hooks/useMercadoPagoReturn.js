import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/useAuthStore";
import { useToast } from "./useToast";

// Query params que MercadoPago agrega a la URL de retorno (se limpian al volver).
const MP_PARAMS = [
  "payment", "payment_id", "collection_id", "collection_status", "status",
  "external_reference", "payment_type", "merchant_order_id", "preference_id",
  "site_id", "processing_mode", "merchant_account_id",
];

// Helpers de módulo: mantienen la lógica de parseo fuera de la complejidad del efecto.
const readMpParams = (sp) => {
  const paymentStatus = sp.get("payment");
  const collectionStatus = sp.get("collection_status") ?? sp.get("status");
  const paymentId = sp.get("payment_id");
  const preferenceId = sp.get("preference_id");
  const externalReference = sp.get("external_reference");
  const isFromMercadoPago = !!(paymentId || preferenceId || externalReference);
  return { paymentStatus, collectionStatus, paymentId, preferenceId, externalReference, isFromMercadoPago };
};

const stripMpParams = (sp) => {
  const cleaned = new URLSearchParams(sp);
  MP_PARAMS.forEach((k) => cleaned.delete(k));
  return cleaned;
};

/**
 * Efecto de retorno del checkout de MercadoPago: al volver con query params de MP,
 * limpia la URL, verifica el pago server-side y activa la suscripción (una vez, on-mount).
 * Recibe `verifyMercadoPagoPayment` de usePlans. Ver .ai/context/architecture.md.
 */
export const useMercadoPagoReturn = (verifyMercadoPagoPayment) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const toast = useToast();

  useEffect(() => {
    const { paymentStatus, collectionStatus, paymentId, preferenceId, externalReference, isFromMercadoPago } =
      readMpParams(searchParams);
    if (!paymentStatus && !isFromMercadoPago) return;

    // Limpiar los query params de MP de la URL inmediatamente.
    setSearchParams(stripMpParams(searchParams), { replace: true });

    const isApproved = paymentStatus === "success" || collectionStatus === "approved";
    const isFailure = paymentStatus === "failure" || collectionStatus === "rejected";
    const isPending = paymentStatus === "pending" || collectionStatus === "pending";

    const onVerified = (res) => {
      if (res?.user) {
        const enriched = { ...res.user, role: res.user.roles?.[0]?.name || "buyer" };
        localStorage.setItem("auth_user", JSON.stringify(enriched));
        useAuthStore.setState({ user: enriched });
      }
      queryClient.invalidateQueries({ queryKey: ["userPlan"] });
      queryClient.invalidateQueries({ queryKey: ["auth_me"] });
      toast.success("¡Tu suscripción ha sido activada con éxito!");
    };

    const onVerifyError = (err) => {
      console.error("Error al verificar el pago con MP:", err);
      // Fallback: al menos refrescar el usuario desde /auth/me.
      useAuthStore.getState().checkAuth();
      queryClient.invalidateQueries({ queryKey: ["userPlan"] });
      toast.success("¡Pago procesado! Tu plan se actualizará en breve.");
    };

    if (isApproved || (isFromMercadoPago && !isFailure && !isPending)) {
      verifyMercadoPagoPayment({ paymentId, preferenceId, externalReference }).then(onVerified).catch(onVerifyError);
    } else if (isFailure) {
      toast.error("El pago no pudo completarse. Por favor, intenta de nuevo.");
    } else if (isPending) {
      toast.info("Tu pago está pendiente de aprobación.");
    }
  }, []);
};
