import React from "react";
import { ShieldCheck, Upload, FileText, X, AlertCircle } from "lucide-react";

const FILE_ACCEPT = ".pdf,.jpg,.jpeg,.png";

/** Sección "Certificación de Domicilio": comprobante de servicio (solo Alquiler Temporario). */
export default function CertificationSection({ formData, formError, onCertDocChange, onClearCertDoc }) {
  const doc = formData.certification_document;

  return (
    <section className="bg-white p-8 rounded-[2.5rem] border border-emerald-200 shadow-sm space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-5 h-5 text-emerald-600" />
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Certificación de Domicilio</h3>
      </div>

      <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl">
        <p className="text-xs font-bold text-amber-800 leading-relaxed">
          Para publicar un <strong>Alquiler Temporario</strong> necesitás adjuntar una <strong>boleta de servicio</strong> (luz, gas, agua, internet) del domicilio.
          Esto verifica que la dirección existe y te corresponde.
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
          Comprobante de servicio <span className="text-red-500">*</span>
          {doc && (
            <span className="text-emerald-600 normal-case font-bold text-[10px] flex items-center gap-1 ml-2">
              <FileText className="w-3 h-3" /> Archivo seleccionado
            </span>
          )}
        </label>

        {!doc ? (
          <label className="flex flex-col items-center justify-center w-full min-h-[100px] px-6 py-6 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group">
            <Upload className="w-7 h-7 text-slate-300 group-hover:text-emerald-500 transition-colors mb-2" />
            <span className="text-sm font-bold text-slate-500 group-hover:text-emerald-600 transition-colors">Hacé clic para subir tu boleta</span>
            <span className="text-[10px] text-slate-400 mt-1">PDF, JPG o PNG — Máx. 5 MB</span>
            <input type="file" accept={FILE_ACCEPT} onChange={onCertDocChange} className="hidden" />
          </label>
        ) : doc.existingUrl ? (
          <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="p-3 bg-emerald-100 rounded-xl"><FileText className="w-6 h-6 text-emerald-600" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900">Comprobante ya cargado</p>
              <p className="text-[11px] text-emerald-600 font-semibold">Aprobado / En revisión</p>
            </div>
            <label className="p-2 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer" title="Reemplazar archivo">
              <Upload className="w-5 h-5 text-blue-400 hover:text-blue-600" />
              <input type="file" accept={FILE_ACCEPT} onChange={onCertDocChange} className="hidden" />
            </label>
            <button type="button" onClick={onClearCertDoc} className="p-2 hover:bg-red-50 rounded-xl transition-colors" title="Eliminar archivo">
              <X className="w-5 h-5 text-red-400 hover:text-red-600" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <div className="p-3 bg-emerald-100 rounded-xl"><FileText className="w-6 h-6 text-emerald-600" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{doc.name}</p>
              <p className="text-[11px] text-slate-500">{(doc.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button type="button" onClick={onClearCertDoc} className="p-2 hover:bg-red-50 rounded-xl transition-colors" title="Eliminar archivo">
              <X className="w-5 h-5 text-red-400 hover:text-red-600" />
            </button>
          </div>
        )}
      </div>

      {formError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-red-700">{formError}</p>
        </div>
      )}
    </section>
  );
}
