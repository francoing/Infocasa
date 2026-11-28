import React, { useEffect, useRef, useState } from "react";
import { FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import {
  PROPERTY_IMPORT_TEMPLATE_URL,
  usePropertyImportStatus,
  useUploadPropertyImport,
} from "@/hooks/usePropertyImport";
import CsvImportGuide from "./CsvImportGuide";
import CsvImportResult from "./CsvImportResult";

/**
 * Modal "Importar desde CSV": mini-guía + plantilla, subida del archivo y seguimiento
 * (polling) hasta el resumen. `importId` vive en el padre para que, si se cierra y se
 * vuelve a abrir, se siga viendo la importación en curso. Spec `dashboard/csv_import`.
 */
export default function CsvImportModal({ open, onClose, importId, onImportStarted }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const { upload, isUploading, errorMessage, reset } = useUploadPropertyImport();
  const { data: importData } = usePropertyImportStatus(importId);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const pickFile = (picked) => {
    reset();
    setFile(picked ?? null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = () => {
    if (!file) return;
    upload(file, {
      onSuccess: (created) => {
        setFile(null);
        onImportStarted(created.id);
      },
    });
  };

  const startOver = () => {
    setFile(null);
    reset();
    onImportStarted(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="csv-import-title"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 rounded-xl p-2 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 id="csv-import-title" className="mb-1 flex items-center gap-2 pr-10 text-xl font-black text-slate-900">
          <FileSpreadsheet className="w-6 h-6 text-emerald-600" /> Importar propiedades desde CSV
        </h2>
        <p className="mb-5 text-sm text-slate-500">Cargá muchas propiedades de una vez con una planilla.</p>

        {importData ? (
          <CsvImportResult importData={importData} onNewImport={startOver} />
        ) : (
          <div className="space-y-5">
            <CsvImportGuide templateUrl={PROPERTY_IMPORT_TEMPLATE_URL} />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${dragging ? "border-blue-500 bg-blue-50" : "border-slate-300"}`}
            >
              <Upload className="mx-auto mb-2 w-8 h-8 text-slate-400" />
              <p className="text-sm text-slate-600">Arrastrá tu archivo .csv acá o</p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-200 transition-colors"
              >
                Elegir archivo
              </button>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                aria-label="Archivo CSV"
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
              {file && <p className="mt-3 text-sm font-semibold text-slate-800">{file.name}</p>}
            </div>

            {errorMessage && (
              <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
                {errorMessage}
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!file || isUploading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {isUploading ? "Subiendo…" : "Importar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
