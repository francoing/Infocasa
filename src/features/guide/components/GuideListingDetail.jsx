import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Home, MapPin, Store } from "lucide-react";
import { SCHEDULE_DAYS, coverageText, videoEmbedUrl } from "@/hooks/guide.mappers";

/**
 * Cuerpo de la ficha de una publicación (galería, datos, cobertura, horarios, video).
 * Lo usan la ficha pública y la vista previa del formulario. `aside` = contacto/consulta.
 */
export default function GuideListingDetail({ listing, aside, preview = false }) {
  const [active, setActive] = useState(0);
  const photos = listing.photos ?? [];
  const embed = videoEmbedUrl(listing.videoUrl);
  const schedule = SCHEDULE_DAYS.filter((d) => listing.schedule?.[d.key]);
  const advertiser = listing.advertiser;
  const place = [listing.neighborhood, listing.city, listing.province].filter(Boolean).join(", ");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 flex flex-col gap-6 min-w-0">
        {photos.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100">
              <img src={photos[active]?.url} alt={listing.title} className="w-full h-full object-cover" />
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {photos.map((p, i) => (
                  <button
                    key={p.id ?? p.url}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`w-20 h-16 shrink-0 rounded-lg overflow-hidden border-2 ${i === active ? "border-red-600" : "border-transparent"}`}
                    aria-label={`Foto ${i + 1}`}
                  >
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            {listing.category?.name && <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600">{listing.category.name}</span>}
            {listing.trade?.name && <span className="px-3 py-1 rounded-full bg-[#ffda31] text-[#4a4a49]">{listing.trade.name}</span>}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 break-words">{listing.title}</h1>
          {advertiser && (
            <p className="text-sm text-slate-500 font-semibold">
              Por{" "}
              {preview || !advertiser.slug ? (
                advertiser.name
              ) : (
                <Link to={`/guia/${advertiser.slug}`} className="text-red-600 hover:underline">{advertiser.name}</Link>
              )}
            </p>
          )}
        </div>

        <p className="text-slate-700 leading-relaxed whitespace-pre-line break-words">{listing.description}</p>

        <div className="grid sm:grid-cols-2 gap-4">
          {place && (
            <InfoItem icon={MapPin} title="Ubicación" text={[listing.address, place].filter(Boolean).join(" · ")} />
          )}
          <InfoItem icon={MapPin} title="Zona de trabajo" text={coverageText(listing) || "—"} />
          {listing.homeService && <InfoItem icon={Home} title="Atención a domicilio" text="Va hasta donde estés" />}
          {listing.hasStore && (
            <InfoItem icon={Store} title="Local físico" text={listing.storeOnly ? "Atiende solo en el local" : "También atiende en su local"} />
          )}
        </div>

        {schedule.length > 0 && (
          <div className="bg-slate-50 rounded-2xl p-5">
            <h2 className="flex items-center gap-2 font-bold text-slate-900 mb-3"><Clock className="w-4 h-4" /> Horarios</h2>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              {schedule.map((d) => (
                <div key={d.key}>
                  <dt className="font-bold text-slate-500 text-xs uppercase">{d.label}</dt>
                  <dd className="text-slate-700">{listing.schedule[d.key]}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {embed && (
          <div className="aspect-video rounded-2xl overflow-hidden bg-black">
            <iframe src={embed} title={`Video de ${listing.title}`} className="w-full h-full" allowFullScreen loading="lazy" />
          </div>
        )}
      </div>

      {aside && <aside className="flex flex-col gap-6 lg:sticky lg:top-28 self-start w-full">{aside}</aside>}
    </div>
  );
}

function InfoItem({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-3 p-4 rounded-2xl border border-slate-100 bg-white">
      <Icon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
        <p className="text-sm text-slate-700 font-medium">{text}</p>
      </div>
    </div>
  );
}
