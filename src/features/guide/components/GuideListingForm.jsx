import React from "react";
import { SCHEDULE_DAYS, SOCIAL_NETWORKS } from "@/hooks/guide.mappers";
import MapLocationSelector from "@/features/property/components/MapLocationSelector";
import { Checkbox, GUIDE_PROVINCES, Select, TextArea, TextInput } from "./GuideFields";

const Section = ({ title, hint, children }) => (
  <section className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-5">
    <div>
      <h2 className="font-bold text-slate-900">{title}</h2>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
    {children}
  </section>
);

/**
 * Campos de la publicación (controlados). `photos` = slot para el gestor de fotos.
 * `advertiser` sirve para mostrar qué contacto se hereda si los campos quedan vacíos.
 */
export default function GuideListingForm({ form, setForm, errors = {}, categories = [], advertiser, photos }) {
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setBool = (key) => (v) => setForm((f) => ({ ...f, [key]: v }));
  const setSchedule = (day) => (e) => setForm((f) => ({ ...f, schedule: { ...f.schedule, [day]: e.target.value } }));
  const setSocial = (key) => (e) => setForm((f) => ({ ...f, social: { ...f.social, [key]: e.target.value } }));

  const tradeOptions = categories.flatMap((c) =>
    c.trades.filter((t) => t.active).map((t) => ({ value: String(t.id), label: `${c.name} · ${t.name}` }))
  );
  const hasCoords = form.latitude != null && form.longitude != null && form.latitude !== "" && form.longitude !== "";
  const inherit = (value) => (value ? `Vacío = usa el de tu perfil (${value})` : undefined);

  return (
    <div className="flex flex-col gap-6">
      <Section title="Qué ofrecés">
        <Select label="Rubro" required value={form.tradeId} onChange={set("tradeId")} placeholder="Elegí un rubro" options={tradeOptions} error={errors.trade_id} />
        <TextInput label="Título" required value={form.title} onChange={set("title")} error={errors.title} placeholder="Ej: Electricista matriculado — urgencias 24 hs" maxLength={150} />
        <TextArea label="Descripción" required rows={6} value={form.description} onChange={set("description")} error={errors.description} placeholder="Servicios, productos, experiencia, garantías, formas de pago…" />
      </Section>

      <Section title="Fotos y video">
        {photos}
        <TextInput label="Video (link de YouTube o Vimeo)" value={form.videoUrl} onChange={set("videoUrl")} error={errors.video_url} placeholder="https://youtube.com/..." />
      </Section>

      <Section title="Dónde trabajás">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Select label="Provincia" value={form.province} onChange={set("province")} options={GUIDE_PROVINCES} placeholder="Elegí" error={errors.province} />
          <TextInput label="Localidad" value={form.city} onChange={set("city")} error={errors.city} />
          <TextInput label="Barrio / zona" value={form.neighborhood} onChange={set("neighborhood")} error={errors.neighborhood} />
          <TextInput label="Dirección" value={form.address} onChange={set("address")} error={errors.address} />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ubicación en el mapa (opcional)</span>
            {hasCoords && (
              <button type="button" onClick={() => setForm((f) => ({ ...f, latitude: null, longitude: null }))} className="text-xs font-bold text-red-600 hover:underline">
                Quitar ubicación
              </button>
            )}
          </div>
          <MapLocationSelector
            latitude={hasCoords ? Number(form.latitude) : null}
            longitude={hasCoords ? Number(form.longitude) : null}
            address=""
            province={form.province}
            onChange={({ latitude, longitude }) => setForm((f) => ({ ...f, latitude, longitude }))}
          />
          <p className="text-xs text-slate-400">Marcá el punto en el mapa: así te encuentran con el filtro “Cerca mío”.</p>
        </div>
        <Select
          label="Zona de cobertura"
          value={form.coverageType}
          onChange={set("coverageType")}
          options={[
            { value: "cities", label: "Mi localidad y las que agregue" },
            { value: "province", label: "Toda la provincia" },
          ]}
        />
        {form.coverageType !== "province" && (
          <TextInput label="Otras localidades donde trabajás" value={form.coverageCities} onChange={set("coverageCities")} error={errors.coverage_cities} hint="Separadas por coma. Ej: Yerba Buena, Tafí Viejo, Lules" />
        )}
        <div className="flex flex-wrap gap-6">
          <Checkbox label="Atención a domicilio" checked={form.homeService} onChange={setBool("homeService")} />
          <Checkbox label="Tengo local físico" checked={form.hasStore} onChange={setBool("hasStore")} />
          {form.hasStore && <Checkbox label="Atiendo solo en el local" checked={form.storeOnly} onChange={setBool("storeOnly")} />}
        </div>
      </Section>

      <Section title="Horarios" hint="Opcional. Ej: 9 a 13 y 17 a 20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SCHEDULE_DAYS.map((d) => (
            <TextInput key={d.key} label={d.label} value={form.schedule?.[d.key] ?? ""} onChange={setSchedule(d.key)} maxLength={100} />
          ))}
        </div>
      </Section>

      <Section title="Contacto de esta publicación" hint="Si lo dejás vacío se usa el contacto de tu perfil.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TextInput label="WhatsApp" value={form.whatsapp} onChange={set("whatsapp")} error={errors.whatsapp} hint={inherit(advertiser?.whatsapp)} />
          <TextInput label="Teléfono" value={form.phone} onChange={set("phone")} error={errors.phone} hint={inherit(advertiser?.phone)} />
          <TextInput label="Email" type="email" value={form.contactEmail} onChange={set("contactEmail")} error={errors.contact_email} hint={inherit(advertiser?.contactEmail)} />
          <TextInput label="Sitio web" value={form.website} onChange={set("website")} error={errors.website} hint={inherit(advertiser?.website)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SOCIAL_NETWORKS.map((n) => (
            <TextInput key={n.key} label={n.label} value={form.social?.[n.key] ?? ""} onChange={setSocial(n.key)} placeholder="@usuario o link" />
          ))}
        </div>
      </Section>
    </div>
  );
}
