/**
 * Helpers puros del flujo de compra de InfoMonedas (checkout de MercadoPago).
 * Sin React ni HTTP: se testean directo (src/test/helpers/infocoinPurchase.test.js).
 */

export const PENDING_PURCHASE_KEY = "pending_infocoin_purchase";

/** Lo que se guarda antes de ir a MP, por si la vuelta no trae los datos en la URL. */
export function buildPendingPurchase(preference, pkg) {
  return {
    purchase_id: preference?.purchase_id,
    preference_id: preference?.preference_id,
    infocoins: pkg?.infocoins,
  };
}

/** Lee la compra pendiente guardada en sessionStorage (tolera JSON roto o storage bloqueado). */
export function readPendingPurchase(storage) {
  try {
    return JSON.parse(storage?.getItem(PENDING_PURCHASE_KEY) || "null");
  } catch {
    return null;
  }
}

/**
 * Decide qué hacer al volver del checkout.
 * - `rejected`: MP rechazó/canceló → no se llama al backend.
 * - `missing`: no hay ningún dato para ubicar la compra.
 * - `verify`: se llama a GET /infocoins/purchase/verify con `params`.
 *
 * @param {{ variant: string, query: URLSearchParams, pending: object|null }} input
 */
export function resolvePaymentReturn({ variant, query, pending }) {
  const paymentId = query.get("payment_id");
  const externalRef = query.get("external_reference");
  const preferenceId = query.get("preference_id");
  const status = query.get("status");

  if (status === "rejected" || variant === "failure") {
    return { kind: "rejected", status };
  }

  if (!paymentId && !externalRef && !preferenceId && !pending?.purchase_id) {
    return { kind: "missing", status };
  }

  return {
    kind: "verify",
    status,
    params: {
      paymentId: paymentId || undefined,
      externalReference:
        externalRef || (pending?.purchase_id ? `infocoin_${pending.purchase_id}` : undefined),
      preferenceId: preferenceId || pending?.preference_id || undefined,
      purchaseId: pending?.purchase_id || undefined,
    },
  };
}

/** Estado que muestra la página de resultado, a partir de la decisión + la respuesta del backend. */
export function paymentResultState(decision, { data, error, isLoading } = {}) {
  if (decision.kind === "rejected") {
    return { loading: false, message: "El pago fue rechazado o cancelado.", balance: null, status: "rejected" };
  }
  if (decision.kind === "missing") {
    return { loading: false, message: "No recibimos datos del pago.", balance: null, status: "unknown" };
  }
  if (isLoading) {
    return { loading: true, message: "", balance: null, status: null };
  }
  if (error) {
    return {
      loading: false,
      message: error.message || "No pudimos verificar el pago.",
      balance: null,
      status: "error",
    };
  }
  return {
    loading: false,
    message: data?.message || "Pago procesado.",
    balance: data?.balance ?? null,
    status: data?.purchase_status || decision.status || null,
  };
}
