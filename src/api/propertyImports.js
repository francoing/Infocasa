import { api, API_BASE_URL } from './api';

/**
 * Importación de propiedades por CSV (spec backend `properties/csv_import`).
 * Solo se importa desde `src/hooks/` (boundary de la API).
 */
export const propertyImportsApi = {
  /** POST /properties/import (multipart `file`) → 202 `{ data: PropertyImport }`. */
  upload: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/properties/import', fd);
  },
  /** GET /properties/imports/{id} → `{ data: PropertyImport }` (con `rows`). */
  get: (id) => api.get(`/properties/imports/${id}`),
  /** Plantilla pública: se descarga con un link directo (no es JSON). */
  templateUrl: `${API_BASE_URL}/properties/import/template`,
};
