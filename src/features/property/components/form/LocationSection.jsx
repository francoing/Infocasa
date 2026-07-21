import React from "react";
import { MapPin } from "lucide-react";
import MapLocationSelector from "../MapLocationSelector";

const LABEL = "text-xs font-black text-slate-400 uppercase tracking-widest ml-1";
const SELECT = "w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold bg-white";

/** Sección "Ubicación y Dirección": cascada provincia→depto→ubicación/zona, dirección y mapa. */
export default function LocationSection({
  formData, handleChange,
  selectedProvince, onProvinceChange, selectedDepartment, onDepartmentChange,
  provinces, departments, filteredLocations, zones, onMapLocationChange,
}) {
  const hasCoords =
    formData.latitude !== null && formData.latitude !== undefined &&
    formData.longitude !== null && formData.longitude !== undefined;

  return (
    <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-5 h-5 text-blue-600" />
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Ubicación y Dirección</h3>
      </div>

      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mb-2">
          <label className={LABEL}>Provincia</label>
          <label className={LABEL}>Departamento</label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <select required value={selectedProvince} onChange={onProvinceChange} className={SELECT}>
            <option value="">Selecciona provincia...</option>
            {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select required value={selectedDepartment} onChange={onDepartmentChange} className={SELECT}>
            <option value="">Selecciona departamento...</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mb-2">
          <label className={LABEL}>Ubicación</label>
          <label className={LABEL}>Zona</label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <select required name="location_id" value={formData.location_id} onChange={handleChange} className={SELECT}>
            <option value="">Selecciona ubicación...</option>
            {filteredLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.neighborhood}, {loc.city}</option>
            ))}
          </select>
          <select required name="zone_id" value={formData.zone_id} onChange={handleChange} className={SELECT}>
            <option value="">Selecciona zona...</option>
            {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className={LABEL}>Dirección Escrita</label>
        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-600 outline-none font-bold"
          placeholder="Ej: Av. Aconquija 1200, Yerba Buena"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className={LABEL}>Ubicación en el mapa</label>
          {hasCoords && (
            <span className="text-xs font-bold text-blue-600">
              {Number(formData.latitude).toFixed(5)}, {Number(formData.longitude).toFixed(5)}
            </span>
          )}
        </div>
        <MapLocationSelector latitude={formData.latitude} longitude={formData.longitude} address={formData.address} onChange={onMapLocationChange} />
        <p className="text-[10px] text-slate-400 italic">Haz clic en el mapa para marcar la ubicación exacta de la propiedad.</p>
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
