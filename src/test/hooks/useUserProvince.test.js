import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useUserProvince } from "@/hooks/useUserProvince";

// useUserProvince usa `navigator.geolocation.getCurrentPosition` (happy-dom no lo
// implementa) y `fetch` global (reverse geocode de Geoapify). Ambos se mockean
// explícitamente acá: el setup no auto-mockea nada (ver src/test/setup.js).
const TUCUMAN_COORDS = { latitude: -26.8083, longitude: -65.2176 };

/** Reemplaza navigator.geolocation por un mock controlable. */
const setGeolocation = (impl) => {
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: { getCurrentPosition: vi.fn(impl) },
  });
};

/** Respuesta JSON del reverse geocode. */
const jsonResponse = (body, ok = true, status = 200) => ({
  ok,
  status,
  json: async () => body,
});

beforeEach(() => {
  // Default: éxito con coords de Tucumán; cada test lo sobreescribe si hace falta.
  setGeolocation((success) => success({ coords: TUCUMAN_COORDS }));
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete navigator.geolocation;
});

describe("useUserProvince — geolocalización", () => {
  it("navegador sin soporte → error", () => {
    Object.defineProperty(navigator, "geolocation", { configurable: true, value: undefined });
    const { result } = renderHook(() => useUserProvince());

    act(() => result.current.checkProvince());

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("Tu navegador no soporta geolocalización");
    expect(result.current.province).toBeNull();
    expect(result.current.coords).toBeNull();
  });

  it("éxito en provincia habilitada → allowed con coords", async () => {
    fetch.mockResolvedValue(jsonResponse({ features: [{ properties: { state: "Tucumán" } }] }));
    const { result } = renderHook(() => useUserProvince());

    act(() => result.current.checkProvince());

    await waitFor(() => expect(result.current.status).toBe("allowed"));
    expect(result.current.province).toBe("Tucumán");
    expect(result.current.coords).toEqual({
      lat: TUCUMAN_COORDS.latitude,
      lng: TUCUMAN_COORDS.longitude,
    });
    // El reverse geocode va contra Geoapify con las coords del GPS.
    const url = fetch.mock.calls[0][0];
    expect(url).toContain("api.geoapify.com");
    expect(url).toContain("lat=-26.8083");
  });

  it("éxito en provincia NO habilitada → blocked (provincia visible, coords null)", async () => {
    fetch.mockResolvedValue(jsonResponse({ features: [{ properties: { state: "Buenos Aires" } }] }));
    const { result } = renderHook(() => useUserProvince());

    act(() => result.current.checkProvince());

    await waitFor(() => expect(result.current.status).toBe("blocked"));
    expect(result.current.province).toBe("Buenos Aires");
    expect(result.current.coords).toBeNull();
  });

  it("PERMISSION_DENIED → denied (province null, mensaje propio)", () => {
    setGeolocation((_success, error) => error({ code: 1, PERMISSION_DENIED: 1, message: "User denied" }));
    const { result } = renderHook(() => useUserProvince());

    act(() => result.current.checkProvince());

    expect(result.current.status).toBe("denied");
    expect(result.current.province).toBeNull();
    expect(result.current.coords).toBeNull();
    expect(result.current.error).toBe("Permiso de ubicación denegado");
  });

  it.each([
    { code: 2, name: "POSITION_UNAVAILABLE" },
    { code: 3, name: "TIMEOUT" },
  ])("$name → error", ({ code }) => {
    setGeolocation((_success, error) => error({ code, PERMISSION_DENIED: 1 }));
    const { result } = renderHook(() => useUserProvince());

    act(() => result.current.checkProvince());

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("No se pudo obtener tu ubicación");
  });
});

describe("useUserProvince — reverse geocode (fetch)", () => {
  it("respuesta del geocode con !ok → error", async () => {
    fetch.mockResolvedValue(jsonResponse({}, false, 500));
    const { result } = renderHook(() => useUserProvince());

    act(() => result.current.checkProvince());

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("Error al verificar ubicación (500)");
    expect(result.current.coords).toBeNull();
  });

  it("fetch lanza → error de red", async () => {
    fetch.mockRejectedValue(new Error("Network down"));
    const { result } = renderHook(() => useUserProvince());

    act(() => result.current.checkProvince());

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("Error de red al verificar ubicación");
  });

  it("respuesta sin state → error", async () => {
    fetch.mockResolvedValue(jsonResponse({ features: [{ properties: {} }] }));
    const { result } = renderHook(() => useUserProvince());

    act(() => result.current.checkProvince());

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("No se pudo determinar tu provincia");
  });
});