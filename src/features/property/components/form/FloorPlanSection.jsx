import React, { useEffect, useMemo } from "react";
import { Upload, X, AlertCircle } from "lucide-react";
import { FLOOR_PLAN_ACCEPT, FLOOR_PLAN_MAX_MB } from "../../propertyForm.helpers";

// Vista previa: el plano ya cargado (URL) o el archivo recién elegido (object URL).
const usePreviewUrl = (floorPlan) => {
  const url = useMemo(() => {
    if (!floorPlan) return null;
    if (floorPlan instanceof File) return URL.createObjectURL(floorPlan);
    return floorPlan.existingUrl || null;
  }, [floorPlan]);

  useEffect(() => {
    if (floorPlan instanceof File && url) return () => URL.revokeObjectURL(url);
    return undefined;
  }, [floorPlan, url]);

  return url;
};

/** Sección "Plano" (opcional): una imagen del plano de la propiedad. Se ve en la tarjeta del marketplace. */
export default function FloorPlanSection({ floorPlan, error, onChange, onClear }) {
  const previewUrl = usePreviewUrl(floorPlan);

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-slate-500">
        Opcional. Subí una imagen del plano (JPG, PNG o WEBP, hasta {FLOOR_PLAN_MAX_MB} MB). Se muestra con un ícono en la tarjeta de la propiedad.
      </p>

      {!previewUrl ? (
        <label className="flex flex-col items-center justify-center w-full min-h-[120px] px-6 py-6 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group">
          <Upload className="w-7 h-7 text-slate-300 group-hover:text-blue-500 transition-colors mb-2" />
          <span className="text-sm font-bold text-slate-500 group-hover:text-blue-600 transition-colors">Hacé clic para subir el plano</span>
          <input type="file" accept={FLOOR_PLAN_ACCEPT} onChange={onChange} className="hidden" aria-label="Subir plano" />
        </label>
      ) : (
        <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <img src={previewUrl} alt="Vista previa del plano" className="w-full max-h-80 object-contain rounded-xl" />
          <div className="absolute top-4 right-4 flex gap-2">
            <label className="p-2 bg-white/95 rounded-xl shadow cursor-pointer hover:bg-blue-50 transition-colors" title="Reemplazar plano">
              <Upload className="w-5 h-5 text-blue-500" />
              <input type="file" accept={FLOOR_PLAN_ACCEPT} onChange={onChange} className="hidden" aria-label="Reemplazar plano" />
            </label>
            <button type="button" onClick={onClear} className="p-2 bg-white/95 rounded-xl shadow hover:bg-red-50 transition-colors" title="Quitar plano" aria-label="Quitar plano">
              <X className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl" role="alert">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
