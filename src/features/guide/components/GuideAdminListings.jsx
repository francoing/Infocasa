import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Ban, Check, Pencil, Trash2, X } from "lucide-react";
import Loader from "@/common/components/Loader";
import Pagination from "@/common/components/Pagination";
import { useToast } from "@/hooks/useToast";
import { useGuideAdminListings, useGuideModeration } from "@/hooks/useGuideAdmin";
import GuideStatusBadge from "./GuideStatusBadge";
import { TextArea, TextInput, inputClass } from "./GuideFields";

const STATUS_FILTERS = [
  { value: "pending_approval", label: "Pendientes" },
  { value: "published", label: "Publicadas" },
  { value: "rejected", label: "Rechazadas" },
  { value: "suspended", label: "Suspendidas" },
  { value: "paused", label: "Pausadas" },
  { value: "draft", label: "Borradores" },
  { value: "", label: "Todas" },
];

const btn = "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border disabled:opacity-50";

/** Moderación de publicaciones de la Guía (admin): aprobar, rechazar con motivo, suspender, editar, eliminar. */
export default function GuideAdminListings() {
  const toast = useToast();
  const [status, setStatus] = useState("pending_approval");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const { data, isLoading } = useGuideAdminListings({ status: status || undefined, q: q || undefined, page });
  const { moderate, remove, edit, isBusy } = useGuideModeration();

  const run = async (fn, ok) => {
    try {
      await fn();
      toast.success(ok);
    } catch (err) {
      toast.error(err.message || "No pudimos completar la acción.");
    }
  };

  const reject = (l) => {
    const reason = window.prompt(`Motivo del rechazo de "${l.title}" (lo ve el anunciante):`);
    if (reason?.trim()) run(() => moderate({ id: l.id, action: "reject", reason: reason.trim() }), "Publicación rechazada.");
  };
  const suspend = (l) => {
    if (window.confirm(`¿Suspender "${l.title}"? Deja de verse y el anunciante no la puede reactivar.`)) {
      run(() => moderate({ id: l.id, action: "suspend" }), "Publicación suspendida.");
    }
  };
  const destroy = (l) => {
    if (window.confirm(`¿Eliminar "${l.title}" definitivamente?`)) run(() => remove(l.id), "Publicación eliminada.");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-3">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={`${inputClass} md:w-56`} aria-label="Estado">
          {STATUS_FILTERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Buscar por título, anunciante o rubro" className={inputClass} />
      </div>

      {isLoading ? (
        <Loader inline className="py-12" />
      ) : (data?.items ?? []).length === 0 ? (
        <p className="text-center text-slate-500 py-12">No hay publicaciones con ese filtro.</p>
      ) : (
        data.items.map((l) => (
          <article key={l.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col lg:flex-row gap-4">
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <GuideStatusBadge status={l.status} />
                <span className="text-xs text-slate-400 font-semibold">{l.category?.name} · {l.trade?.name}</span>
              </div>
              <h3 className="font-bold text-slate-900 break-words">{l.title}</h3>
              <p className="text-xs text-slate-500">
                {l.advertiser?.name} {l.advertiser?.user?.email && `· ${l.advertiser.user.email}`} · {[l.city, l.province].filter(Boolean).join(", ")}
              </p>
              <p className="text-sm text-slate-600 line-clamp-3">{l.description}</p>
              {l.rejectionReason && <p className="text-xs text-red-700">Motivo: {l.rejectionReason}</p>}
            </div>
            <div className="flex flex-wrap lg:flex-col gap-2 lg:w-40">
              {l.status !== "published" && (
                <button type="button" disabled={isBusy} onClick={() => run(() => moderate({ id: l.id, action: "approve" }), "Publicación aprobada.")} className={`${btn} border-emerald-200 text-emerald-700`}>
                  <Check className="w-3.5 h-3.5" /> Aprobar
                </button>
              )}
              {l.status !== "rejected" && (
                <button type="button" disabled={isBusy} onClick={() => reject(l)} className={`${btn} border-amber-200 text-amber-700`}><X className="w-3.5 h-3.5" /> Rechazar</button>
              )}
              {l.status !== "suspended" && (
                <button type="button" disabled={isBusy} onClick={() => suspend(l)} className={`${btn} border-slate-200 text-slate-600`}><Ban className="w-3.5 h-3.5" /> Suspender</button>
              )}
              <button type="button" onClick={() => setEditing(l)} className={`${btn} border-slate-200 text-slate-600`}><Pencil className="w-3.5 h-3.5" /> Editar</button>
              <button type="button" disabled={isBusy} onClick={() => destroy(l)} className={`${btn} border-red-200 text-red-600`}><Trash2 className="w-3.5 h-3.5" /> Eliminar</button>
              {l.status === "published" && <Link to={`/guia/publicacion/${l.slug}`} className="text-xs font-bold text-blue-600 hover:underline">Ver ficha</Link>}
            </div>
          </article>
        ))
      )}
      <Pagination meta={data?.meta} onPageChange={setPage} itemLabel="publicaciones" />

      {editing && (
        <AdminEditModal
          listing={editing}
          busy={isBusy}
          onClose={() => setEditing(null)}
          onSave={(fields) => run(async () => { await edit({ id: editing.id, data: fields }); setEditing(null); }, "Cambios guardados.")}
        />
      )}
    </div>
  );
}

/** Edición rápida del admin (textos y video): no cambia el estado de la publicación. */
function AdminEditModal({ listing, busy, onClose, onSave }) {
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description);
  const [videoUrl, setVideoUrl] = useState(listing.videoUrl ?? "");
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <form
        onSubmit={(e) => { e.preventDefault(); onSave({ title, description, video_url: videoUrl || null }); }}
        className="relative bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col gap-4"
      >
        <h3 className="font-bold text-slate-900">Editar publicación</h3>
        <TextInput label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextArea label="Descripción" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} />
        <TextInput label="Video" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold">Cancelar</button>
          <button type="submit" disabled={busy} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-50">Guardar</button>
        </div>
      </form>
    </div>
  );
}
