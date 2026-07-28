import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Share2, Heart, ChevronRight } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Layout from "@/common/components/Layout";
import PropertyCard from "@/common/components/PropertyCard";
import PropertyMap from "../components/PropertyMap";
import PropertyGalleryGrid from "../components/detail/PropertyGalleryGrid";
import PropertyGalleryLightbox from "../components/detail/PropertyGalleryLightbox";
import PropertySpecs from "../components/detail/PropertySpecs";
import PropertyTechnicalDetails from "../components/detail/PropertyTechnicalDetails";
import PropertyPriceBox from "../components/detail/PropertyPriceBox";
import PropertyContactForm from "../components/detail/PropertyContactForm";
import { usePropertyDetail } from "@/hooks/usePropertyDetail";
import loadingIcon from "@/assets/img/Icono.png";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    property,
    publisher,
    loading,
    showGallery,
    setShowGallery,
    activeImage,
    setActiveImage,
    relatedProperties,
    formData,
    setFormData,
    isSubmitting,
    submitSuccess,
    setSubmitSuccess,
    submitError,
    handleSubmitLead,
    toggleFavorite,
    loadingFavorite,
  } = usePropertyDetail(id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <img src={loadingIcon} alt="Cargando..." className="w-20 h-20 object-contain animate-heartbeat mb-4" />
          <p className="text-slate-500 font-bold animate-pulse">Cargando propiedad premium...</p>
        </div>
      </Layout>
    );
  }

  if (!property) return null;

  const images = property.images?.length > 0 ? property.images.map((img) => img.url || img) : [property.imageUrl];
  const openGallery = (index) => { setActiveImage(index); setShowGallery(true); };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">

        {/* Breadcrumbs & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400 min-w-0 w-full md:w-auto">
            <Link to="/" className="hidden sm:inline hover:text-blue-600 transition-colors flex-shrink-0">Inicio</Link>
            <ChevronRight className="hidden sm:block w-4 h-4 flex-shrink-0" />
            <Link to="/search" className="hover:text-blue-600 transition-colors flex-shrink-0">Propiedades</Link>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <span className="text-slate-600 truncate min-w-0">{property.title}</span>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate(`/share/${property.id}`, { state: { propertyTitle: property.title } })}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-sm"
            >
              <Share2 className="w-4 h-4" /> Compartir
            </button>
            <button
              onClick={toggleFavorite}
              disabled={loadingFavorite}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 font-bold rounded-xl transition-all text-sm ${
                property.isFavorited
                  ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100"
                  : "bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700"
              }`}
            >
              <Heart className={`w-4 h-4 ${property.isFavorited ? "fill-rose-500 text-rose-600" : ""}`} />
              {property.isFavorited ? "Guardado" : "Guardar"}
            </button>
          </div>
        </div>

        <PropertyGalleryGrid images={images} hasPriceDrop={property.priceHistory?.length > 0} onOpen={openGallery} />

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Main Info */}
          <div className="lg:col-span-8 space-y-10">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-blue-50 text-blue-600 font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-wider border border-blue-100">
                  {property.type} en {property.status}
                </span>
                {property.featured && (
                  <span className="bg-amber-50 text-amber-600 font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-wider border border-amber-100">
                    Propiedad Destacada
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-none tracking-tight mb-4">{property.title}</h1>
              <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
                <MapPin className="w-5 h-5 text-slate-400" /> {property.location}
              </div>
            </div>

            <PropertySpecs property={property} />

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Descripción de la Propiedad</h2>
              <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            <PropertyTechnicalDetails property={property} />

            {/* Map Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Ubicación</h2>
                <span className="text-xs font-semibold text-slate-400">
                  {property.showExactAddress ? "Dirección exacta" : "Zona aproximada"}
                </span>
              </div>
              <div className="h-96 rounded-3xl overflow-hidden border border-slate-200 z-10 relative shadow-sm">
                <PropertyMap {...property} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <PropertyPriceBox property={property} />
            <PropertyContactForm
              publisher={publisher}
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmitLead}
              isSubmitting={isSubmitting}
              submitSuccess={submitSuccess}
              setSubmitSuccess={setSubmitSuccess}
              submitError={submitError}
            />
          </div>
        </div>

        {/* Related/Suggested Properties */}
        {relatedProperties.length > 0 && (
          <div className="mt-20 space-y-8 border-t border-slate-100 pt-16">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Propiedades Sugeridas</h2>
                <p className="text-slate-500 font-medium mt-1">Opciones recomendadas con características y ubicación similares.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Gallery Lightbox */}
      <AnimatePresence>
        {showGallery && (
          <PropertyGalleryLightbox
            images={images}
            activeImage={activeImage}
            setActiveImage={setActiveImage}
            onClose={() => setShowGallery(false)}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}
