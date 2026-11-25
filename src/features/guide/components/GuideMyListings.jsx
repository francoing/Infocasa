import React from "react";
import { Link } from "react-router-dom";
import { Copy, Eye, Pause, Pencil, Play, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useGuideListingActions } from "@/hooks/useGuideListings";
import GuideStatusBadge from "./GuideStatusBadge";

const btn = "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50";

/** "Mis publicaciones" del panel de la Guía: estado, motivo de rechazo y acciones. */
export default function GuideMyListings({ listings = [], disabled = false }) {
  const toast = useToast();
  const { toggle, duplicate, remove, isBusy } = useGuideListingActions();

  const run = async (fn, ok) => {
    try {
      await fn();
      toast.success(ok);
    } catch (err) {
      toast.error(err.message || "No pudimos completar la acción.");
    }
  };

  const confirmRemove = (listing) => {
    if (window.confirm(`¿Eliminar "${listing.title}"? No se puede deshacer.`)) {
      run(() => remove(listing.id), "Publicación eliminada.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center gap-3">
        <p className="text-sm text-slate-500">{listings.length} publicaciones</p>
        {!disabled && (
          <Link to="/dashboard/guia/publicaciones/nueva" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Nueva publicación
          </Link>
        )}
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
          <p className="font-bold text-slate-700">Todavía no tenés publicaciones en la Guía.</p>
          <p className="text-sm text-slate-500">Creá la primera: es gratis.</p>
        </div>
      ) : (
        listings.map((l) => {
          const canToggle = l.status === "published" || l.status === "paused";
          const editable = !disabled && l.status !== "suspended";
          return (
            <article key={l.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-32 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                {l.coverUrl && <img src={l.coverUrl} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <GuideStatusBadge status={l.status} />
                  {l.trade?.name && <span className="text-xs font-semibold text-slate-400">{l.trade.name}</span>}
                </div>
                <h3 className="font-bold text-slate-900 break-words">{l.title}</h3>
                <p className="text-xs text-slate-500 flex gap-4">
                  <span className="inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {l.viewsCount} visitas</span>
                  <span>{l.inquiriesCount} consultas</span>
                </p>
                {l.status === "rejected" && l.rejectionReason && (
                  <p className="text-xs font-semibold text-red-700 bg-red-50 rounded-lg px-3 py-2">Motivo del rechazo: {l.rejectionReason}</p>
                )}
                {l.status === "pending_approval" && (
                  <p className="text-xs text-amber-700">La estamos revisando. Te avisamos acá cuando esté aprobada.</p>
                )}
              </div>
              <div className="flex flex-wrap md:flex-col gap-2 md:w-36">
                {l.status === "published" && (
                  <Link to={`/guia/publicacion/${l.slug}`} className={btn}><Eye className="w-3.5 h-3.5" /> Ver</Link>
                )}
                {editable && (
                  <Link to={`/dashboard/guia/publicaciones/${l.id}/editar`} className={btn}><Pencil className="w-3.5 h-3.5" /> Editar</Link>
                )}
                {canToggle && !disabled && (
                  <button type="button" disabled={isBusy} className={btn} onClick={() => run(() => toggle(l.id), l.status === "published" ? "Publicación pausada." : "Publicación activada.")}>
                    {l.status === "published" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {l.status === "published" ? "Pausar" : "Activar"}
                  </button>
                )}
                {!disabled && (
                  <button type="button" disabled={isBusy} className={btn} onClick={() => run(() => duplicate(l.id), "Duplicamos la publicación como borrador.")}>
                    <Copy className="w-3.5 h-3.5" /> Duplicar
                  </button>
                )}
                {!disabled && (
                  <button type="button" disabled={isBusy} className={`${btn} text-red-600`} onClick={() => confirmRemove(l)}>
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                  </button>
                )}
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}
