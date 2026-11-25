import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useGuideCategories } from "@/hooks/useGuideDirectory";
import { useSaveGuideAdvertiser, useUploadGuideLogo } from "@/hooks/useGuideAdvertiser";
import { ADVERTISER_TYPES, SOCIAL_NETWORKS } from "@/hooks/guide.mappers";
import { advertiserToForm, firstErrors } from "@/hooks/guide.payloads";
import { Checkbox, GUIDE_PROVINCES, Select, TextArea, TextInput } from "./GuideFields";

/**
 * Alta / edición del perfil de anunciante (panel). Un perfil por cuenta, varios rubros.
 * En el alta exige aceptar los términos; CUIT/CUIL opcional (lo valida el backend).
 */
export default function GuideAdvertiserForm({ advertiser, onSaved }) {
  const creating = !advertiser;
  const toast = useToast();
  const [form, setForm] = useState(() => advertiserToForm(advertiser));
  const [errors, setErrors] = useState({});
  const { data: categories = [] } = useGuideCategories();
  const { save, isSaving } = useSaveGuideAdvertiser({ hasProfile: !creating });
  const { upload, isUploading } = useUploadGuideLogo();

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setSocial = (key) => (e) => setForm((f) => ({ ...f, social: { ...f.social, [key]: e.target.value } }));
  const toggleTrade = (id) =>
    setForm((f) => ({
      ...f,
      tradeIds: f.tradeIds.includes(id) ? f.tradeIds.filter((t) => t !== id) : [...f.tradeIds, id],
    }));

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const { advertiser: saved, message } = await save(form);
      toast.success(message || "Guardamos tu perfil.");
      onSaved?.(saved);
    } catch (err) {
      setErrors(firstErrors(err.errors));
      toast.error(err.message || "No pudimos guardar el perfil.");
    }
  };

  const onLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await upload(file);
      toast.success("Logo actualizado.");
    } catch (err) {
      toast.error(err.message || "No pudimos subir el logo.");
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-8">
      {creating && (
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5 text-sm text-amber-800">
          Creá tu perfil de anunciante para publicar gratis en InfoCasa Guía. Tu cuenta sigue funcionando igual para propiedades.
        </div>
      )}

      {!creating && (
        <div className="flex items-center gap-4">
          {advertiser.logoUrl ? (
            <img src={advertiser.logoUrl} alt="Logo" className="w-20 h-20 rounded-2xl object-cover border border-slate-100" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-slate-100" />
          )}
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-50">
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Cambiar logo
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onLogo} />
          </label>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Select label="Tipo de anunciante" required value={form.type} onChange={set("type")} options={ADVERTISER_TYPES} error={errors.type} />
        <TextInput label="Nombre comercial / razón social" required value={form.name} onChange={set("name")} error={errors.name} />
        <TextInput label="CUIT / CUIL" value={form.cuit} onChange={set("cuit")} error={errors.cuit} hint="Opcional. Ej: 20-12345678-6" />
        <TextInput label="Email de contacto" type="email" value={form.contactEmail} onChange={set("contactEmail")} error={errors.contact_email} hint="Si lo dejás vacío, las consultas llegan al email de tu cuenta." />
        <TextInput label="Teléfono" value={form.phone} onChange={set("phone")} error={errors.phone} />
        <TextInput label="WhatsApp" value={form.whatsapp} onChange={set("whatsapp")} error={errors.whatsapp} hint="Con código de país y área. Ej: 5493815551234" />
        <TextInput label="Sitio web" value={form.website} onChange={set("website")} error={errors.website} placeholder="https://" />
        <TextInput label="Domicilio comercial" value={form.address} onChange={set("address")} error={errors.address} />
        <Select label="Provincia" value={form.province} onChange={set("province")} options={GUIDE_PROVINCES} placeholder="Elegí" error={errors.province} />
        <TextInput label="Localidad" value={form.city} onChange={set("city")} error={errors.city} />
        <TextInput label="Barrio" value={form.neighborhood} onChange={set("neighborhood")} error={errors.neighborhood} />
      </div>

      <TextArea label="Descripción" value={form.description} onChange={set("description")} error={errors.description} placeholder="Contá a qué te dedicás, experiencia, matrícula, garantías…" />

      <fieldset className="flex flex-col gap-3">
        <legend className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
          Rubros <span className="text-red-500">*</span>
        </legend>
        {categories.map((c) => (
          <div key={c.id}>
            <p className="text-sm font-bold text-slate-700 mb-2">{c.name}</p>
            <div className="flex flex-wrap gap-2">
              {c.trades.map((t) => {
                const on = form.tradeIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTrade(t.id)}
                    aria-pressed={on}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${on ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {(errors.trade_ids || errors["trade_ids.0"]) && (
          <span className="text-xs font-semibold text-red-600">{errors.trade_ids || errors["trade_ids.0"]}</span>
        )}
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SOCIAL_NETWORKS.map((n) => (
          <TextInput key={n.key} label={n.label} value={form.social[n.key] ?? ""} onChange={setSocial(n.key)} placeholder="@usuario o link" />
        ))}
      </div>

      {creating && (
        <div className="flex flex-col gap-1">
          <Checkbox
            checked={form.acceptTerms}
            onChange={(v) => setForm((f) => ({ ...f, acceptTerms: v }))}
            label={
              <span>
                Acepto los <Link to="/terminos-y-condiciones" target="_blank" className="text-blue-600 underline">términos y condiciones</Link> de InfoCasa Guía
              </span>
            }
          />
          {errors.accept_terms && <span className="text-xs font-semibold text-red-600">{errors.accept_terms}</span>}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving || (creating && !form.acceptTerms)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm disabled:opacity-50 transition-all"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          {creating ? "Crear mi perfil" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
