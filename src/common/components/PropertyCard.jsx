import React from 'react';
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Maximize, Heart } from "lucide-react";

export default function PropertyCard({ property }) {
  if (!property) return null;

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
        <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full text-blue-600 hover:bg-white transition-colors">
          <Heart className="w-4 h-4" />
        </button>
      </div>
      <div className="p-6">
        <div className="text-blue-600 font-bold text-xl mb-1 mt-1">
          {property.status === 'alquiler' ? `$${property.price.toLocaleString()}/mes` : `$${property.price.toLocaleString()}`}
        </div>
        <h3 className="font-semibold text-lg mb-2 truncate">{property.title}</h3>
        <p className="text-slate-500 text-sm flex items-center gap-1 mb-6">
          <MapPin className="w-4 h-4" /> {property.location}
        </p>
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
