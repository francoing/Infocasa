import React from "react";
import { Link } from "react-router-dom";

/** Tab admin: tabla de moderación de propiedades (ver / dar de baja). */
export default function AdminPropertiesTab({ adminProperties, onDeleteProperty }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <th className="p-4">Propiedad</th>
                <th className="p-4">Publicador</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminProperties.length > 0 ? (
                adminProperties.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} className="w-12 h-10 rounded-lg object-cover" />
                        <div>
                          <Link to={`/property/${p.id}`} className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors line-clamp-1">{p.title}</Link>
                          <p className="text-[10px] text-slate-500 font-medium truncate w-32">{p.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-700">{p.owner?.name || "Desconocido"}</td>
                    <td className="p-4 text-sm font-black text-slate-900">USD {p.price.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="text-[10px] px-2 py-1 rounded-full font-bold uppercase bg-blue-100 text-blue-700">{p.status}</span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link to={`/property/${p.id}`} className="inline-block text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all">
                        Ver
                      </Link>
                      <button
                        onClick={() => onDeleteProperty(p.id)}
                        className="text-xs font-bold px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No hay propiedades publicadas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
