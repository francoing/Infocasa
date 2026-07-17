import React from "react";
import { Link } from "react-router-dom";
import { MapPin, ExternalLink, Trash2 } from "lucide-react";

const EmptyState = ({ children }) => (
  <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
    <p className="text-slate-500">{children}</p>
  </div>
);

/** Tab de favoritos guardados (rol comprador). */
export default function FavoritesTab({ favorites, onRemoveFavorite }) {
  if (!favorites || favorites.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <EmptyState>No tienes propiedades favoritas guardadas todavía.</EmptyState>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {favorites.map((prop) => (
          <div key={prop.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-32 h-24 rounded-xl overflow-hidden flex-shrink-0">
                <img src={prop.imageUrl} alt={prop.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-lg truncate">{prop.title}</h3>
                </div>
                <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4 text-slate-400" /> {prop.location}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <p className="font-black text-slate-900">USD {prop.price.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <Link
                  to={`/property/${prop.id}`}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95"
                  target="_blank"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver Propiedad
                </Link>
                <button
                  onClick={() => onRemoveFavorite(prop.id)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95"
                  title="Quitar de Favoritos"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
