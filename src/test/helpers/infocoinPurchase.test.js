import { describe, it, expect } from "vitest";
import {
  PENDING_PURCHASE_KEY,
  buildPendingPurchase,
  readPendingPurchase,
  resolvePaymentReturn,
  paymentResultState,
} from "@/hooks/infocoinPurchase.helpers";

const q = (s) => new URLSearchParams(s);
const storageWith = (value) => ({ getItem: (k) => (k === PENDING_PURCHASE_KEY ? value : null) });

describe("buildPendingPurchase / readPendingPurchase", () => {
  it("guarda ids de la preferencia y las monedas del paquete", () => {
    expect(buildPendingPurchase({ purchase_id: 7, preference_id: "pref" }, { infocoins: 50 })).toEqual({
      purchase_id: 7,
      preference_id: "pref",
      infocoins: 50,
    });
  });

  it("lee el JSON guardado y tolera JSON roto o storage ausente", () => {
    expect(readPendingPurchase(storageWith('{"purchase_id":3}'))).toEqual({ purchase_id: 3 });
    expect(readPendingPurchase(storageWith("{roto"))).toBeNull();
    expect(readPendingPurchase(null)).toBeNull();
  });
});

describe("resolvePaymentReturn", () => {
  it("rechazado por status o por la ruta /failure → no llama al backend", () => {
    expect(resolvePaymentReturn({ variant: "success", query: q("status=rejected&payment_id=1"), pending: null }).kind).toBe("rejected");
    expect(resolvePaymentReturn({ variant: "failure", query: q("payment_id=1"), pending: null }).kind).toBe("rejected");
  });

  it("sin datos en la URL ni compra pendiente → missing", () => {
    expect(resolvePaymentReturn({ variant: "success", query: q(""), pending: null }).kind).toBe("missing");
  });

  it("con datos de MP → verify con los params de la URL", () => {
    const d = resolvePaymentReturn({
      variant: "success",
      query: q("payment_id=99&external_reference=infocoin_5&preference_id=p1&status=approved"),
      pending: null,
    });
    expect(d.kind).toBe("verify");
    expect(d.params).toEqual({ paymentId: "99", externalReference: "infocoin_5", preferenceId: "p1", purchaseId: undefined });
  });

  it("sin datos en la URL pero con compra pendiente → arma la referencia desde sessionStorage", () => {
    const d = resolvePaymentReturn({ variant: "pending", query: q(""), pending: { purchase_id: 12, preference_id: "pp" } });
    expect(d.params).toEqual({ paymentId: undefined, externalReference: "infocoin_12", preferenceId: "pp", purchaseId: 12 });
  });

  it("compra pendiente sin purchase_id no inventa 'infocoin_undefined'", () => {
    const d = resolvePaymentReturn({ variant: "success", query: q("preference_id=p"), pending: { preference_id: "x" } });
    expect(d.params.externalReference).toBeUndefined();
  });
});

describe("paymentResultState", () => {
  const verify = { kind: "verify", status: "approved", params: {} };

  it("rechazado y sin datos tienen su mensaje fijo", () => {
    expect(paymentResultState({ kind: "rejected" }).status).toBe("rejected");
    expect(paymentResultState({ kind: "missing" }).status).toBe("unknown");
  });

  it("cargando, error y éxito", () => {
    expect(paymentResultState(verify, { isLoading: true }).loading).toBe(true);
    expect(paymentResultState(verify, { error: new Error("falló") })).toMatchObject({ status: "error", message: "falló" });
    expect(paymentResultState(verify, { data: { message: "ok", balance: 40, purchase_status: "approved" } })).toEqual({
      loading: false,
      message: "ok",
      balance: 40,
      status: "approved",
    });
  });

  it("sin purchase_status cae al status de la URL", () => {
    expect(paymentResultState({ ...verify, status: "pending" }, { data: {} }).status).toBe("pending");
  });
});
