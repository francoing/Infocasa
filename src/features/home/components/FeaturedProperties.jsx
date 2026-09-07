import React from "react";
import { Link } from "react-router-dom";
import PropertyCard from "../../../common/components/PropertyCard";
import Loader from "../../../common/components/Loader";

/** Grilla de propiedades destacadas (primeras 6). */
export default function FeaturedProperties({ properties = [], loading, error }) {
  const featured = properties.slice(0, 6);

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 w-full">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Propiedades Destacadas</h2>
          <p className="text-slate-500 mt-2">Propiedades de lujo seleccionadas por su excelencia.</p>
        </div>
        <Link to="/search" className="text-blue-600 font-semibold border-b-2 border-blue-600/20 pb-1 hover:border-blue-600 transition-all">
          Ver todas las propiedades
        </Link>
      </div>

      {loading ? (
        <Loader inline className="py-20" />
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          Error al cargar las propiedades.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.length > 0 ? (
            featured.map((prop) => <PropertyCard key={prop.id} property={prop} />)
          ) : (
            <p className="text-center col-span-full py-12 text-slate-500 font-medium italic">
              No se encontraron propiedades destacadas.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
