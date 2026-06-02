import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Maximize, Heart, Calendar } from "lucide-react";
import { api } from "../../api/api";
import { useToast } from "../../hooks/useToast";

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('es-AR', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

export default function PropertyCard({ property }) {
  if (!property) return null;

  const toast = useToast();
  const [isFavorited, setIsFavorited] = useState(property.isFavorited || false);
  const [loading, setLoading] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    try {
      setLoading(true);
      if (isFavorited) {
        await api.delete(`/properties/${property.id}/favorite`);
        setIsFavorited(false);
        toast.info("Eliminado de favoritos");
      } else {
        await api.post(`/properties/${property.id}/favorite`);
        setIsFavorited(true);
        toast.success("Agregado a favoritos");
      }
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
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-all group block"
    >
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={property.imageUrl} 
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-blue-600/90 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
          {property.status}
        </div>
        <button 
          onClick={handleFavoriteClick}
          disabled={loading}
          className={`absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full transition-colors z-20 ${
            isFavorited ? "text-rose-500 hover:bg-rose-100" : "text-blue-600 hover:bg-white"
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? "fill-rose-500" : ""}`} />
        </button>
      </div>
      <div className="p-6">
        <div className="text-blue-600 font-bold text-xl mb-1 mt-1">
          {property.status === 'alquiler' ? `$${property.price.toLocaleString()}/mes` : `$${property.price.toLocaleString()}`}
        </div>
        <h3 className="font-semibold text-lg mb-2 truncate">{property.title}</h3>
        <p className="text-slate-500 text-sm flex items-center gap-1 mb-2">
          <MapPin className="w-4 h-4" /> {property.location}
        </p>
        {property.user && (
          <div className="text-[11px] font-black text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 inline-flex items-center gap-1.5 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="uppercase tracking-wider">Inmobiliaria: {property.user.name}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mb-6">
          <Calendar className="w-3 h-3" />
          <span>Publicado {formatDate(property.publishedAt || property.createdAt)}</span>
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4" /> {property.bedrooms}
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4" /> {property.bathrooms}
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize className="w-4 h-4" /> {property.area?.toLocaleString()} m²
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
