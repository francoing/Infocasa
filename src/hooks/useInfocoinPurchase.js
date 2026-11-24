import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { infocoinsApi } from "../api/infocoins";
import { WALLET_QUERY_KEY } from "./useWallet";
import { approvedPaymentConversion, getMetaCookies, trackPayment } from "../lib/tracking";
import {
  PENDING_PURCHASE_KEY,
  buildPendingPurchase,
  readPendingPurchase,
  resolvePaymentReturn,
  paymentResultState,
} from "./infocoinPurchase.helpers";

const safeStorage = () => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

/**
 * Inicia la compra de un paquete: crea la preferencia de MP en el backend y guarda la
 * compra pendiente (por si la vuelta de MP no trae los datos). Devuelve la respuesta
 * del backend; la página redirige a `redirect_url`.
 *
 * Uso:
 *   const { startCheckout } = useInfocoinCheckout();
 *   const res = await startCheckout(pkg);
 *   window.location.href = res.redirect_url;
 */
export function useInfocoinCheckout() {
  const mutation = useMutation({
    mutationFn: (pkg) => infocoinsApi.createPurchasePreference(pkg.id, getMetaCookies()),
    onSuccess: (preference, pkg) => {
      safeStorage()?.setItem(PENDING_PURCHASE_KEY, JSON.stringify(buildPendingPurchase(preference, pkg)));
    },
  });

  return { startCheckout: mutation.mutateAsync, loading: mutation.isPending };
}

/**
 * Verifica el pago al volver del checkout de MP (/payment/success|failure|pending).
 * Llama a verify (idempotente en el backend) para acreditar aunque el webhook no haya
 * llegado, limpia la compra pendiente e invalida la billetera.
 *
 * @param {{ variant: string, query: URLSearchParams }} input
 * @returns {{ loading: boolean, message: string, balance: number|null, status: string|null }}
 */
export function useInfocoinPaymentResult({ variant, query }) {
  const queryClient = useQueryClient();
  const queryString = query.toString();

  // Se decide una sola vez por URL: la compra pendiente se lee al entrar.
  const decision = useMemo(
    () => resolvePaymentReturn({ variant, query, pending: readPendingPurchase(safeStorage()) }),
    [variant, queryString]
  );

  const verify = useQuery({
    queryKey: ["infocoin_purchase_verify", decision.params],
    queryFn: () => infocoinsApi.verifyPurchase(decision.params),
    enabled: decision.kind === "verify",
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (decision.kind === "rejected" || verify.isSuccess) {
      safeStorage()?.removeItem(PENDING_PURCHASE_KEY);
    }
    if (verify.isSuccess) {
      queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
      // Conversión con el monto real verificado por el backend (una vez por payment_id).
      const payment = approvedPaymentConversion(verify.data, "infomonedas");
      if (payment) trackPayment(payment);
    }
  }, [decision.kind, verify.isSuccess]);

  return paymentResultState(decision, verify);
}
