// Helpers puros de la búsqueda: leer/escribir filtros desde la URL y derivar
// opciones de ubicación en cascada. Sin JSX ni estado (ver .ai/context/architecture.md).

const DEFAULT_FILTERS = {
  location: "",
  province: "",
  department: "",
  minPrice: "",
  maxPrice: "",
  currency: "",
  propertyTypeId: "",
  agencyId: "",
  operation: "",
  roomsMin: "",
  bedroomsMin: "",
  parkingMin: "",
  condition: "",
  petsAllowed: false,
  professionalUse: false,
  sort: "recent",
};

// Claves booleanas: en la URL viajan como "1".
const BOOL_KEYS = ["petsAllowed", "professionalUse"];

/** Reconstruye el objeto de filtros (draft) desde los searchParams de la URL. */
export const readFilters = (searchParams) => {
  const out = { ...DEFAULT_FILTERS };
  for (const key of Object.keys(DEFAULT_FILTERS)) {
    const raw = searchParams.get(key);
    if (raw === null) continue;
    out[key] = BOOL_KEYS.includes(key) ? raw === "1" : raw;
  }
  out.sort = searchParams.get("sort") || "recent";
  return out;
};

/** Objeto plano para setSearchParams: solo valores presentes (no vacíos/false). */
export const filtersToUrlParams = (filters) => {
  const params = {};
  for (const [key, value] of Object.entries(filters)) {
    if (BOOL_KEYS.includes(key)) {
      if (value) params[key] = "1";
    } else if (value !== "" && value !== null && value !== undefined) {
      params[key] = value;
    }
  }
  return params;
};

const distinctSorted = (values) =>
  [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));

/** Opciones de provincia y departamento (cascada) derivadas de /locations. */
export const deriveLocationOptions = (locations = [], province = "") => {
  const provinces = distinctSorted(locations.map((l) => l.province));
  const departments = distinctSorted(
    locations.filter((l) => !province || l.province === province).map((l) => l.department)
  );
  return { provinces, departments };
};

/**
 * Arma la URL del mapa (/explore) desde los filtros del listado, conservando TODOS los
 * filtros (paridad listado → mapa; mismo esquema de query params). Si el filtro trae coords
 * de una sugerencia elegida (`lat`/`lng`/`bbox`), las emite para que el mapa haga zoom.
 */
export const searchToExploreUrl = (filters = {}) => {
  // Las coords NO son filtros: se separan para que filtersToUrlParams no las serialice
  // sueltas (y no se cuelen coords parciales). Se agregan aparte, juntas, para el zoom.
  const { lat, lng, bbox, ...rest } = filters;
  const params = new URLSearchParams(filtersToUrlParams(rest));
  if (lat != null && lng != null) {
    params.set("lat", lat);
    params.set("lng", lng);
  }
  if (Array.isArray(bbox) && bbox.length === 4) {
    params.set("bbox", bbox.join(","));
  }
  const qs = params.toString();
  return `/explore${qs ? `?${qs}` : ""}`;
};

export const OPERATION_OPTIONS = [
  { value: "", label: "Todas las operaciones" },
  { value: "sale", label: "Comprar" },
  { value: "rent", label: "Alquilar" },
  { value: "temporary_rent", label: "Alquiler temporario" },
];

export const CONDITION_OPTIONS = [
  { value: "", label: "Cualquier condición" },
  { value: "new", label: "A estrenar" },
  { value: "under_construction", label: "En construcción" },
  { value: "good", label: "Buen estado" },
  { value: "to_refurbish", label: "A refaccionar" },
];
