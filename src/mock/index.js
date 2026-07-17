import { searchProperties, getPropertyById } from "./handlers/searchProperties.js";

/** Simula latencia de red (200-600ms) */
const delay = () => new Promise((r) => setTimeout(r, 200 + Math.random() * 400));

/**
 * Mock de la API — implementa la misma interfaz que `api` en src/api/api.js
 *
 * Endpoints soportados:
 *   GET  /properties/search?city=X&operation=Y&...
 *   GET  /properties/:id
 *
 * Cualquier otro endpoint devuelve { data: [] } o null.
 */
const mockFetch = async (endpoint, options = {}) => {
  const method = (options.method || "GET").toUpperCase();
  const path = endpoint.split("?")[0]; // ruta sin query

  await delay();

  // POST /properties — simular creación exitosa
  if (method === "POST" && path === "/properties") {
    return { data: { id: Date.now(), ...JSON.parse(options.body || "{}") } };
  }

  // POST /auth/forgot-password — simular envío de correo de recuperación
  if (method === "POST" && path === "/auth/forgot-password") {
    return { message: "Si el email está registrado, recibirás un enlace para restablecer tu contraseña." };
  }

  // POST /auth/reset-password — simular cambio de clave
  if (method === "POST" && path === "/auth/reset-password") {
    return { message: "Contraseña restablecida exitosamente." };
  }

  // PUT /properties/:id — simular actualización
  if (method === "PUT" && path.startsWith("/properties/")) {
    return { data: { id: parseInt(path.split("/")[2], 10), ...JSON.parse(options.body || "{}") } };
  }

  // DELETE /properties/:id — simular borrado
  if (method === "DELETE" && path.startsWith("/properties/")) {
    return null; // 204 No Content
  }

  // GET /properties/search?...
  if (method === "GET" && path === "/properties/search") {
    return searchProperties(endpoint);
  }

  // GET /properties/:id
  if (method === "GET" && path.startsWith("/properties/")) {
    return getPropertyById(endpoint);
  }

  // GET /agencies
  if (method === "GET" && path === "/agencies") {
    return {
      data: [
        { id: 1, name: "Inmobiliaria del Centro" },
        { id: 2, name: "Propiedades del Norte" },
        { id: 3, name: "Campos & Campos" },
        { id: 4, name: "Lujos Inmobiliarios" },
        { id: 5, name: "Inmobiliaria Tafí" },
        { id: 6, name: "Sur Inmobiliaria" },
        { id: 7, name: "Inmobiliaria Santiagueña" },
        { id: 8, name: "Termas Propiedades" },
      ],
    };
  }

  // GET /me/properties — propiedades del usuario logueado
  if (method === "GET" && path === "/me/properties") {
    return { data: [] };
  }

  // GET /zones
  if (method === "GET" && path === "/zones") {
    return {
      data: [
        { id: 1, name: "Zona Norte" },
        { id: 2, name: "Zona Sur" },
        { id: 3, name: "Zona Oeste" },
        { id: 4, name: "Zona Este" },
        { id: 5, name: "Centro" }
      ]
    };
  }

  // Fallback
  return { data: [] };
};

/**
 * mockApi — misma interfaz que `api` en src/api/api.js
 *
 * Uso:
 *   mockApi.get("/properties/search?city=Yerba Buena")
 *   mockApi.post("/properties", { title: "..." })
 */
export const mockApi = {
  get: (endpoint) => mockFetch(endpoint, { method: "GET" }),
  post: (endpoint, data) => mockFetch(endpoint, { method: "POST", body: JSON.stringify(data) }),
  put: (endpoint, data) => mockFetch(endpoint, { method: "PUT", body: JSON.stringify(data) }),
  patch: (endpoint, data) => mockFetch(endpoint, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (endpoint) => mockFetch(endpoint, { method: "DELETE" }),
};
