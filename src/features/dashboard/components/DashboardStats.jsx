import React from "react";
import { Home, MessageSquare, Heart } from "lucide-react";
import PlanStatusCard from "@/common/components/PlanStatusCard";

const StatCard = ({ icon, iconClass, label, value }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className={`p-4 rounded-2xl ${iconClass}`}>{icon}</div>
    <div>
      <span className="text-slate-500 font-medium block">{label}</span>
      <div className="text-3xl font-black text-slate-900 mt-1">{value}</div>
    </div>
  </div>
);

/** Fila de stats del dashboard: variante comprador (favoritos/consultas) vs vendedor (plan + totales).
 *  El admin no publica ni gestiona planes → no ve esta fila (plan/publicación no aplican). */
export default function DashboardStats({ isBuyer, isAdmin, favorites, sentLeads, userPlan, properties, leads, onUpgrade }) {
  if (isAdmin) return null;

  if (isBuyer) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <StatCard
          icon={<Heart className="w-8 h-8 fill-rose-500 text-rose-600" />}
          iconClass="bg-rose-50 text-rose-600"
          label="Favoritos Guardados"
          value={favorites.length}
        />
        <StatCard
          icon={<MessageSquare className="w-8 h-8" />}
          iconClass="bg-blue-50 text-blue-600"
          label="Consultas Realizadas"
          value={sentLeads.length}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
      <div className="lg:col-span-4">
        {userPlan ? (
          <PlanStatusCard plan={userPlan} usage={properties.length} limit={userPlan.details.limit} onUpgrade={onUpgrade} />
        ) : (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tu Plan Actual</h4>
            <div className="text-lg font-black text-red-500 uppercase">Sin Plan Activo</div>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">Necesitas un plan de publicación activo para poder cargar inmuebles y recibir consultas.</p>
            <button
              onClick={onUpgrade}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-xs active:scale-95"
            >
              Activar Plan ahora
            </button>
          </div>
        )}
      </div>
      <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Home className="w-6 h-6" /></div>
            <span className="text-slate-500 font-medium">Propiedades Totales</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{properties.length}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl"><MessageSquare className="w-6 h-6" /></div>
            <span className="text-slate-500 font-medium">Consultas Recibidas</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{leads.length}</div>
        </div>
      </div>
    </div>
  );
}
