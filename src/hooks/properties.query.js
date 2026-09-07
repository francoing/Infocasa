// Construcción de la query string para GET /properties/search.
// Table-driven para mantener baja la complejidad de useProperties al sumar filtros.
// Fuente de params: .ai/contracts/api-contract.md · PropertySearchRequest.php (backend).

// Filtros de passthrough directo (string/number): clave del front -> param del backend.
const SIMPLE_PARAMS = {
  location: "city",
  province: "province",
  department: "department",
  neighborhood: "neighborhood",
  minPrice: "price_min",
  maxPrice: "price_max",
  currency: "currency",
  agencyId: "agency_id",
  roomsMin: "rooms_min",
  bedroomsMin: "bedrooms_min",
  parkingMin: "parking_spaces_min",
  condition: "condition",
};

const OPERATION_PARAM = { Alquiler: "rent", Venta: "sale" };

// Compat de URLs viejas `?type=Casa|Departamento` cuando no viene un property_type_id.
const legacyTypeId = (type) => {
  const t = (type || "").toLowerCase();
  if (t === "departamento") return 1;
  if (t === "casa") return 2;
  return null;
};

const hasValue = (v) => v !== undefined && v !== null && v !== "";

/** Devuelve `?a=1&b=2` (o `""`) para los filtros de búsqueda que el backend soporta. */
export const buildSearchQueryString = (filters = {}) => {
  const parts = [];
  const add = (key, val) => parts.push(`${key}=${encodeURIComponent(val)}`);

  for (const [frontKey, param] of Object.entries(SIMPLE_PARAMS)) {
    if (hasValue(filters[frontKey])) add(param, filters[frontKey]);
  }

  if (hasValue(filters.propertyTypeId)) {
    add("property_type_id", filters.propertyTypeId);
  } else if (filters.type && filters.type !== "Todos") {
    const id = legacyTypeId(filters.type);
    if (id) add("property_type_id", id);
  }

  if (filters.operation) {
    add("operation", OPERATION_PARAM[filters.operation] || filters.operation);
  }
  if (filters.petsAllowed) add("pets_allowed", 1);
  if (filters.professionalUse) add("professional_use", 1);

  if (filters.sort === "price_asc" || filters.sort === "price_desc") {
    add("sort", filters.sort);
  }

  if (filters.page) {
    add("page", filters.page);
    add("per_page", 6);
  } else {
    add("per_page", 12);
  }

  return parts.length > 0 ? `?${parts.join("&")}` : "";
};
