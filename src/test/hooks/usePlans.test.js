import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePlans } from "@/hooks/usePlans";
import { api } from "@/api/api";

// Mock the API module
vi.mock("@/api/api", () => {
  return {
    api: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe("usePlans hook - validateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should block property creation if there is no active plan", async () => {
    // mock no user plan found
    api.get.mockResolvedValueOnce([]);

    const { result } = renderHook(() => usePlans());
    const validationResult = await result.current.validateLimit("user123");

    expect(validationResult.allowed).toBe(false);
    expect(validationResult.message).toBe("No tienes un plan activo.");
    expect(api.get).toHaveBeenCalledWith("/userPlans?userId=user123");
  });

  it("should block property creation if plan has expired", async () => {
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);

    // Mock user plans (expired)
    api.get.mockResolvedValueOnce([
      { id: "up1", planId: "premium", expiryDate: pastDate.toISOString() }
    ]);
    // Mock plan details
    api.get.mockResolvedValueOnce({ id: "premium", limit: 20, name: "Premium" });

    const { result } = renderHook(() => usePlans());
    const validationResult = await result.current.validateLimit("user123");

    expect(validationResult.allowed).toBe(false);
    expect(validationResult.message).toBe("Tu plan ha expirado.");
  });

  it("should allow property creation if under the limit", async () => {
    // Mock user plans (active, no expiry or in future)
    api.get.mockResolvedValueOnce([
      { id: "up1", planId: "basic", expiryDate: null }
    ]);
    // Mock plan details (limit 3)
    api.get.mockResolvedValueOnce({ id: "basic", limit: 3, name: "Básico" });
    // Mock properties (currently 2 published)
    api.get.mockResolvedValueOnce([
      { id: "p1" },
      { id: "p2" }
    ]);

    const { result } = renderHook(() => usePlans());
    const validationResult = await result.current.validateLimit("user123");

    expect(validationResult.allowed).toBe(true);
    expect(validationResult.current).toBe(2);
    expect(validationResult.limit).toBe(3);
  });

  it("should block property creation if limit is reached", async () => {
    // Mock user plans
    api.get.mockResolvedValueOnce([
      { id: "up1", planId: "basic", expiryDate: null }
    ]);
    // Mock plan details (limit 3)
    api.get.mockResolvedValueOnce({ id: "basic", limit: 3, name: "Básico" });
    // Mock properties (currently 3 published)
    api.get.mockResolvedValueOnce([
      { id: "p1" },
      { id: "p2" },
      { id: "p3" }
    ]);

    const { result } = renderHook(() => usePlans());
    const validationResult = await result.current.validateLimit("user123");

    expect(validationResult.allowed).toBe(false);
    expect(validationResult.message).toBe("Has alcanzado el límite de tu plan (3 propiedades).");
  });
});
