import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useWallet } from "@/hooks/useWallet";
import { usePackages } from "@/hooks/usePackages";
import { useAssignInfocoins } from "@/hooks/useAssignInfocoins";
import { useInfocoinCheckout, useInfocoinPaymentResult } from "@/hooks/useInfocoinPurchase";
import { api } from "@/api/api";

vi.mock("@/api/api", () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

let client;
const wrapper = ({ children }) => React.createElement(QueryClientProvider, { client }, children);

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});

describe("useWallet", () => {
  it("trae saldo y movimientos de /infocoins/wallet", async () => {
    api.get.mockResolvedValueOnce({ balance: 30, transactions: [{ id: 1 }] });
    const { result } = renderHook(() => useWallet(), { wrapper });
    await waitFor(() => expect(result.current.balance).toBe(30));
    expect(result.current.transactions).toEqual([{ id: 1 }]);
    expect(api.get).toHaveBeenCalledWith("/infocoins/wallet");
  });

  it("con enabled:false no pide nada", () => {
    renderHook(() => useWallet({ enabled: false }), { wrapper });
    expect(api.get).not.toHaveBeenCalled();
  });

  it("expone el error como mensaje", async () => {
    api.get.mockRejectedValueOnce(new Error("sin red"));
    const { result } = renderHook(() => useWallet(), { wrapper });
    await waitFor(() => expect(result.current.error).toBe("sin red"));
  });
});

describe("usePackages", () => {
  it("devuelve los paquetes del catálogo", async () => {
    api.get.mockResolvedValueOnce({ packages: [{ id: 1, infocoins: 10, price: 1000 }] });
    const { result } = renderHook(() => usePackages(), { wrapper });
    await waitFor(() => expect(result.current.packages).toHaveLength(1));
    expect(api.get).toHaveBeenCalledWith("/infocoins/packages");
  });
});

describe("useAssignInfocoins", () => {
  it("asigna e invalida la billetera y mis propiedades", async () => {
    api.post.mockResolvedValueOnce({ balance: 5, property_infocoins: 10 });
    const spy = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useAssignInfocoins(), { wrapper });

    let res;
    await act(async () => {
      res = await result.current.assign(8, 5);
    });

    expect(api.post).toHaveBeenCalledWith("/properties/8/infocoins", { amount: 5 });
    expect(res.balance).toBe(5);
    expect(spy).toHaveBeenCalledWith({ queryKey: ["infocoins_wallet"] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ["me_properties"] });
  });

  it("si falla, relanza con el mensaje y lo expone en error", async () => {
    api.post.mockRejectedValueOnce(new Error("No tenés suficientes infomonedas."));
    const { result } = renderHook(() => useAssignInfocoins(), { wrapper });

    await act(async () => {
      await expect(result.current.assign(8, 99)).rejects.toThrow("No tenés suficientes infomonedas.");
    });
    await waitFor(() => expect(result.current.error).toBe("No tenés suficientes infomonedas."));
  });
});

describe("useInfocoinCheckout", () => {
  it("crea la preferencia y guarda la compra pendiente", async () => {
    api.post.mockResolvedValueOnce({ purchase_id: 4, preference_id: "pref", redirect_url: "https://mp" });
    const { result } = renderHook(() => useInfocoinCheckout(), { wrapper });

    let res;
    await act(async () => {
      res = await result.current.startCheckout({ id: 2, infocoins: 50 });
    });

    expect(api.post).toHaveBeenCalledWith("/infocoins/purchase/preference", { package_id: 2 });
    expect(res.redirect_url).toBe("https://mp");
    expect(JSON.parse(sessionStorage.getItem("pending_infocoin_purchase"))).toEqual({
      purchase_id: 4,
      preference_id: "pref",
      infocoins: 50,
    });
  });
});

describe("useInfocoinPaymentResult", () => {
  it("verifica, limpia la compra pendiente e invalida la billetera", async () => {
    sessionStorage.setItem("pending_infocoin_purchase", JSON.stringify({ purchase_id: 4 }));
    api.get.mockResolvedValueOnce({ message: "Compra aprobada", balance: 50, purchase_status: "approved" });
    const spy = vi.spyOn(client, "invalidateQueries");

    const query = new URLSearchParams("payment_id=99&status=approved");
    const { result } = renderHook(() => useInfocoinPaymentResult({ variant: "success", query }), { wrapper });

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.status).toBe("approved"));
    expect(result.current.balance).toBe(50);
    expect(api.get.mock.calls[0][0]).toBe("/infocoins/purchase/verify");
    expect(api.get.mock.calls[0][1].params).toMatchObject({ payment_id: "99", external_reference: "infocoin_4", purchase_id: 4 });
    expect(sessionStorage.getItem("pending_infocoin_purchase")).toBeNull();
    expect(spy).toHaveBeenCalledWith({ queryKey: ["infocoins_wallet"] });
  });

  it("pago rechazado: no llama al backend y limpia la compra pendiente", async () => {
    sessionStorage.setItem("pending_infocoin_purchase", JSON.stringify({ purchase_id: 4 }));
    const query = new URLSearchParams("status=rejected");
    const { result } = renderHook(() => useInfocoinPaymentResult({ variant: "failure", query }), { wrapper });

    expect(result.current.status).toBe("rejected");
    await waitFor(() => expect(sessionStorage.getItem("pending_infocoin_purchase")).toBeNull());
    expect(api.get).not.toHaveBeenCalled();
  });
});
