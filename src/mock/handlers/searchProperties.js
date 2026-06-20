import MOCK_PROPERTIES from "../data/properties.js";

/**
 * Parsea la query string de un endpoint tipo "/properties/search?city=...&operation=..."
 */
function parseQuery(endpoint) {
  const idx = endpoint.indexOf("?");
  if (idx === -1) return {};

  const params = new URLSearchParams(endpoint.slice(idx));
  const result = {};

  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
}

/**
 * Filtra propiedades según los parámetros de búsqueda.
 * Soportado:
 *   - city (coincidencia exacta)
 *   - operation ("sale" | "rent")
 *   - property_type_id (1=Depto, 2=Casa)
 *   - price_min / price_max
 *   - page / per_page
 */
export function searchProperties(endpoint) {
  const filters = parseQuery(endpoint);
  let results = [...MOCK_PROPERTIES];

  // Filtro por ciudad
  if (filters.city) {
    const cityLower = filters.city.toLowerCase().trim();
    results = results.filter(
      (p) =>
        (p.location?.city || "").toLowerCase().includes(cityLower) ||
        (typeof p.location === "string" && p.location.toLowerCase().includes(cityLower))
    );
  }

  // Filtro por operación
  if (filters.operation) {
    const op = filters.operation.toLowerCase();
    results = results.filter((p) => p.operation === op);
  }

  // Filtro por tipo de propiedad
  if (filters.property_type_id) {
    const typeId = parseInt(filters.property_type_id, 10);
    results = results.filter((p) => p.property_type?.id === typeId);
  }

  // Filtro por precio mínimo
  if (filters.price_min) {
    const min = parseFloat(filters.price_min);
    results = results.filter((p) => {
      const price = p.price?.usd || p.price?.amount || 0;
      return price >= min;
    });
  }

  // Filtro por precio máximo
  if (filters.price_max) {
    const max = parseFloat(filters.price_max);
    results = results.filter((p) => {
      const price = p.price?.usd || p.price?.amount || 0;
      return price <= max;
    });
  }

  // Paginación
  let page = parseInt(filters.page, 10) || 1;
  let perPage = parseInt(filters.per_page, 10) || 12;
  if (perPage > 50) perPage = 50;

  const total = results.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const paged = results.slice(start, start + perPage);

  return {
    data: paged,
    meta: {
      current_page: page,
      per_page: perPage,
      total,
      total_pages: totalPages,
    },
  };
}

/**
 * Obtiene una propiedad por ID.
 */
export function getPropertyById(endpoint) {
  // endpoint: "/properties/123"
  const match = endpoint.match(/\/properties\/(\d+)/);
  if (!match) return { data: null };

  const id = parseInt(match[1], 10);
  const property = MOCK_PROPERTIES.find((p) => p.id === id);
  return { data: property || null };
}
