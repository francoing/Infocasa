import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Maximize, Heart, Calendar, Car } from "lucide-react";
import { setPropertyFavorite } from "../../hooks/useFavorites";
import { useToast } from "../../hooks/useToast";

// --- Helpers puros (derivaciones fuera del JSX; bajan la complejidad del render) ---
const CONDITION_LABELS = { new: 'A Estrenar', under_construction: 'En Pozo', to_refurbish: 'A Refaccionar' };
const conditionBadge = (condition) =>
  condition && condition !== 'good' ? CONDITION_LABELS[condition] || null : null;

const symbol = (currency) => (currency === 'USD' ? 'USD' : '$');

const locationText = (property) => {
  if (property.address) return property.address;
  if (typeof property.location === 'string') return property.location;
  return [property.location?.neighborhood, property.location?.city].filter(Boolean).join(', ');
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' });
}

// --- Sub-componentes (cada uno con pocas ramas → bajo complexity) ---

function CardMedia({ property, isFavorited, loading, onFavorite }) {
  const condLabel = conditionBadge(property.condition);
  return (
    <div className="aspect-video relative overflow-hidden flex-shrink-0">
      <img
        src={property.imageUrl}
        alt={property.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute top-4 left-4 bg-blue-600 text-white px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
        {property.operation || property.status}
      </div>
      {condLabel && (
        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
          {condLabel}
        </div>
      )}
      <button
        onClick={onFavorite}
        disabled={loading}
        className={`absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full transition-colors z-20 ${
          isFavorited ? "text-rose-500 hover:bg-rose-100" : "text-blue-600 hover:bg-white"
        }`}
      >
        <Heart className={`w-4 h-4 ${isFavorited ? "fill-rose-500" : ""}`} />
      </button>
    </div>
  );
}

function CardPrice({ property }) {
  const hasExpenses = property.expenses?.amount && Number(property.expenses.amount) > 0;
  return (
    <div className="flex justify-between items-baseline mb-2">
      <div className="text-blue-600 font-extrabold text-2xl tracking-tight">
        {symbol(property.priceCurrency)} {property.price.toLocaleString()}
        {property.operationRaw === 'rent' && <span className="text-xs font-bold text-slate-500">/mes</span>}
      </div>
      {hasExpenses && (
        <span className="text-[10px] font-black text-slate-500 bg-slate-100 border border-slate-200/50 px-2 py-1 rounded-lg">
          + {symbol(property.expenses.currency)}{Number(property.expenses.amount).toLocaleString()} exp
        </span>
      )}
    </div>
  );
}

function CardTags({ property }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-4">
      {property.user && (
        <div className="text-[9px] font-black text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
          <span className="uppercase tracking-wider">Inmob: {property.user.name}</span>
        </div>
      )}
      {property.petsAllowed && (
        <span className="text-[9px] font-black uppercase tracking-wider text-green-700 bg-green-50 border border-green-100 px-2 py-1 rounded-lg">
          Mascotas OK
        </span>
      )}
      {property.professionalUse && (
        <span className="text-[9px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-100 px-2 py-1 rounded-lg">
          Apto Prof.
        </span>
      )}
    </div>
  );
}

function Feature({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
      <Icon className="w-3.5 h-3.5 text-slate-400" /> <span>{children}</span>
    </div>
  );
}

function CardFeatures({ property }) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100 text-slate-600 text-xs font-black">
      {property.bedrooms > 0 && <Feature icon={Bed}>{property.bedrooms} Dorm.</Feature>}
      {property.bathrooms > 0 && <Feature icon={Bath}>{property.bathrooms} Baño{property.bathrooms > 1 && 's'}</Feature>}
      {property.parkingSpaces > 0 && <Feature icon={Car}>{property.parkingSpaces} Coch.</Feature>}
      {property.area > 0 && <Feature icon={Maximize}>{property.area.toLocaleString()} m²</Feature>}
    </div>
  );
}

export default function PropertyCard({ property }) {
  // Hooks primero, siempre — nunca después de un return condicional (rules-of-hooks).
  const toast = useToast();
  const [isFavorited, setIsFavorited] = useState(property?.isFavorited || false);
  const [loading, setLoading] = useState(false);

  if (!property) return null;

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    try {
      setLoading(true);
      const next = !isFavorited;
      await setPropertyFavorite(property.id, next);
      setIsFavorited(next);
      toast[next ? "success" : "info"](next ? "Agregado a favoritos" : "Eliminado de favoritos");
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("Debes iniciar sesión para guardar favoritos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      to={`/property/${property.id}`}
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-all group flex flex-col h-full"
    >
      <CardMedia property={property} isFavorited={isFavorited} loading={loading} onFavorite={handleFavoriteClick} />
      <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          <CardPrice property={property} />
          <h3 className="font-bold text-slate-900 text-lg mb-1.5 truncate group-hover:text-blue-600 transition-colors">{property.title}</h3>
          <p className="text-slate-500 text-sm flex items-center gap-1 mb-2">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="truncate">{locationText(property)}</span>
          </p>
          <CardTags property={property} />
        </div>
        <div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mb-4">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Publicado {formatDate(property.publishedAt || property.createdAt)}</span>
          </div>
          <CardFeatures property={property} />
        </div>
      </div>
    </Link>
  );
}
