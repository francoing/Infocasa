// Helpers puros de la vista mapa (explore). Sin JSX ni estado (ver .ai/context/architecture.md).
import { filtersToUrlParams } from "../search/search.helpers";

// Segmento de ruta viejo (/explore/:operation) → operación api. Sirve para SEMBRAR la
// operación cuando un enlace viejo no trae `operation` en el query. "todas"/desconocido → "".
const PATH_TO_OPERATION = { Comprar: "sale", Alquilar: "rent", Temporario: "temporary_rent" };
export const pathOperationToApi = (segment) => PATH_TO_OPERATION[segment] || "";

/**
 * Arma la URL del listado (/search) desde los filtros del mapa, conservando TODOS los
 * filtros (paridad mapa → listado). Mismo esquema de query params que usa /search.
 */
export const exploreToSearchUrl = (filters = {}) => {
  const qs = new URLSearchParams(filtersToUrlParams(filters)).toString();
  return `/search${qs ? `?${qs}` : ""}`;
};
