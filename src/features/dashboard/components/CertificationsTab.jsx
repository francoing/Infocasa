import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import CertificationCell from "./CertificationCell";

/** Tab admin: cola de certificaciones de alquiler temporario pendientes de revisión. */
export default function CertificationsTab({ items = [], onModerate, disabled }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <th className="p-4">Propiedad</th>
                <th className="p-4">Publicador</th>
                <th className="p-4">Ubicación</th>
                <th className="p-4 text-right">Revisión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length > 0 ? (
                items.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} className="w-12 h-10 rounded-lg object-cover" />
                        <div>
                          <Link
                            to={`/property/${p.id}`}
                            className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors line-clamp-1"
                          >
                            {p.title}
                          </Link>
                          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-0.5">
                            Certificación pendiente
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-700">{p.owner?.name || p.agency?.name || "Desconocido"}</td>
                    <td className="p-4 text-xs font-medium text-slate-500">{p.location}</td>
                    <td className="p-4 text-right">
                      <CertificationCell property={p} onModerate={onModerate} disabled={disabled} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-10 text-center">
                    <ShieldCheck className="w-10 h-10 text-green-500 mx-auto mb-3" />
                    <p className="font-bold text-slate-900">No hay certificaciones pendientes</p>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      Cuando un dueño solicite certificar un alquiler temporario, aparecerá acá.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
