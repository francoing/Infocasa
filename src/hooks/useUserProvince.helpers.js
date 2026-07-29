// Helpers puros del gate de ubicación. Sin estado ni efectos (ver .ai/context/architecture.md).

/** Provincias habilitadas para usar la aplicación (forma canónica, con acento). */
const ALLOWED_PROVINCES = ["Tucumán", "Santiago del Estero"];

/**
 * Normaliza un nombre de provincia para comparar sin depender de acentos ni casing:
 * "Tucumán" / "Tucuman" / "TUCUMÁN" -> "tucuman". Geoapify a veces devuelve el nombre
 * sin acento, por eso NO se puede comparar por igualdad exacta.
 */
export const normalizeProvince = (value) => {
  if (!value) return ""; // null / undefined / "" → sin provincia
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita diacríticos (acentos)
    .toLowerCase()
    .trim();
};

const ALLOWED_NORM = ALLOWED_PROVINCES.map(normalizeProvince);

/**
 * ¿La provincia detectada está habilitada? Compara normalizado y tolera prefijos
 * tipo "Provincia de Tucumán" que devuelven algunos proveedores de geocoding.
 */
export const isAllowedProvince = (province) => {
  const norm = normalizeProvince(province);
  if (!norm) return false;
  return ALLOWED_NORM.some((allowed) => norm === allowed || norm.includes(allowed));
};
