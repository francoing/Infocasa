import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Filter, List, MapPin, Loader2 } from "lucide-react";
import Layout from "../../../common/components/Layout";
import ProvinceMap from "../../home/components/ProvinceMap";
import SearchFilters from "../../search/components/SearchFilters";
import { useProperties } from "../../../hooks/useProperties";
import { useAgencies } from "../../../hooks/useAgencies";
import { usePropertyFormRefs } from "../../../hooks/usePropertyFormRefs";
import { useGeoapifyGeocode } from "../../../hooks/useGeoapifyGeocode";
import { readFilters, filtersToUrlParams } from "../../search/search.helpers";
import { exploreToSearchUrl, pathOperationToApi } from "../explore.helpers";

// Foco del mapa (zoom) desde coords en la URL. El texto se geocodifica aparte si faltan.
const readFocus = (searchParams) => {
  const lat = parseFloat(searchParams.get("lat"));
  const lng = parseFloat(searchParams.get("lng"));
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  const bboxRaw = (searchParams.get("bbox") || "").split(",").map(Number);
  const bbox = bboxRaw.length === 4 && bboxRaw.every((n) => !Number.isNaN(n)) ? bboxRaw : null;
  return { lat, lng, bbox };
};

// Filtros del mapa: query params (paridad con /search). Si la URL no trae `operation`,
// se siembra desde el segmento del path viejo `/explore/:operation` (enlaces de compat).
const readExploreFilters = (searchParams, pathOperation) => {
  const f = readFilters(searchParams);
  if (!searchParams.has("operation") && pathOperation) {
    f.operation = pathOperationToApi(pathOperation);
  }
  return f;
};

const OPERATION_LABEL = { sale: "Comprá", rent: "Alquilá", temporary_rent: "Alquiler temporario" };

export default function ExplorePage() {
  const { operation: pathOperation } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState(() => readExploreFilters(searchParams, pathOperation));
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    setForm(readExploreFilters(searchParams, pathOperation));
  }, [searchParams, pathOperation]);

  const { agencies } = useAgencies();
  const { propertyTypes, locations } = usePropertyFormRefs();

  const currentFilters = useMemo(
    () => readExploreFilters(searchParams, pathOperation),
    [searchParams, pathOperation]
  );

  // Marcadores del mapa: mismos filtros que el listado.
  const { data: properties, loading, error } = useProperties(currentFilters);

  // Zoom: coords en la URL, o geocodificando la ubicación si vienen solo por texto.
  const locationQuery = searchParams.get("location") || "";
  const focus = useMemo(() => readFocus(searchParams), [searchParams]);
  const geocodedFocus = useGeoapifyGeocode(locationQuery, !focus && locationQuery.trim().length >= 2);
  const effectiveFocus = focus || geocodedFocus;

  // Aplicar/Reset NAVEGAN a /explore (sin el segmento de compat) → operación 100% por query,
  // así "Todas" (sin `operation`) muestra todas las operaciones.
  const handleApplyFilters = () => {
    const qs = new URLSearchParams(filtersToUrlParams({ ...form })).toString();
    navigate(qs ? `/explore?${qs}` : "/explore");
    setShowMobileFilters(false);
  };

  const handleReset = () => {
    navigate("/explore");
    setShowMobileFilters(false);
  };

  const handlePropertyClick = (propertyId) => navigate(`/property/${propertyId}`);

  const opLabel = OPERATION_LABEL[currentFilters.operation] || "Explorá";

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
            onCrossView={(intent) => navigate(exploreToSearchUrl(intent))}
            crossViewLabel="Ver listado"
            crossViewIcon={List}
            agencies={agencies}
            propertyTypes={propertyTypes}
            locations={locations}
          />
        </aside>

        <section className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{opLabel} en el mapa</h1>
              <p className="text-slate-500 mt-2">
                {loading ? "Buscando…" : `${properties.length} propiedad${properties.length === 1 ? "" : "es"} en la zona`}
              </p>
            </div>
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden w-full flex justify-center items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm"
            >
              <Filter className="w-4 h-4" /> Filtros
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-8">
              Hubo un error al cargar las propiedades.
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-[350px] md:h-[420px] bg-slate-50 rounded-xl border border-slate-200">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 opacity-20" />
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[350px] md:h-[420px] bg-slate-50 rounded-xl border border-slate-200 text-center px-6">
              <MapPin className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm text-slate-500 font-medium">No hay propiedades con estos filtros.</p>
              <button onClick={handleReset} className="mt-4 text-blue-600 font-bold hover:underline text-sm">
                Restablecer búsqueda
              </button>
            </div>
          ) : (
            <ProvinceMap
              properties={properties}
              focus={effectiveFocus}
              onPropertyClick={handlePropertyClick}
            />
          )}
        </section>
      </div>
    </Layout>
  );
}
