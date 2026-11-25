import { describe, it, expect, beforeEach } from "vitest";
import {
  approvedPaymentConversion,
  getMetaCookies,
  propertyIdFromPath,
  trackLead,
  trackPayment,
  trackSignUp,
  trackWhatsApp,
} from "../../lib/tracking";

const lastEvent = () => window.dataLayer[window.dataLayer.length - 1];

describe("lib/tracking (dataLayer para GTM)", () => {
  beforeEach(() => {
    window.dataLayer = [];
    window.localStorage.clear();
  });

  it("registro: ic_sign_up con tipo de cuenta y SIN valor", () => {
    trackSignUp("agent");
    const ev = lastEvent();
    expect(ev.event).toBe("ic_sign_up");
    expect(ev.account_type).toBe("agent");
    expect(ev).not.toHaveProperty("value");
    expect(ev).not.toHaveProperty("currency");
    expect(ev.event_id).toMatch(/^signup_/);
  });

  it("registro sin rol cae en buyer", () => {
    trackSignUp(undefined);
    expect(lastEvent().account_type).toBe("buyer");
  });

  it("pago de infomonedas: ic_purchase con monto real y event_id mp_<id>", () => {
    trackPayment({ id: 9001, amount: 12000, name: "Paquete 20 infomonedas", kind: "infomonedas" });
    expect(lastEvent()).toEqual({
      event: "ic_purchase",
      transaction_id: "9001",
      event_id: "mp_9001",
      value: 12000,
      currency: "ARS",
      item_name: "Paquete 20 infomonedas",
      item_category: "infomonedas",
    });
  });

  it("pago de plan: ic_subscribe", () => {
    trackPayment({ id: "77", amount: 40000, name: "Plan Profesional", kind: "plan" });
    expect(lastEvent().event).toBe("ic_subscribe");
    expect(lastEvent().event_id).toBe("mp_77");
  });

  it("el mismo pago no se cuenta dos veces (recarga de /payment/success)", () => {
    trackPayment({ id: "1", amount: 100, kind: "infomonedas" });
    trackPayment({ id: "1", amount: 100, kind: "infomonedas" });
    expect(window.dataLayer).toHaveLength(1);
  });

  it("sin id o sin monto real no se mide", () => {
    trackPayment({ amount: 100, kind: "infomonedas" });
    trackPayment({ id: "2", amount: 0, kind: "infomonedas" });
    trackPayment({ id: "3", kind: "plan" });
    expect(window.dataLayer).toHaveLength(0);
  });

  it("consulta: ic_lead con property_id", () => {
    trackLead(42);
    expect(lastEvent()).toMatchObject({ event: "ic_lead", property_id: "42", method: "form" });
  });

  it("WhatsApp desde una ficha lleva property_id; desde otra página no", () => {
    trackWhatsApp("/property/15");
    expect(lastEvent()).toMatchObject({ event: "ic_whatsapp", property_id: "15", method: "whatsapp" });
    trackWhatsApp("/search");
    expect(lastEvent()).not.toHaveProperty("property_id");
    expect(lastEvent().page_path).toBe("/search");
  });

  it("WhatsApp desde la Guía: mismo evento con sección guía y sin property_id", () => {
    trackWhatsApp("/guia/publicacion/electricista", { section: "guia", guide_listing_id: 7, guide_advertiser_id: undefined });
    const ev = lastEvent();
    expect(ev).toMatchObject({ event: "ic_whatsapp", section: "guia", guide_listing_id: "7", method: "whatsapp" });
    expect(ev).not.toHaveProperty("guide_advertiser_id");
    expect(ev).not.toHaveProperty("property_id");
  });

  it("propertyIdFromPath", () => {
    expect(propertyIdFromPath("/property/abc")).toBe("abc");
    expect(propertyIdFromPath("/profile")).toBeUndefined();
    expect(propertyIdFromPath(undefined)).toBeUndefined();
  });

  it("getMetaCookies devuelve solo las cookies del píxel que existen", () => {
    document.cookie = "_fbp=fb.1.111.222; path=/";
    expect(getMetaCookies()).toEqual({ fbp: "fb.1.111.222" });
    document.cookie = "_fbp=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  });
});

describe("approvedPaymentConversion (respuesta de verify)", () => {
  const payment = { id: "9", amount: 12000, currency: "ARS", name: "Paquete 20 infomonedas" };

  it("infomonedas aprobadas → datos de conversión", () => {
    expect(approvedPaymentConversion({ purchase_status: "approved", payment }, "infomonedas")).toEqual({
      id: "9",
      amount: 12000,
      name: "Paquete 20 infomonedas",
      kind: "infomonedas",
    });
  });

  it("infomonedas pendientes → null", () => {
    expect(approvedPaymentConversion({ purchase_status: "pending", payment }, "infomonedas")).toBeNull();
  });

  it("plan activo → datos; plan inactivo o sin payment → null", () => {
    expect(approvedPaymentConversion({ subscription: { active: true }, payment }, "plan")?.kind).toBe("plan");
    expect(approvedPaymentConversion({ subscription: { active: false }, payment }, "plan")).toBeNull();
    expect(approvedPaymentConversion({ subscription: { active: true }, payment: null }, "plan")).toBeNull();
    expect(approvedPaymentConversion(undefined, "plan")).toBeNull();
  });
});
