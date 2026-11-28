// Helpers puros de la importación CSV (sin fetch ni estado). Spec dashboard/csv_import.

const ACTIVE = ["queued", "processing"];

/** La importación sigue en cola o procesándose (hay que seguir consultando). */
export const isImportActive = (imp) => !!imp && ACTIVE.includes(imp.status);

/** Mensaje en español para un error de subida (ver contrato: 422 / 409 / 429). */
export const uploadErrorMessage = (error) => {
  if (!error) return null;
  if (error.status === 429) return "Hiciste muchas importaciones seguidas. Probá de nuevo en un rato.";
  const fieldError = error.errors?.file?.[0] ?? error.errors?.agency_id?.[0];
  return fieldError || error.message || "No se pudo subir el archivo.";
};

/** Líneas del resumen, en el orden en que se muestran. */
export const importSummary = (imp) => {
  const c = imp?.counts ?? {};
  return [
    { key: "created", label: "Creadas como borrador", value: c.created ?? 0, tone: "ok" },
    { key: "duplicates", label: "Ya importadas (no se duplicaron)", value: c.duplicates ?? 0, tone: "muted" },
    { key: "invalid", label: "Con errores", value: (c.invalid ?? 0) + (c.failed ?? 0), tone: "error" },
    { key: "plan_limit", label: "Frenadas por el límite del plan", value: c.plan_limit ?? 0, tone: "warn" },
    { key: "photo_warnings", label: "Avisos de fotos", value: c.photo_warnings ?? 0, tone: "warn" },
  ];
};

const PROBLEM_RESULTS = ["invalid", "location_missing", "plan_limit", "failed"];

/** Filas que no se importaron, con sus motivos (para la lista de errores). */
export const problemRows = (imp) =>
  (imp?.rows ?? []).filter((row) => PROBLEM_RESULTS.includes(row.result));

/** Filas importadas con avisos (fotos que no bajaron, precio a consultar, etc.). */
export const warningRows = (imp) =>
  (imp?.rows ?? []).filter((row) => row.result === "created" && row.messages?.length > 0);

/** Progreso 0–100 para la barra mientras procesa. */
export const importProgress = (imp) => {
  if (!imp?.total_rows) return 0;
  return Math.min(100, Math.round((imp.processed_rows / imp.total_rows) * 100));
};
