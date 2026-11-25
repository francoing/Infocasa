import React from "react";
import { ArrowLeft, ArrowRight, ImagePlus, X } from "lucide-react";

const MAX_GUIDE_PHOTOS = 10;

/**
 * Fotos de una publicación. `saved` = fotos ya guardadas (se reordenan/borran al instante vía
 * `onReorder`/`onDelete`); `pending` = archivos nuevos que se suben al guardar. La primera es la portada.
 */
export default function GuidePhotoManager({ saved = [], pending = [], onAdd, onRemovePending, onReorder, onDelete, busy }) {
  const total = saved.length + pending.length;

  const move = (index, delta) => {
    const ids = saved.map((p) => p.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    onReorder(ids);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {saved.map((p, i) => (
          <figure key={p.id} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group">
            <img src={p.url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
            {i === 0 && <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Portada</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between p-1 bg-black/40">
              <button type="button" disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label="Mover a la izquierda" className="p-1 text-white disabled:opacity-30"><ArrowLeft className="w-4 h-4" /></button>
              <button type="button" disabled={busy} onClick={() => onDelete(p.id)} aria-label="Borrar foto" className="p-1 text-white"><X className="w-4 h-4" /></button>
              <button type="button" disabled={busy || i === saved.length - 1} onClick={() => move(i, 1)} aria-label="Mover a la derecha" className="p-1 text-white disabled:opacity-30"><ArrowRight className="w-4 h-4" /></button>
            </div>
          </figure>
        ))}
        {pending.map((p, i) => (
          <figure key={p.url} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 ring-2 ring-dashed ring-blue-300">
            <img src={p.url} alt={`Foto nueva ${i + 1}`} className="w-full h-full object-cover" />
            <span className="absolute top-1 left-1 bg-white/90 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Nueva</span>
            <button type="button" onClick={() => onRemovePending(i)} aria-label="Quitar foto nueva" className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white"><X className="w-3.5 h-3.5" /></button>
          </figure>
        ))}
        {total < MAX_GUIDE_PHOTOS && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 cursor-pointer hover:border-blue-300 hover:text-blue-600">
            <ImagePlus className="w-6 h-6" />
            <span className="text-xs font-bold">Agregar fotos</span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                onAdd(Array.from(e.target.files ?? []).slice(0, MAX_GUIDE_PHOTOS - total));
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
      <p className="text-xs text-slate-400">Hasta {MAX_GUIDE_PHOTOS} fotos (JPG, PNG o WEBP). Las nuevas se suben al guardar.</p>
    </div>
  );
}
