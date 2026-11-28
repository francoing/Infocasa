import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { propertyImportsApi } from "../api/propertyImports";
import { isImportActive, uploadErrorMessage } from "./propertyImport.helpers";

/** Cada cuánto se consulta el estado mientras la importación está en cola/procesando. */
const IMPORT_POLL_MS = 3000;

/** Link directo a la plantilla CSV (endpoint público del backend). */
export const PROPERTY_IMPORT_TEMPLATE_URL = propertyImportsApi.templateUrl;

/**
 * Sube el CSV. `onSuccess` recibe la importación creada (status `queued`).
 * Los errores del backend (422 encabezados, 409 una en curso, 429 throttle) se
 * traducen a un mensaje en `errorMessage`.
 */
export const useUploadPropertyImport = () => {
  const mutation = useMutation({
    mutationFn: (file) => propertyImportsApi.upload(file).then((res) => res?.data ?? res),
  });

  return {
    upload: mutation.mutate,
    isUploading: mutation.isPending,
    errorMessage: mutation.error ? uploadErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  };
};

/**
 * Estado de una importación con polling cada IMPORT_POLL_MS mientras siga activa.
 * Al terminar refresca "Mis propiedades" y el cupo del plan (los borradores cuentan).
 */
export const usePropertyImportStatus = (importId) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["property_import", importId],
    queryFn: () => propertyImportsApi.get(importId).then((res) => res?.data ?? res),
    enabled: !!importId,
    refetchInterval: (q) => (isImportActive(q.state.data) ? IMPORT_POLL_MS : false),
  });

  const status = query.data?.status;
  const notified = useRef(null);

  useEffect(() => {
    if (!importId || isImportActive(query.data) || !status || notified.current === importId) return;
    notified.current = importId;
    queryClient.invalidateQueries({ queryKey: ["me_properties"] });
    queryClient.invalidateQueries({ queryKey: ["publication_quota"] });
  }, [importId, status, query.data, queryClient]);

  return { data: query.data, isLoading: query.isLoading, error: query.error };
};
