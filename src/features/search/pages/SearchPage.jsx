import React, { useEffect, useState, useMemo } from "react";
import { Search as SearchIcon, ChevronLeft, ChevronRight, ChevronDown, Loader2, Filter } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "../../../common/components/Layout";
import PropertyCard from "../../../common/components/PropertyCard";
import { useProperties } from "../../../hooks/useProperties";
import { useAgencies } from "../../../hooks/useAgencies";
import { usePropertyFormRefs } from "../../../hooks/usePropertyFormRefs";
import SearchFilters from "../components/SearchFilters";
import { readFilters, filtersToUrlParams, searchToExploreUrl } from "../search.helpers";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => readFilters(searchParams));
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { agencies } = useAgencies();
  const { propertyTypes, locations } = usePropertyFormRefs();

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // Sincroniza el draft cuando cambian los params (reset, navegación atrás).
  useEffect(() => {
    setForm(readFilters(searchParams));
  }, [searchParams]);

  // Filtros aplicados (committed) que alimentan la query.
  // `type` es passthrough de compat: enlaces viejos (HomePage) navegan con `?type=Casa`.
  const currentFilters = useMemo(() => {
    const f = readFilters(searchParams);
    return {
      ...f,
      type: searchParams.get("type") || "",
      page: parseInt(searchParams.get("page")) || 1,
    };
  }, [searchParams]);

  const page = currentFilters.page;
  const { data: properties, loading, error } = useProperties(currentFilters);

  const handleApplyFilters = () => {
    setSearchParams(filtersToUrlParams({ ...form, page: 1 }));
    setShowMobileFilters(false);
  };

  const handleReset = () => {
    setSearchParams({});
    setShowMobileFilters(false);
  };

  const handleSortChange = (value) => {
    setField("sort", value);
    const nextParams = Object.fromEntries(searchParams.entries());
    nextParams.sort = value;
    setSearchParams(nextParams);
  };

  const handlePageChange = (newPage) => {
    const nextParams = Object.fromEntries(searchParams.entries());
    nextParams.page = newPage;
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-12 py-12">
        <aside
          className={`fixed inset-y-0 left-0 z-[100] w-full md:w-80 bg-white shadow-2xl transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-72 lg:shadow-none lg:bg-transparent lg:z-auto ${
            showMobileFilters ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SearchFilters
            form={form}
            setField={setField}
            onApply={handleApplyFilters}
            onReset={handleReset}
            onClose={() => setShowMobileFilters(false)}
            onGoToMap={() => navigate(searchToExploreUrl(currentFilters))}
            agencies={agencies}
            propertyTypes={propertyTypes}
            locations={locations}
          />
        </aside>

        <section className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Propiedades Disponibles</h1>
              <p className="text-slate-500 mt-2">{loading ? "Buscando..." : `Mostrando página ${page}`}</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex-1 flex justify-center items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm"
              >
                <Filter className="w-4 h-4" /> Filtros
              </button>
              <div className="flex-1 md:flex-none flex items-center gap-2 md:gap-3 bg-white px-3 md:px-4 py-2.5 rounded-lg border border-slate-200 shadow-sm">
                <span className="hidden sm:inline text-sm font-medium text-slate-500 flex-shrink-0">Ordenar por:</span>
                <div className="relative flex-1 md:flex-none">
                  <select
                    value={currentFilters.sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none w-full bg-transparent border-none text-sm font-bold text-blue-600 focus:ring-0 cursor-pointer py-0 pl-1 pr-6 outline-none text-center sm:text-left"
                  >
                    <option value="recent">Más recientes</option>
                    <option value="price_asc">Precio: Menor a Mayor</option>
                    <option value="price_desc">Precio: Mayor a Menor</option>
                  </select>
                  <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600 pointer-events-none" />
                </div>
              </div>
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
                properties.map((prop) => <PropertyCard key={prop.id} property={prop} />)
              ) : (
                <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <div className="max-w-xs mx-auto">
                    <SearchIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No encontramos resultados</h3>
                    <p className="text-slate-500 text-sm">Intenta ajustar tus filtros o restablecer la búsqueda.</p>
                    <button onClick={handleReset} className="mt-6 text-blue-600 font-bold hover:underline">
                      Restablecer búsqueda
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && properties.length > 0 && (
            <div className="mt-20 flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-lg bg-blue-600 text-white font-bold text-sm cursor-default">{page}</button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={properties.length < 6}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
