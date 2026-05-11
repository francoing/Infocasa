import React, { useEffect, useState, useMemo } from "react";
import { Search as SearchIcon, MapPin, SlidersHorizontal, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Layout from "../../../common/components/Layout";
import PropertyCard from "../../../common/components/PropertyCard";
import { useProperties } from "../../../hooks/useProperties";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Local filter states
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "Todos");
  const [sort, setSort] = useState(searchParams.get("sort") || "recent");

  // Memoize filters to avoid unnecessary re-renders in useProperties
  const currentFilters = useMemo(() => ({
    location: searchParams.get("location"),
    minPrice: searchParams.get("minPrice"),
    maxPrice: searchParams.get("maxPrice"),
    type: searchParams.get("type"),
    sort: searchParams.get("sort") || "recent"
  }), [searchParams]);

  const { data: properties, loading, error } = useProperties(currentFilters);

  const handleApplyFilters = () => {
    const params = {};
    if (location) params.location = location;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (selectedType !== "Todos") params.type = selectedType;
    params.sort = sort;
    setSearchParams(params);
  };

  const handleReset = () => {
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedType("Todos");
    setSort("recent");
    setSearchParams({});
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-12 py-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="lg:sticky lg:top-28 space-y-10 bg-slate-50 p-6 rounded-2xl border border-slate-100 lg:bg-transparent lg:p-0 lg:border-0 lg:rounded-none">
            <div>
              <div className="flex items-center justify-between lg:block mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Filtros</h2>
                <button 
                  onClick={handleReset}
                  className="text-xs font-bold text-blue-600 hover:underline lg:mt-2 lg:block"
                >
                  Restablecer todo
                </button>
              </div>
              <div className="space-y-8">
                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500 block">Ciudad / Ubicación</label>
                  <div className="relative">
                    <input 
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all outline-none" 
                      placeholder="Ej: Tigre" 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                    <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  </div>
                </div>
                
                {/* Price */}
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-slate-500 block">Rango de Precio</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-600 outline-none" 
                      placeholder="Mín" 
                      type="number" 
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <span className="text-slate-400">—</span>
                    <input 
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-600 outline-none" 
                      placeholder="Máx" 
                      type="number" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>

                {/* Property Type */}
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-slate-500 block">Tipo de Propiedad</label>
                  <div className="space-y-3">
                    {['Todos', 'Casa', 'Departamento'].map((type) => (
                      <label key={type} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="propType"
                          checked={selectedType === type}
                          onChange={() => setSelectedType(type)}
                          className="w-5 h-5 border-slate-300 text-blue-600 focus:ring-blue-600" 
                        />
                        <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleApplyFilters}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Grid */}
        <section className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Propiedades Disponibles</h1>
              <p className="text-slate-500 mt-2">
                {loading ? "Buscando..." : `Mostrando ${properties.length} propiedades encontradas`}
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-sm font-medium text-slate-500">Ordenar por:</span>
              <select 
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  const nextParams = Object.fromEntries(searchParams.entries());
                  nextParams.sort = e.target.value;
                  setSearchParams(nextParams);
                }}
                className="bg-transparent border-none text-sm font-bold text-blue-600 focus:ring-0 cursor-pointer p-0 pr-6 outline-none"
              >
                <option value="recent">Más recientes</option>
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-8">
              Hubo un error al cargar las propiedades.
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 opacity-20" />
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {properties.length > 0 ? (
                properties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <div className="max-w-xs mx-auto">
                    <SearchIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No encontramos resultados</h3>
                    <p className="text-slate-500 text-sm">Intenta ajustar tus filtros o restablecer la búsqueda.</p>
                    <button 
                      onClick={handleReset}
                      className="mt-6 text-blue-600 font-bold hover:underline"
                    >
                      Restablecer búsqueda
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pagination (Simplified) */}
          {!loading && properties.length > 0 && (
            <div className="mt-20 flex justify-center items-center gap-2">
              <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-30" disabled>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-lg bg-blue-600 text-white font-bold text-sm">1</button>
              <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-30" disabled>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
