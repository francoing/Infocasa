import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePlans } from "@/hooks/usePlans";
import { api } from "@/api/api";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children);
};

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
    api.get.mockResolvedValueOnce({ subscription: null });

    const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() });
    const validationResult = await result.current.validateLimit();

    expect(validationResult.allowed).toBe(false);
    expect(validationResult.message).toBe("No tienes un plan activo.");
    expect(api.get).toHaveBeenCalledWith("/auth/me");
  });

  it("should block property creation if plan has expired", async () => {
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);

    // Mock user subscription (expired)
    api.get.mockResolvedValueOnce({
      subscription: {
        id: "sub123",
        plan_id: 2,
        start_date: pastDate.toISOString(),
        end_date: pastDate.toISOString(),
        active: false,
        plan: {
          id: 2,
          name: "Premium",
          price: 2000,
          property_limit: 20,
          featured_limit: 5
        }
      }
    });

    const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() });
    const validationResult = await result.current.validateLimit();

    expect(validationResult.allowed).toBe(false);
    expect(validationResult.message).toBe("Tu plan ha expirado.");
    expect(api.get).toHaveBeenCalledWith("/auth/me");
  });

  it("should allow property creation if under the limit", async () => {
    // Mock user plan (limit 3)
    api.get.mockResolvedValueOnce({
      subscription: {
        id: "sub123",
        plan_id: 1,
        start_date: new Date().toISOString(),
        end_date: null,
        active: true,
        plan: {
          id: 1,
          name: "Basic",
          price: 0,
          property_limit: 3,
          featured_limit: 0
        }
      }
    });
    
    // Mock current properties (2)
    api.get.mockResolvedValueOnce({
      data: [
        { id: "p1" },
        { id: "p2" }
      ]
    });

    const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() });
    const validationResult = await result.current.validateLimit();

    expect(validationResult.allowed).toBe(true);
    expect(validationResult.current).toBe(2);
    expect(validationResult.limit).toBe(3);
    expect(api.get).toHaveBeenNthCalledWith(1, "/auth/me");
    expect(api.get).toHaveBeenNthCalledWith(2, "/me/properties");
  });

  it("should block property creation if limit is reached", async () => {
    // Mock user plan (limit 3)
    api.get.mockResolvedValueOnce({
      subscription: {
        id: "sub123",
        plan_id: 1,
        start_date: new Date().toISOString(),
        end_date: null,
        active: true,
        plan: {
          id: 1,
          name: "Basic",
          price: 0,
          property_limit: 3,
          featured_limit: 0
        }
      }
    });
    
    // Mock current properties (3)
    api.get.mockResolvedValueOnce({
      data: [
        { id: "p1" },
        { id: "p2" },
        { id: "p3" }
      ]
    });

    const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() });
    const validationResult = await result.current.validateLimit();

    expect(validationResult.allowed).toBe(false);
    expect(validationResult.message).toBe("Has alcanzado el límite de tu plan (3 propiedades).");
    expect(api.get).toHaveBeenNthCalledWith(1, "/auth/me");
    expect(api.get).toHaveBeenNthCalledWith(2, "/me/properties");
  });
});
