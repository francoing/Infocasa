import React from "react";

/** Tab admin: tabla de gestión de usuarios (bloquear/activar/eliminar). */
export default function AdminUsersTab({ adminUsers, currentUserId, onUpdateUserStatus, onDeleteUser }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <th className="p-4">Usuario</th>
                <th className="p-4">Email</th>
                <th className="p-4">Rol / Plan</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminUsers.length > 0 ? (
                adminUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs overflow-hidden">
                          {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : u.name?.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{u.email}</td>
                    <td className="p-4">
                      <p className="text-xs font-black uppercase text-slate-700">{u.role || "User"}</p>
                      {u.subscription?.plan && <p className="text-[10px] text-blue-600 font-bold uppercase">{u.subscription.plan.name}</p>}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${u.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {u.active ? "Activo" : "Bloqueado"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => onUpdateUserStatus(u.id, !u.active)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${u.active ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                      >
                        {u.active ? "Bloquear" : "Activar"}
                      </button>
                      {currentUserId !== u.id && (
                        <button
                          onClick={() => onDeleteUser(u.id)}
                          className="text-xs font-bold px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No hay usuarios.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
