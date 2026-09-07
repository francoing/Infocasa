import { useAuthStore } from "../store/useAuthStore";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const getHeaders = (isMultipart = false) => {
  const headers = {
    "Accept": "application/json"
  };
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  const token = useAuthStore.getState().token;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  if (!res.ok) {
    let errorData = null;
    try {
      errorData = await res.json();
    } catch (e) {
      // Ignore if response body is not JSON
    }
    const error = new Error(errorData?.message || `API error: ${res.status}`);
    error.status = res.status;
    error.errors = errorData?.errors;
    throw error;
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
};

const realApi = {
  get: async (endpoint) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  post: async (endpoint, data) => {
    const isMultipart = data instanceof FormData;
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: getHeaders(isMultipart),
      body: isMultipart ? data : JSON.stringify(data)
    });
    return handleResponse(res);
  },

  put: async (endpoint, data) => {
    const isMultipart = data instanceof FormData;
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(isMultipart),
      body: isMultipart ? data : JSON.stringify(data)
    });
    return handleResponse(res);
  },

  patch: async (endpoint, data) => {
    const isMultipart = data instanceof FormData;
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "PATCH",
      headers: getHeaders(isMultipart),
      body: isMultipart ? data : JSON.stringify(data)
    });
    return handleResponse(res);
  },

  delete: async (endpoint) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};

/**
 * Proxy que switchea entre mock y backend real en caliente.
 * - VITE_USE_MOCK=false → usa realApi (fetch al backend)
 * - VITE_USE_MOCK=true  → importa y usa mockApi (datos locales)
 *
 * El mock se importa lazy para no inflar el bundle en producción.
 */
export const api = new Proxy({}, {
  get(_, method) {
    return async (...args) => {
      if (USE_MOCK) {
        const mod = await import("../mock/index.js");
        return mod.mockApi[method](...args);
      }
      return realApi[method](...args);
    };
  },
});
