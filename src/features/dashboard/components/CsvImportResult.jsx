import React from "react";
import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import {
  importProgress,
  importSummary,
  isImportActive,
  problemRows,
  warningRows,
} from "@/hooks/propertyImport.helpers";

const TONES = {
  ok: "text-emerald-700 bg-emerald-50",
  muted: "text-slate-600 bg-slate-50",
  error: "text-red-700 bg-red-50",
  warn: "text-amber-700 bg-amber-50",
};

const RowList = ({ title, rows, icon }) => (
  <div>
    <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
      {icon} {title} ({rows.length})
    </h4>
    <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
      {rows.map((row) => (
        <li key={row.line} className="rounded-xl border border-slate-100 bg-white p-3 text-xs">
          <span className="font-bold text-slate-800">
            Fila {row.line}
            {row.external_id ? ` · ${row.external_id}` : ""}
          </span>
          <ul className="mt-1 list-disc pl-4 text-slate-600">
            {row.messages.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  </div>
);

/** Estado de una importación: progreso mientras corre; resumen y filas con problemas al terminar. */
export default function CsvImportResult({ importData, onNewImport }) {
  if (isImportActive(importData)) {
    const progress = importProgress(importData);
    return (
      <div className="space-y-3 rounded-2xl bg-blue-50 p-5" role="status" aria-live="polite">
        <p className="flex items-center gap-2 font-bold text-blue-800">
          <Loader2 className="w-5 h-5 animate-spin" /> Importando… ({importData.processed_rows} de {importData.total_rows})
        </p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-blue-100">
          <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-blue-700">
          Puede tardar unos minutos (se descargan las fotos). Podés cerrar esta ventana: la importación sigue.
        </p>
      </div>
    );
  }

  const failed = importData.status === "failed";
  const problems = problemRows(importData);
  const warnings = warningRows(importData);

  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <p className={`flex items-center gap-2 font-bold ${failed ? "text-red-700" : "text-emerald-700"}`}>
        {failed ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
        {failed ? importData.error || "La importación se interrumpió." : "Importación terminada"}
      </p>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {importSummary(importData).map((item) => (
          <div key={item.key} className={`rounded-xl p-3 ${TONES[item.tone]}`}>
            <dt className="text-xs font-semibold">{item.label}</dt>
            <dd className="text-2xl font-black">{item.value}</dd>
          </div>
        ))}
      </dl>

      {problems.length > 0 && (
        <RowList title="Filas que no se importaron" rows={problems} icon={<XCircle className="w-4 h-4 text-red-600" />} />
      )}
      {warnings.length > 0 && (
        <RowList title="Importadas con avisos" rows={warnings} icon={<AlertTriangle className="w-4 h-4 text-amber-600" />} />
      )}

      <p className="text-xs text-slate-500">Las propiedades quedaron como borrador en "Mis propiedades".</p>
      <button
        type="button"
        onClick={onNewImport}
        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
      >
        Importar otro archivo
      </button>
    </div>
  );
}
