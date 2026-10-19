import React from 'react';
import { useMySearchAlerts, useDeleteSearchAlert } from '../hooks/useSearchAlerts';
import { Link } from 'react-router-dom';

export default function MySearchAlertsList() {
  const { data: alerts, isLoading } = useMySearchAlerts();
  const { mutate: deleteAlert } = useDeleteSearchAlert();

  if (isLoading) return <p className="text-sm text-slate-500 py-4">Cargando tus avisos...</p>;
  
  // 🛡️ Defensa extra por si llega algo raro
  const alertsArray = Array.isArray(alerts) ? alerts : [];

  if (alertsArray.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <p className="text-slate-500 mb-4">Todavía no creaste ningún aviso de búsqueda.</p>
        <Link to="/dashboard/search-alerts/create" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition">
          + Crear mi primer aviso
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {alertsArray.map((alert) => (
        <div key={alert.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full uppercase">
                {alert.operation === 'rent' ? 'Alquiler' : 'Venta'}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${alert.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {alert.is_active ? 'Activo' : 'Pausado'}
              </span>
            </div>
            <p className="font-bold text-slate-800">{alert.description || 'Sin descripción'}</p>
            <p className="text-sm text-slate-500 mt-1">
              {alert.price_currency} {alert.price_min || 0} - {alert.price_max || 'Sin límite'}
            </p>
            <p className="text-xs text-slate-400 mt-2">Creado el {alert.created_at}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
            <button onClick={() => { if(confirm('¿Eliminar aviso?')) deleteAlert(alert.id); }} className="text-red-600 text-sm font-semibold hover:underline">
              Eliminar aviso
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
