import React, { useState } from "react";
import { X, MapPin } from "lucide-react";
import LocationAutocomplete from "./LocationAutocomplete";
import { deriveLocationOptions, CONDITION_OPTIONS, OPERATION_OPTIONS } from "../search.helpers";

const selectCls =
  "w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 focus:border-blue-600 outline-none cursor-pointer";
const inputCls =
  "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-600 outline-none";

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-500 block">{label}</label>
      {children}
    </div>
  );
}

/** Select de mínimo (ambientes/dormitorios/cocheras): "Cualquiera" + 1..max con sufijo "+". */
function MinSelect({ label, value, onChange, max }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
        <option value="">Cualquiera</option>
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}
            {n === max ? "+" : ""}
          </option>
        ))}
      </select>
    </Field>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
      />
      <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
        {label}
      </span>
    </label>
  );
}

/**
 * Barra lateral de filtros de búsqueda. `form` es el draft; `setField(key, value)` lo muta.
 * Datos de referencia (agencies, propertyTypes, locations) vienen de la capa de datos.
 */
export default function SearchFilters({
  form,
  setField,
  onApply,
  onReset,
  onClose,
  onGoToMap,
  agencies = [],
  propertyTypes = [],
  locations = [],
}) {
  const { provinces, departments } = deriveLocationOptions(locations, form.province);

  // Coords de la última sugerencia elegida en el autocomplete (para el zoom del mapa).
  // Guardamos también el texto: si el usuario edita la ubicación luego de elegir, dejan
  // de coincidir y descartamos las coords (evita mandar coords que ya no corresponden).
  const [selectedPlace, setSelectedPlace] = useState(null);
  const handlePickLocation = (s) =>
    setSelectedPlace({ text: s.city || s.state || s.value, lat: s.lat, lng: s.lon, bbox: s.bbox });

  const handleGoToMap = () => {
    const coordsMatch = selectedPlace && selectedPlace.text === form.location;
    onGoToMap({
      ...form,
      lat: coordsMatch ? selectedPlace.lat : undefined,
      lng: coordsMatch ? selectedPlace.lng : undefined,
      bbox: coordsMatch ? selectedPlace.bbox : undefined,
    });
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto lg:sticky lg:top-28 lg:overflow-visible bg-slate-50 lg:bg-transparent rounded-none lg:border-0 lg:p-0">
      <div className="flex justify-between items-center lg:hidden mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Filtros</h2>
        <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div>
        <h2 className="hidden lg:block text-2xl font-bold text-slate-900 mb-4">Filtros</h2>

        {/* Cruce al mapa conservando la operación de la búsqueda actual. */}
        {onGoToMap && (
          <button
            type="button"
            onClick={handleGoToMap}
            className="w-full flex items-center justify-center gap-2 mb-4 bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-all"
          >
            <MapPin className="w-4 h-4" /> Ver en el mapa
          </button>
        )}

        <div className="mb-6">
          <button onClick={onReset} className="text-sm font-bold text-blue-600 hover:underline">
            Restablecer búsqueda
          </button>
        </div>

        <div className="space-y-8">
          <Field label="Operación">
            <select
              value={form.operation}
              onChange={(e) => setField("operation", e.target.value)}
              className={selectCls}
            >
              {OPERATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <LocationAutocomplete
            value={form.location}
            onChange={(v) => setField("location", v)}
            onPick={handlePickLocation}
          />

          {provinces.length > 0 && (
            <Field label="Provincia">
              <select
                value={form.province}
                onChange={(e) => {
                  setField("province", e.target.value);
                  setField("department", "");
                }}
                className={selectCls}
              >
                <option value="">Todas las provincias</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {departments.length > 0 && (
            <Field label="Departamento / Partido">
              <select
                value={form.department}
                onChange={(e) => setField("department", e.target.value)}
                className={selectCls}
              >
                <option value="">Todos</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Rango de Precio">
            {/* Moneda nativa (sin conversión). "Automática" deja que el backend decida por operación. */}
            <select value={form.currency} onChange={(e) => setField("currency", e.target.value)} className={selectCls}>
              <option value="">Moneda: automática</option>
              <option value="USD">USD (dólares)</option>
              <option value="ARS">ARS (pesos)</option>
            </select>
            <div className="flex gap-4 items-center pt-2">
              <input
                className={inputCls}
                placeholder="Mín"
                type="number"
                value={form.minPrice}
                onChange={(e) => setField("minPrice", e.target.value)}
              />
              <span className="text-slate-400">—</span>
              <input
                className={inputCls}
                placeholder="Máx"
                type="number"
                value={form.maxPrice}
                onChange={(e) => setField("maxPrice", e.target.value)}
              />
            </div>
          </Field>

          <Field label="Tipo de Propiedad">
            <select
              value={form.propertyTypeId}
              onChange={(e) => setField("propertyTypeId", e.target.value)}
              className={selectCls}
            >
              <option value="">Todos los tipos</option>
              {propertyTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>

          <MinSelect label="Ambientes (mín.)" value={form.roomsMin} onChange={(v) => setField("roomsMin", v)} max={5} />
          <MinSelect
            label="Dormitorios (mín.)"
            value={form.bedroomsMin}
            onChange={(v) => setField("bedroomsMin", v)}
            max={5}
          />
          <MinSelect label="Cocheras (mín.)" value={form.parkingMin} onChange={(v) => setField("parkingMin", v)} max={3} />

          <Field label="Condición">
            <select value={form.condition} onChange={(e) => setField("condition", e.target.value)} className={selectCls}>
              {CONDITION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="space-y-3">
            <Checkbox label="Acepta mascotas" checked={form.petsAllowed} onChange={(v) => setField("petsAllowed", v)} />
            <Checkbox
              label="Apto uso profesional"
              checked={form.professionalUse}
              onChange={(v) => setField("professionalUse", v)}
            />
          </div>

          <Field label="Inmobiliaria">
            <select value={form.agencyId} onChange={(e) => setField("agencyId", e.target.value)} className={selectCls}>
              <option value="">Todas las inmobiliarias</option>
              {agencies.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>

          <button
            onClick={onApply}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}
