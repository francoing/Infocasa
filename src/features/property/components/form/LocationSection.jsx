import React, { useMemo } from "react";
import { MapPin, Lock } from "lucide-react";
import MapLocationSelector from "../MapLocationSelector";

const LABEL = "text-xs font-black text-slate-400 uppercase tracking-widest ml-1";
const SELECT = "w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold bg-white disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors";

/** Centroide de las ubicaciones del área elegida, para reencuadrar el mapa. */
const areaCenter = (locs) => {
  const pts = locs.filter((l) => l.latitude != null && l.longitude != null);
  if (pts.length === 0) return { lat: null, lng: null };
  const sum = pts.reduce((a, l) => ({ lat: a.lat + parseFloat(l.latitude), lng: a.lng + parseFloat(l.longitude) }), { lat: 0, lng: 0 });
  return { lat: sum.lat / pts.length, lng: sum.lng / pts.length };
};

export default function LocationSection({
  formData, handleChange,
  selectedProvince, onProvinceChange, selectedDepartment, onDepartmentChange,
  provinces, departments, filteredLocations, onMapLocationChange,
}) {
  const hasCoords =
    formData.latitude !== null && formData.latitude !== undefined &&
    formData.longitude !== null && formData.longitude !== undefined;

  // Reencuadrar el mapa al área elegida solo cuando hay provincia + departamento.
  const focus = useMemo(
    () => (selectedProvince && selectedDepartment ? areaCenter(filteredLocations) : { lat: null, lng: null }),
    [selectedProvince, selectedDepartment, filteredLocations],
  );

  return (
    <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-5 h-5 text-blue-600" />
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Ubicación y Dirección</h3>
      </div>

      <div className="space-y-4">
        {/* PROVINCIA */}
        <div>
          <label className={LABEL}>1. Provincia</label>
          <select 
            required 
            value={selectedProvince} 
            onChange={onProvinceChange} 
            className={SELECT}
          >
            <option value="">Selecciona provincia...</option>
            {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* DEPARTAMENTO */}
        <div>
          <label className={LABEL}>2. Departamento</label>
          <select 
            required 
            value={selectedDepartment} 
            onChange={onDepartmentChange} 
            className={SELECT}
            disabled={!selectedProvince}
          >
            <option value="">{selectedProvince ? "Selecciona departamento..." : "Primero elegí una provincia"}</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* UBICACIÓN (Barrio/Ciudad) */}
        <div>
          <label className={LABEL}>3. Ubicación (Barrio / Ciudad)</label>
          <select 
            required 
            name="location_id" 
            value={formData.location_id} 
            onChange={handleChange} 
            className={SELECT}
            disabled={!selectedDepartment}
          >
            <option value="">{selectedDepartment ? "Selecciona ubicación..." : "Primero elegí un departamento"}</option>
            {filteredLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.neighborhood}, {loc.city}</option>
            ))}
          </select>
        </div>
      </div>

      {/* DIRECCIÓN Y MAPA */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex justify-between items-center">
          <label className={LABEL}>Dirección Exacta y Mapa</label>
          {hasCoords && (
            <span className="text-xs font-bold text-blue-600">
              {Number(formData.latitude).toFixed(5)}, {Number(formData.longitude).toFixed(5)}
            </span>
          )}
        </div>
        
        <MapLocationSelector
          latitude={formData.latitude}
          longitude={formData.longitude}
          address={formData.address}
          province={selectedProvince}
          department={selectedDepartment}
          focusLat={focus.lat}
          focusLng={focus.lng}
          onChange={onMapLocationChange}
        />
        <p className="text-[10px] text-slate-400 italic">
          Usá el buscador de arriba para escribir la dirección y el mapa se moverá automáticamente.
        </p>
      </div>

      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <input
          type="checkbox"
          id="showExactAddress"
          name="showExactAddress"
          checked={formData.showExactAddress}
          onChange={handleChange}
          className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
        />
        <label htmlFor="showExactAddress" className="text-sm font-bold text-slate-700 cursor-pointer selection:bg-transparent select-none">
          Mostrar dirección exacta en la web
        </label>
      </div>
    </section>
  );
}
