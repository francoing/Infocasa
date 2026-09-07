import React from "react";
import { Bed, Bath, Maximize, Home } from "lucide-react";

const SpecItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="p-3.5 bg-white text-blue-600 rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-lg font-black text-slate-900 capitalize">{value}</p>
    </div>
  </div>
);

/** Specs rápidos de la propiedad (dormitorios, baños, superficie, tipo). */
export default function PropertySpecs({ property }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
      <SpecItem icon={Bed} label="Dormitorios" value={property.bedrooms} />
      <SpecItem icon={Bath} label="Baños" value={property.bathrooms} />
      <SpecItem icon={Maximize} label="Superficie" value={`${property.area} m²`} />
      <SpecItem icon={Home} label="Tipo" value={property.type} />
    </div>
  );
}
