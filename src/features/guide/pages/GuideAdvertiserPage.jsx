import React from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin } from "lucide-react";
import Loader from "@/common/components/Loader";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useGuideAdvertiserProfile } from "@/hooks/useGuideDirectory";
import GuideContactButtons from "../components/GuideContactButtons";
import GuideListingCard from "../components/GuideListingCard";

/** `/guia/:slug` — perfil público de un anunciante con todas sus publicaciones visibles. */
export default function GuideAdvertiserPage() {
  const { slug } = useParams();
  const { data: advertiser, isLoading, isError } = useGuideAdvertiserProfile(slug);
  useDocumentMeta(advertiser ? `${advertiser.name} — InfoCasa Guía` : null, advertiser?.description);

  if (isLoading) return <Loader />;
  if (isError || !advertiser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">No encontramos este perfil</h1>
        <Link to="/guia" className="inline-block mt-6 font-bold text-red-600 hover:underline">Volver a la Guía</Link>
      </div>
    );
  }

  const contact = {
    phone: advertiser.phone,
    whatsapp: advertiser.whatsapp,
    email: advertiser.contactEmail,
    website: advertiser.website,
    social: advertiser.social,
  };
  const place = [advertiser.neighborhood, advertiser.city, advertiser.province].filter(Boolean).join(", ");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <aside className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-5 self-start lg:sticky lg:top-28">
        <div className="flex items-center gap-4">
          {advertiser.logoUrl ? (
            <img src={advertiser.logoUrl} alt={advertiser.name} className="w-20 h-20 rounded-2xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-[#ffda31] flex items-center justify-center text-3xl font-black text-[#4a4a49]">
              {advertiser.name?.[0]}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 break-words">{advertiser.name}</h1>
            <p className="text-sm text-slate-500">{advertiser.typeLabel}</p>
          </div>
        </div>
        {place && (
          <p className="flex items-center gap-2 text-sm text-slate-600"><MapPin className="w-4 h-4 text-red-600" /> {place}</p>
        )}
        {advertiser.trades.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {advertiser.trades.map((t) => (
              <span key={t.id} className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">{t.name}</span>
            ))}
          </div>
        )}
        {advertiser.description && <p className="text-sm text-slate-700 whitespace-pre-line">{advertiser.description}</p>}
        <GuideContactButtons
          contact={contact}
          title={advertiser.name}
          shareUrl={advertiser.shareUrl}
          trackingParams={{ section: "guia", guide_advertiser_id: advertiser.id }}
        />
      </aside>

      <section className="lg:col-span-2 flex flex-col gap-5">
        <h2 className="text-xl font-bold text-slate-900">Publicaciones</h2>
        {advertiser.listings.length === 0 ? (
          <p className="text-slate-500">Este anunciante todavía no tiene publicaciones visibles.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {advertiser.listings.map((listing) => (
              <GuideListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
