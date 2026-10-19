import { api } from "./api";

/**
 * InfoMonedas — llamadas al backend.
 */
export const infocoinsApi = {
  /** Catálogo de paquetes activos. GET /infocoins/packages */
  getPackages: () => api.get("/infocoins/packages"),

  /** Billetera del usuario autenticado. GET /infocoins/wallet */
  getWallet: () => api.get("/infocoins/wallet"),

  /** Crea una preferencia de pago para un paquete. */
  createPurchasePreference: (packageId) =>
    api.post("/infocoins/purchase/preference", { package_id: packageId }),

  /** Verifica el pago al volver del checkout. */
  verifyPurchase: ({ paymentId, externalReference, preferenceId, purchaseId } = {}) =>
    api.get("/infocoins/purchase/verify", {
      params: {
        payment_id: paymentId || undefined,
        external_reference: externalReference || undefined,
        preference_id: preferenceId || undefined,
        purchase_id: purchaseId || undefined,
      },
    }),

  /** Asigna N infomonedas a una propiedad propia y activa. */
  assignToProperty: (propertyId, amount) =>
    api.post(`/properties/${propertyId}/infocoins`, { amount }),
};