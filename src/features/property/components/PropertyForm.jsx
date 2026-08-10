import React from "react";
import { Camera, Loader2, Save } from "lucide-react";
import Loader from "../../../common/components/Loader";
import ImageUploader from "./ImageUploader";
import { usePropertyForm } from "../../../hooks/usePropertyForm";
import MainInfoSection from "./form/MainInfoSection";
import TechnicalDetailsSection from "./form/TechnicalDetailsSection";
import ConditionSection from "./form/ConditionSection";
import LocationSection from "./form/LocationSection";
import ExpensesSection from "./form/ExpensesSection";
import CertificationSection from "./form/CertificationSection";
import AmenitiesSection from "./form/AmenitiesSection";
import PublicationTypeSelector from "./form/PublicationTypeSelector";

export default function PropertyForm({ initialData = null, onSubmit, onCancel, loading = false, userPlan = null }) {
  const form = usePropertyForm({ initialData, onSubmit });

  if (form.loadingRefs) {
    return <Loader inline className="p-20 bg-white rounded-3xl border border-slate-200" />;
  }

  const { formData, handleChange } = form;

  return (
    <form onSubmit={form.handleSubmit} className="space-y-10">
      {/* Fotos */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Camera className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Fotos de la propiedad</h3>
        </div>
        <ImageUploader images={formData.gallery} onChange={form.handleImagesChange} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Columna izquierda: información y detalles técnicos */}
        <div className="space-y-10">
          <MainInfoSection formData={formData} handleChange={handleChange} propertyTypes={form.propertyTypes} />
          <TechnicalDetailsSection formData={formData} handleChange={handleChange} />
          <ConditionSection formData={formData} handleChange={handleChange} />
        </div>

        {/* Columna derecha: ubicación, gastos y servicios */}
        <div className="space-y-10">
          <LocationSection
            formData={formData}
            handleChange={handleChange}
            selectedProvince={form.selectedProvince}
            onProvinceChange={form.handleProvinceChange}
            selectedDepartment={form.selectedDepartment}
            onDepartmentChange={form.handleDepartmentChange}
            provinces={form.provinces}
            departments={form.departments}
            filteredLocations={form.filteredLocations}
            zones={form.zones}
            onMapLocationChange={form.handleMapLocationChange}
          />
          <ExpensesSection formData={formData} handleChange={handleChange} />
          {form.isTempRent && (
            <CertificationSection
              formData={formData}
              formError={form.formError}
              onCertDocChange={form.handleCertDocChange}
              onClearCertDoc={form.clearCertDoc}
            />
          )}
          <AmenitiesSection
            availableFeatures={form.availableFeatures}
            features={formData.features}
            onFeatureToggle={form.handleFeatureToggle}
            loading={form.loadingRefs}
          />
        </div>
      </div>

      {/* Tipo de publicación — solo al crear */}
      {!initialData && (
        <PublicationTypeSelector userPlan={userPlan} value={formData.publication_type} onChange={form.setPublicationType} />
      )}

      {/* Acciones */}
      <div className="flex flex-col md:flex-row justify-end gap-6 pt-10 border-t border-slate-200">
        <button type="button" onClick={onCancel} className="px-10 py-5 rounded-3xl font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest text-sm">Cancelar</button>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-12 py-5 rounded-3xl font-black text-lg hover:bg-blue-700 shadow-2xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-6 h-6" /> Guardar Publicación</>}
        </button>
      </div>
    </form>
  );
}
