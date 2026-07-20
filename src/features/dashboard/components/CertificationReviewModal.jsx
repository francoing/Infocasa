import React from "react";
import { X, CheckCircle2, XCircle, FileText, ExternalLink, AlertTriangle } from "lucide-react";
import { isImageUrl } from "../certification.helpers";

/** Preview embebido del documento de certificación (imagen, PDF o fallback a link). */
function DocumentPreview({ url }) {
  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-slate-500">
        <AlertTriangle className="w-10 h-10 text-amber-500" />
        <p className="font-bold">El dueño no adjuntó documento de certificación.</p>
        <p className="text-sm">Podés rechazar la solicitud y pedir que lo suba.</p>
      </div>
    );
  }
  if (isImageUrl(url)) {
    return (
      <img src={url} alt="Documento de certificación" className="w-full max-h-[60vh] object-contain rounded-xl border border-slate-200" />
    );
  }
  return (
    <div className="space-y-3">
      <iframe title="Documento de certificación" src={url} className="w-full h-[60vh] rounded-xl border border-slate-200" />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline"
      >
        <ExternalLink className="w-4 h-4" /> Abrir en pestaña nueva
      </a>
    </div>
  );
}

/**
 * Modal de revisión del documento de certificación de un alquiler temporario.
 * `onModerate(status)` aprueba/rechaza; el modal se cierra tras moderar.
 */
export default function CertificationReviewModal({ property, onModerate, onClose, disabled }) {
  const reject = () => {
    if (window.confirm("¿Rechazar esta certificación? La propiedad vuelve a borrador y se notifica al dueño.")) {
      onModerate("rejected");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Revisar certificación</h3>
              <p className="text-sm font-medium text-slate-500">{property.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <DocumentPreview url={property.certificationDocumentUrl} />
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-100">
          <button
            onClick={reject}
            disabled={disabled}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all disabled:opacity-40"
          >
            <XCircle className="w-5 h-5" /> Rechazar
          </button>
          <button
            onClick={() => onModerate("approved")}
            disabled={disabled}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-all disabled:opacity-40"
          >
            <CheckCircle2 className="w-5 h-5" /> Aprobar y publicar
          </button>
        </div>
      </div>
    </div>
  );
}
