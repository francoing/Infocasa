import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loader from "@/common/components/Loader";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useGuideListing, useRegisterGuideView } from "@/hooks/useGuideDirectory";
import GuideContactButtons from "../components/GuideContactButtons";
import GuideInquiryForm from "../components/GuideInquiryForm";
import GuideListingDetail from "../components/GuideListingDetail";

/** `/guia/publicacion/:slug` — ficha pública de una publicación de la Guía. */
export default function GuideListingPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { data: listing, isLoading, isError } = useGuideListing(slug);
  const [inquiryType, setInquiryType] = useState("info");
  useRegisterGuideView(slug, !!listing);
  useDocumentMeta(listing ? `${listing.title} — InfoCasa Guía` : null, listing?.description);

  if (isLoading) return <Loader />;
  if (isError || !listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">No encontramos esta publicación</h1>
        <p className="text-slate-500 mt-2">Puede que esté pausada o que ya no exista.</p>
        <Link to="/guia" className="inline-block mt-6 font-bold text-red-600 hover:underline">Volver a la Guía</Link>
      </div>
    );
  }

  const tracking = { section: "guia", guide_listing_id: listing.id, guide_advertiser_id: listing.advertiser?.id };

  const aside = (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-4">
        {listing.advertiser && (
          <div className="flex items-center gap-3">
            {listing.advertiser.logoUrl && (
              <img src={listing.advertiser.logoUrl} alt={listing.advertiser.name} className="w-12 h-12 rounded-xl object-cover" />
            )}
            <div>
              <p className="font-bold text-slate-900">{listing.advertiser.name}</p>
              <p className="text-xs text-slate-500">{listing.advertiser.typeLabel}</p>
            </div>
          </div>
        )}
        <GuideContactButtons contact={listing.contact} title={listing.title} shareUrl={listing.shareUrl} trackingParams={tracking} />
        <button
          type="button"
          onClick={() => {
            setInquiryType("budget");
            document.getElementById("guia-consulta")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="px-5 py-3 rounded-xl border-2 border-red-600 text-red-600 font-bold text-sm hover:bg-red-50 transition-all"
        >
          Pedir presupuesto
        </button>
      </div>
      <div id="guia-consulta" className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-bold text-slate-900 mb-4">Consultá al anunciante</h2>
        <GuideInquiryForm slug={listing.slug} user={user} defaultType={inquiryType} />
      </div>
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
      <nav className="text-xs font-semibold text-slate-400 mb-6 flex flex-wrap gap-1 min-w-0">
        <Link to="/guia" className="hover:text-red-600">InfoCasa Guía</Link>
        {listing.category && (
          <>
            <span>/</span>
            <Link to={`/guia/buscar?category=${listing.category.slug}`} className="hover:text-red-600">{listing.category.name}</Link>
          </>
        )}
        {listing.trade && (
          <>
            <span>/</span>
            <Link to={`/guia/buscar?category=${listing.category?.slug ?? ""}&trade=${listing.trade.slug}`} className="hover:text-red-600">
              {listing.trade.name}
            </Link>
          </>
        )}
      </nav>
      <GuideListingDetail listing={listing} aside={aside} />
    </div>
  );
}
