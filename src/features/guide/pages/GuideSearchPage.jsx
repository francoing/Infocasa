import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import Loader from "@/common/components/Loader";
import Pagination from "@/common/components/Pagination";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useGuideCategories, useGuideSearch } from "@/hooks/useGuideDirectory";
import { activeFilterCount, readGuideFilters } from "@/hooks/guide.query";
import GuideFilters from "../components/GuideFilters";
import GuideListingCard from "../components/GuideListingCard";
import GuideSearchBar from "../components/GuideSearchBar";

/** `/guia/buscar` — resultados de la Guía. Los filtros viven en la URL (compartible). */
export default function GuideSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readGuideFilters(searchParams), [searchParams]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: categories = [] } = useGuideCategories();
  const { data, isLoading, isFetching, isError } = useGuideSearch(filters);

  const trade = categories.flatMap((c) => c.trades).find((t) => t.slug === filters.trade);
  const category = categories.find((c) => c.slug === filters.category);
  const heading = trade?.name || category?.name || (filters.q ? `“${filters.q}”` : "Toda la Guía");
  useDocumentMeta(`${heading} — InfoCasa Guía`, `Resultados de ${heading} en InfoCasa Guía.`);

  const apply = (next) => {
    setSearchParams(Object.fromEntries(Object.entries(next).map(([k, v]) => [k, String(v)])));
    setDrawerOpen(false);
  };
  const clear = () => apply(filters.q ? { q: filters.q } : {});
  const items = data?.items ?? [];
  const count = activeFilterCount(filters);

  const filtersPanel = <GuideFilters key={searchParams.toString()} filters={filters} categories={categories} onChange={apply} onClear={clear} />;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-[#ff0019]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6">
          <GuideSearchBar key={searchParams.toString()} compact initialQ={filters.q} initialWhere={filters.works_in} baseFilters={{ ...filters, q: undefined, works_in: undefined }} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="hidden lg:block bg-white rounded-2xl border border-slate-100 p-6 self-start">{filtersPanel}</aside>

        <section className="lg:col-span-3 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{heading}</h1>
              {data && <p className="text-sm text-slate-500">{data.meta.total} resultados{filters.works_in ? ` para ${filters.works_in}` : ""}</p>}
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filtros{count > 0 && ` (${count})`}
            </button>
          </div>

          {isLoading ? (
            <Loader inline className="py-20" />
          ) : isError ? (
            <p className="text-center text-slate-500 py-16">No pudimos cargar los resultados. Probá de nuevo en un rato.</p>
          ) : items.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <p className="font-bold text-slate-700">No encontramos publicaciones con esos filtros.</p>
              <button type="button" onClick={() => apply({})} className="mt-3 text-sm font-bold text-red-600 hover:underline">
                Ver toda la Guía
              </button>
            </div>
          ) : (
            <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 ${isFetching ? "opacity-60" : ""}`}>
              {items.map((listing) => (
                <GuideListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          <Pagination meta={data?.meta} itemLabel="publicaciones" onPageChange={(page) => apply({ ...filters, page })} />
        </section>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button type="button" aria-label="Cerrar filtros" onClick={() => setDrawerOpen(false)} className="absolute inset-0 bg-black/40" />
          <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm bg-white p-6 overflow-y-auto">
            <button type="button" onClick={() => setDrawerOpen(false)} className="absolute top-4 right-4 p-2" aria-label="Cerrar">
              <X className="w-5 h-5" />
            </button>
            {filtersPanel}
          </div>
        </div>
      )}
    </div>
  );
}
