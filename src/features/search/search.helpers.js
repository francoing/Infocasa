// Helpers puros de la búsqueda: leer/escribir filtros desde la URL y derivar
// opciones de ubicación en cascada. Sin JSX ni estado (ver .ai/context/architecture.md).

export const DEFAULT_FILTERS = {
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

export const CONDITION_OPTIONS = [
  { value: "", label: "Cualquier condición" },
  { value: "new", label: "A estrenar" },
  { value: "under_construction", label: "En construcción" },
  { value: "good", label: "Buen estado" },
  { value: "to_refurbish", label: "A refaccionar" },
];
