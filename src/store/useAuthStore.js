import { create } from "zustand";
import { api } from "../api/api";

const enrichUser = (userData) => {
  if (!userData) return null;
  return {
    ...userData,
    role: userData.roles?.[0]?.name || 'buyer'
  };
};

const getInitialUser = () => {
  try {
    return JSON.parse(localStorage.getItem("auth_user")) || null;
  } catch (e) {
    return null;
  }
};

const initialUser = getInitialUser();
const initialToken = localStorage.getItem("auth_token") || null;

const getAuthDerivations = (user, token) => ({
  isAuthenticated: !!token && !!user,
  isAdmin: user?.roles?.some(r => r.name === 'admin') || false,
  isPublisher: user?.roles?.some(r => r.name === 'owner' || r.name === 'agent') || false,
});

export const useAuthStore = create((set, get) => ({
  user: initialUser,
  token: initialToken,
  loading: true,
  error: null,
  ...getAuthDerivations(initialUser, initialToken),

  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ loading: false, user: null, isAuthenticated: false, isAdmin: false, isPublisher: false });
      return;
    }
    set({ loading: true });
    try {
      const currentUser = await api.get("/auth/me");
      const enriched = enrichUser(currentUser);
      localStorage.setItem("auth_user", JSON.stringify(enriched));
      set({ 
        user: enriched, 
        loading: false,
        ...getAuthDerivations(enriched, token)
      });
    } catch (err) {
      console.error("Token invalid, logging out", err);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      set({ 
        user: null, 
        token: null, 
        loading: false,
        isAuthenticated: false,
        isAdmin: false,
        isPublisher: false
      });
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res && res.access_token) {
        const enriched = enrichUser(res.user);
        localStorage.setItem("auth_token", res.access_token);
        localStorage.setItem("auth_user", JSON.stringify(enriched));
        
        set({ 
          user: enriched, 
          token: res.access_token,
          ...getAuthDerivations(enriched, res.access_token)
        });
        return enriched;
      } else {
        throw new Error("Credenciales inválidas.");
      }
    } catch (err) {
      const msg = err.message || "Error al iniciar sesión.";
      set({ error: msg });
      throw err;
    }
  },

  register: async (userData) => {
    set({ error: null });
    try {
      const res = await api.post("/auth/register", {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password,
        role: userData.role,
        phone_area: userData.phoneArea,
        phone_number: userData.phoneNumber,
      });

      if (res && res.access_token) {
        const enriched = enrichUser(res.user);
        localStorage.setItem("auth_token", res.access_token);
        localStorage.setItem("auth_user", JSON.stringify(enriched));
        
        set({ 
          user: enriched, 
          token: res.access_token,
          ...getAuthDerivations(enriched, res.access_token)
        });
        return enriched;
      } else {
        throw new Error("Error al registrar el usuario.");
      }
    } catch (err) {
      const msg = err.message || "Error al crear la cuenta.";
      set({ error: msg });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Error during logout endpoint call", err);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      set({ 
        user: null, 
        token: null,
        isAuthenticated: false,
        isAdmin: false,
        isPublisher: false
      });
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await api.put("/me/profile", data);
      const enriched = enrichUser(res.user);
      localStorage.setItem("auth_user", JSON.stringify(enriched));
      set({ user: enriched });
      return enriched;
    } catch (err) {
      throw err;
    }
  },

  updatePassword: async (data) => {
    try {
      await api.put("/me/password", data);
    } catch (err) {
      throw err;
    }
  },

  updateAvatar: async (formData) => {
    try {
      const res = await api.post("/me/avatar", formData);
      const enriched = enrichUser(res.user);
      localStorage.setItem("auth_user", JSON.stringify(enriched));
      set({ user: enriched });
      return enriched;
    } catch (err) {
      throw err;
    }
  },

  refreshUser: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const currentUser = await api.get("/auth/me");
      const enriched = enrichUser(currentUser);
      localStorage.setItem("auth_user", JSON.stringify(enriched));
      set({ 
        user: enriched, 
        ...getAuthDerivations(enriched, token)
      });
      return enriched;
    } catch (err) {
      console.error("Error refreshing user", err);
    }
  },
}));
