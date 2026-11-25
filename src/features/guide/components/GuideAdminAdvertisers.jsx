import React, { useState } from "react";
import { Link } from "react-router-dom";
import Loader from "@/common/components/Loader";
import Pagination from "@/common/components/Pagination";
import { useToast } from "@/hooks/useToast";
import { useGuideAdminAdvertisers, useGuideModeration } from "@/hooks/useGuideAdmin";
import GuideStatusBadge from "./GuideStatusBadge";
import { inputClass } from "./GuideFields";

/** Anunciantes de la Guía (admin): ver y suspender / reactivar. */
export default function GuideAdminAdvertisers() {
  const toast = useToast();
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGuideAdminAdvertisers({ status: status || undefined, q: q || undefined, page });
  const { setAdvertiserStatus, isBusy } = useGuideModeration();

  const toggle = async (a) => {
    const next = a.status === "active" ? "suspended" : "active";
    if (next === "suspended" && !window.confirm(`¿Suspender a ${a.name}? Se ocultan todas sus publicaciones.`)) return;
    try {
      await setAdvertiserStatus({ id: a.id, status: next });
      toast.success(next === "active" ? "Anunciante reactivado." : "Anunciante suspendido.");
    } catch (err) {
      toast.error(err.message || "No pudimos actualizar el anunciante.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-3">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={`${inputClass} md:w-56`} aria-label="Estado">
          <option value="">Todos</option>
          <option value="active">Activos</option>
          <option value="suspended">Suspendidos</option>
        </select>
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Buscar por nombre o email" className={inputClass} />
      </div>

      {isLoading ? (
        <Loader inline className="py-12" />
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-100">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="p-4">Anunciante</th>
                <th className="p-4 hidden md:table-cell">Cuenta</th>
                <th className="p-4">Publicaciones</th>
                <th className="p-4">Estado</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data?.items ?? []).map((a) => (
                <tr key={a.id}>
                  <td className="p-4">
                    <Link to={`/guia/${a.slug}`} className="font-bold text-slate-900 hover:text-blue-600">{a.name}</Link>
                    <p className="text-xs text-slate-400">{a.typeLabel}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell text-xs text-slate-500">{a.user?.email}</td>
                  <td className="p-4">{a.listingsCount}</td>
                  <td className="p-4"><GuideStatusBadge status={a.status} /></td>
                  <td className="p-4 text-right">
                    <button type="button" disabled={isBusy} onClick={() => toggle(a)} className={`text-xs font-bold ${a.status === "active" ? "text-red-600" : "text-emerald-700"} hover:underline disabled:opacity-50`}>
                      {a.status === "active" ? "Suspender" : "Reactivar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(data?.items ?? []).length === 0 && <p className="text-center text-slate-500 py-10">No hay anunciantes con ese filtro.</p>}
        </div>
      )}
      <Pagination meta={data?.meta} onPageChange={setPage} itemLabel="anunciantes" />
    </div>
  );
}
