import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import Loader from "@/common/components/Loader";
import Pagination from "@/common/components/Pagination";
import { Checkbox } from "./GuideFields";
import { useMarkGuideInquiryRead, useMyGuideInquiries } from "@/hooks/useGuideInquiries";

const fmt = (d) => (d ? new Date(d).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" }) : "");

/** "Consultas recibidas" del panel de la Guía (con marcar como leída). */
export default function GuideInquiriesList() {
  const [page, setPage] = useState(1);
  const [unread, setUnread] = useState(false);
  const { data, isLoading } = useMyGuideInquiries({ page, unread: unread ? 1 : undefined });
  const { markRead, isMarking } = useMarkGuideInquiryRead();
  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-4">
      <Checkbox label="Solo sin leer" checked={unread} onChange={(v) => { setUnread(v); setPage(1); }} />
      {isLoading ? (
        <Loader inline className="py-12" />
      ) : items.length === 0 ? (
        <p className="text-center text-slate-500 py-12 bg-white rounded-2xl border border-dashed border-slate-200">No tenés consultas {unread ? "sin leer" : "todavía"}.</p>
      ) : (
        items.map((i) => (
          <article key={i.id} className={`bg-white rounded-2xl border p-5 flex flex-col gap-3 ${i.isRead ? "border-slate-100" : "border-blue-200 shadow-sm"}`}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-slate-900">{i.name} <span className="text-xs font-semibold text-slate-400">· {fmt(i.createdAt)}</span></p>
                <p className="text-xs font-semibold text-blue-600 break-all">
                  <a href={`mailto:${i.email}`}>{i.email}</a>{i.phone && <> · <a href={`tel:${i.phone}`}>{i.phone}</a></>}
                </p>
                {i.listing && (
                  <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">
                    Publicación: <Link to={`/guia/publicacion/${i.listing.slug}`} className="text-blue-600 hover:underline">{i.listing.title}</Link>
                  </p>
                )}
              </div>
              <span className="self-start text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-slate-100 text-slate-600">{i.typeLabel}</span>
            </div>
            <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-4 whitespace-pre-line break-words">{i.message}</p>
            {!i.isRead && (
              <button type="button" disabled={isMarking} onClick={() => markRead(i.id)} className="self-end inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline">
                <Check className="w-3.5 h-3.5" /> Marcar como leída
              </button>
            )}
          </article>
        ))
      )}
      <Pagination meta={data?.meta} onPageChange={setPage} itemLabel="consultas" />
    </div>
  );
}
