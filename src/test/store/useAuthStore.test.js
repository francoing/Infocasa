import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api } from "@/api/api";
import { useAuthStore } from "@/store/useAuthStore";

// Mock the API module
vi.mock("@/api/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  isAdmin: false,
  isPublisher: false,
};

const mockUser = {
  id: "user-1",
  name: "Test User",
  email: "test@infocasa.com.ar",
  roles: [{ id: 1, name: "owner" }],
  subscription: {
    id: "sub-123",
    plan_id: 2,
    active: true,
    plan: { id: 2, name: "Premium", price: 2000, property_limit: 20, featured_limit: 5 },
  },
};

const mockToken = "fake-jwt-token";

describe("useAuthStore - refreshUser", () => {
  beforeEach(() => {
    // Reset store to known state with a token
    useAuthStore.setState({
      ...initialState,
      token: mockToken,
      user: { id: "user-1", name: "Old Name", roles: [{ id: 1, name: "owner" }], role: "owner" },
      isAuthenticated: true,
    });
    localStorage.setItem("auth_token", mockToken);
    localStorage.setItem("auth_user", JSON.stringify({ id: "user-1", name: "Old Name" }));
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should refresh user data from /auth/me and update store", async () => {
    api.get.mockResolvedValueOnce(mockUser);

    const result = await useAuthStore.getState().refreshUser();

    expect(api.get).toHaveBeenCalledWith("/auth/me");
    expect(result).toEqual({
      ...mockUser,
      role: "owner",
    });
    const state = useAuthStore.getState();
    expect(state.user.name).toBe("Test User");
    expect(state.user.role).toBe("owner");
    expect(state.isAuthenticated).toBe(true);
    expect(state.isPublisher).toBe(true);
  });

  it("should update localStorage when user data changes", async () => {
    api.get.mockResolvedValueOnce(mockUser);

    await useAuthStore.getState().refreshUser();

    const storedUser = JSON.parse(localStorage.getItem("auth_user"));
    expect(storedUser.name).toBe("Test User");
    expect(storedUser.role).toBe("owner");
  });

  it("should do nothing if there is no token", async () => {
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false });

    await useAuthStore.getState().refreshUser();

    expect(api.get).not.toHaveBeenCalled();
  });

  it("should handle API errors gracefully without crashing", async () => {
    api.get.mockRejectedValueOnce(new Error("Network error"));

    // Should not throw
    const result = await useAuthStore.getState().refreshUser();

    expect(result).toBeUndefined();
    // Store state should remain unchanged
    const state = useAuthStore.getState();
    expect(state.token).toBe(mockToken);
    expect(state.isAuthenticated).toBe(true);
  });

  it("should update derived flags after refresh", async () => {
    const adminUser = {
      ...mockUser,
      roles: [{ id: 1, name: "admin" }],
    };
    api.get.mockResolvedValueOnce(adminUser);

    await useAuthStore.getState().refreshUser();

    const state = useAuthStore.getState();
    expect(state.isAdmin).toBe(true);
    expect(state.isPublisher).toBe(false); // admin is not owner/agent
  });
});
