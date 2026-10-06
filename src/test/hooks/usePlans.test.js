import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePlans, fetchPlans, fetchUserPlan } from "@/hooks/usePlans";
import { api } from "@/api/api";
import { useAuthStore } from "@/store/useAuthStore";

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

vi.mock("@/store/useAuthStore", () => {
  const mockStore = vi.fn(() => ({
    user: null,
  }));
  mockStore.getState = vi.fn(() => ({
    refreshUser: vi.fn().mockResolvedValue(undefined),
  }));
  return {
    useAuthStore: mockStore,
  };
});


beforeEach(() => {
  vi.clearAllMocks();
});

describe("usePlans hook - validateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should block property creation if there is no active plan", async () => {
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

describe("fetchPlans", () => {
  it("should fetch plans from /plans and return raw array", async () => {
    const mockPlans = {
      data: [
        { id: 1, name: "Basic", price: 0, property_limit: 3, featured_limit: 0 },
      ],
    };
    api.get.mockResolvedValueOnce(mockPlans);

    const result = await fetchPlans();

    expect(api.get).toHaveBeenCalledWith("/plans");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 1,
      name: "Basic",
      price: 0,
      property_limit: 3,
      featured_limit: 0,
    });
  });

  it("should return empty array when backend returns no data", async () => {
    api.get.mockResolvedValueOnce({ data: null });

    const result = await fetchPlans();

    expect(result).toEqual([]);
  });

  it("should return empty array when backend returns undefined data", async () => {
    api.get.mockResolvedValueOnce({});

    const result = await fetchPlans();

    expect(result).toEqual([]);
  });

  it("should return multiple plans as-is", async () => {
    const mockPlans = {
      data: [
        { id: 1, name: "Profesional", price: 75000, property_limit: 30, featured_limit: 5 },
        { id: 2, name: "Profesional Plus", price: 150000, property_limit: 100, featured_limit: 15 },
        { id: 3, name: "Profesional Premium", price: 300000, property_limit: 200, featured_limit: 30 },
      ],
    };
    api.get.mockResolvedValueOnce(mockPlans);

    const result = await fetchPlans();

    expect(result).toHaveLength(3);
    expect(result[0].name).toBe("Profesional");
    expect(result[1].name).toBe("Profesional Plus");
    expect(result[2].name).toBe("Profesional Premium");
  });
});

describe("fetchUserPlan", () => {
  it("should return null if user has no subscription", async () => {
    api.get.mockResolvedValueOnce({ subscription: null });

    const result = await fetchUserPlan();

    expect(result).toBeNull();
  });

  it("should parse subscription data correctly", async () => {
    api.get.mockResolvedValueOnce({
      subscription: {
        id: "sub-abc",
        plan_id: 2,
        start_date: "2026-01-01",
        end_date: "2027-01-01",
        active: true,
        plan: {
          id: 2,
          name: "Premium",
          price: 2000,
          property_limit: 20,
          featured_limit: 5
        }
      }
    });

    const result = await fetchUserPlan();

    expect(result).toEqual({
      id: "sub-abc",
      startDate: "2026-01-01",
      expiryDate: "2027-01-01",
      active: true,
      planId: 2,
      details: {
        id: 2,
        name: "Premium",
        price: 2000,
        limit: 20,
        featured_limit: 5
      }
    });
  });

  it("should default limit to 9999 when property_limit is null", async () => {
    api.get.mockResolvedValueOnce({
      subscription: {
        id: "sub-xyz",
        plan_id: 3,
        start_date: "2026-01-01",
        end_date: null,
        active: true,
        plan: {
          id: 3,
          name: "Unlimited",
          price: 5000,
          property_limit: null,
          featured_limit: 50
        }
      }
    });

    const result = await fetchUserPlan();

    expect(result.details.limit).toBe(9999);
  });
});

describe("assignPlan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState.mockReturnValue({
      refreshUser: vi.fn().mockResolvedValue(undefined),
    });
  });

  it("should call POST /subscriptions with plan_id", async () => {
    const mockResponse = { id: "sub-new", plan_id: 2, active: true };
    api.post.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() });

    const response = await result.current.assignPlan(2);

    expect(api.post).toHaveBeenCalledWith("/subscriptions", { plan_id: 2 });
    expect(response).toEqual(mockResponse);
  });

  it("should refresh auth store on success", async () => {
    api.post.mockResolvedValueOnce({ id: "sub-new" });

    const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() });

    await result.current.assignPlan(2);

    // onSuccess should have called refreshUser
    expect(useAuthStore.getState().refreshUser).toHaveBeenCalledTimes(1);
  });

  it("should reject and NOT refresh auth store when API fails", async () => {
    const apiError = new Error("422 The plan id field is required.");
    apiError.status = 422;
    api.post.mockRejectedValueOnce(apiError);

    const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() });

    await expect(result.current.assignPlan(undefined)).rejects.toThrow("422 The plan id field is required.");
    expect(useAuthStore.getState().refreshUser).not.toHaveBeenCalled();
  });

  it("should reject when plan_id is missing (falsy)", async () => {
    const apiError = new Error("422 The plan id field is required.");
    apiError.status = 422;
    api.post.mockRejectedValueOnce(apiError);

    const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() });

    await expect(result.current.assignPlan(null)).rejects.toThrow();
    expect(api.post).toHaveBeenCalledWith("/subscriptions", { plan_id: null });
  });
});
