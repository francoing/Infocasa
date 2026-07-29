// Helpers puros de la vista mapa (explore). Sin JSX ni estado (ver .ai/context/architecture.md).

/**
 * Arma la URL del listado (/search) desde el estado del mapa, conservando la búsqueda.
 * `operationApi` ya viene traducida (sale/rent/temporary_rent) desde OPERATION_MAP.
 */
export const exploreToSearchUrl = ({ operationApi = "", location = "" } = {}) => {
  const params = new URLSearchParams();
  if (operationApi) params.set("operation", operationApi);
  if (location) params.set("location", location);
  const qs = params.toString();
  return `/search${qs ? `?${qs}` : ""}`;
};
