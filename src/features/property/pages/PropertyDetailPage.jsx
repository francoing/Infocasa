import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  MapPin, Bed, Bath, Maximize, Home, Share2, Heart, 
  ChevronLeft, ChevronRight, X, Image as ImageIcon,
  CheckCircle2, Loader2, Calendar, User, MessageCircle,
  TrendingDown, Percent, Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/common/components/Layout";
import PropertyCard from "@/common/components/PropertyCard";
import PropertyMap from "../components/PropertyMap";
import { usePropertyDetail } from "@/hooks/usePropertyDetail";

export default function PropertyDetailPage() {
  const { id } = useParams();
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
    loadingFavorite
  } = usePropertyDetail(id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 font-bold animate-pulse">Cargando propiedad premium...</p>
        </div>
      </Layout>
    );
  }

  if (!property) return null;

  const images = property.images?.length > 0 ? property.images.map(img => img.url || img) : [property.imageUrl];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        
        {/* Breadcrumbs & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
            <Link to="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/search" className="hover:text-blue-600 transition-colors">Propiedades</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-600 truncate max-w-xs">{property.title}</span>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-sm">
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

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 h-[30rem] md:h-[35rem] rounded-[2.5rem] overflow-hidden shadow-md relative group">
          <div className="md:col-span-2 md:row-span-2 relative overflow-hidden h-full">
            <img 
              src={images[0]} 
              alt={property.title} 
              className="w-full h-full object-cover hover:scale-105 transition-all duration-700 cursor-pointer"
              onClick={() => { setActiveImage(0); setShowGallery(true); }}
            />
            {property.priceHistory?.length > 0 && (
              <div className="absolute top-6 left-6 bg-green-500 text-white font-black px-4 py-2 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-green-500/20">
                <TrendingDown className="w-4 h-4" /> Precio Reducido
              </div>
            )}
          </div>
          <div className="hidden md:block relative overflow-hidden h-full">
            <img 
              src={images[1] || images[0]} 
              alt={property.title} 
              className="w-full h-full object-cover hover:scale-105 transition-all duration-700 cursor-pointer"
              onClick={() => { setActiveImage(1 % images.length); setShowGallery(true); }}
            />
          </div>
          <div className="hidden md:block relative overflow-hidden h-full">
            <img 
              src={images[2] || images[0]} 
              alt={property.title} 
              className="w-full h-full object-cover hover:scale-105 transition-all duration-700 cursor-pointer"
              onClick={() => { setActiveImage(2 % images.length); setShowGallery(true); }}
            />
          </div>
          <div className="hidden md:block relative overflow-hidden h-full">
            <img 
              src={images[3] || images[0]} 
              alt={property.title} 
              className="w-full h-full object-cover hover:scale-105 transition-all duration-700 cursor-pointer"
              onClick={() => { setActiveImage(3 % images.length); setShowGallery(true); }}
            />
          </div>
          <div className="hidden md:block relative overflow-hidden h-full">
            <img 
              src={images[4] || images[0]} 
              alt={property.title} 
              className="w-full h-full object-cover hover:scale-105 transition-all duration-700 cursor-pointer"
              onClick={() => { setActiveImage(4 % images.length); setShowGallery(true); }}
            />
          </div>
          
          <button 
            onClick={() => setShowGallery(true)}
            className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md text-slate-900 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-white shadow-lg flex items-center gap-2 transition-all active:scale-95 border border-slate-200/50"
          >
            <ImageIcon className="w-4 h-4 text-slate-700" /> Ver {images.length} fotos
          </button>
        </div>

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

            {/* Quick Specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-white text-blue-600 rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
                  <Bed className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Dormitorios</p>
                  <p className="text-lg font-black text-slate-900">{property.bedrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-white text-blue-600 rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
                  <Bath className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Baños</p>
                  <p className="text-lg font-black text-slate-900">{property.bathrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-white text-blue-600 rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
                  <Maximize className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Superficie</p>
                  <p className="text-lg font-black text-slate-900">{property.area} m²</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-white text-blue-600 rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tipo</p>
                  <p className="text-lg font-black text-slate-900 capitalize">{property.type}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Descripción de la Propiedad</h2>
              <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

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

          {/* Sidebar Forms */}
          <div className="lg:col-span-4 space-y-6">
            {/* Price Box */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Precio de Venta</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900">USD {property.price.toLocaleString()}</span>
                </div>
                {property.priceHistory?.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-green-600">
                    <TrendingDown className="w-4 h-4" />
                    <span>Rebajado de USD {property.priceHistory[property.priceHistory.length - 1].oldPrice.toLocaleString()} ({property.priceHistory[property.priceHistory.length - 1].percentage}% off)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Contactar Anunciante</h3>
              
              {publisher && (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-base uppercase overflow-hidden border border-blue-200">
                    {publisher.avatar ? <img src={publisher.avatar} className="w-full h-full object-cover" /> : publisher.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Inmobiliaria / Agente</p>
                    <h4 className="font-bold text-slate-900 text-base leading-tight">{publisher.name}</h4>
                    {publisher.phoneArea && publisher.phoneNumber && (
                      <p className="text-xs text-slate-500 font-bold mt-1 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> ({publisher.phoneArea}) {publisher.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {submitSuccess ? (
                <div className="p-6 bg-green-50 border border-green-200 text-green-700 rounded-3xl text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
                  <h4 className="font-black uppercase text-sm tracking-widest">¡Consulta Enviada!</h4>
                  <p className="text-xs font-medium">Hemos registrado tu contacto correctamente. El publicador se comunicará contigo a la brevedad.</p>
                  <button 
                    onClick={() => setSubmitSuccess(false)}
                    className="text-xs font-bold underline text-green-700 hover:text-green-800 pt-2 block mx-auto"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitLead} className="space-y-4">
                  {submitError && (
                    <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">{submitError}</p>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nombre Completo</label>
                    <input 
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Tu nombre"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Correo Electrónico</label>
                    <input 
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Teléfono (Opcional)</label>
                    <input 
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Tu celular"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Mensaje</label>
                    <textarea 
                      required
                      rows="4"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all text-sm font-medium resize-none leading-relaxed"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                    Enviar Consulta
                  </button>
                </form>
              )}
            </div>
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
              {relatedProperties.map(prop => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Gallery Lightbox */}
      <AnimatePresence>
        {showGallery && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-6"
          >
            <div className="flex justify-between items-center text-white">
              <span className="text-sm font-bold uppercase tracking-wider">{activeImage + 1} / {images.length}</span>
              <button 
                onClick={() => setShowGallery(false)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative flex items-center justify-center flex-1 max-w-5xl mx-auto w-full group">
              <button 
                onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)}
                className="absolute left-4 p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all opacity-0 group-hover:opacity-100 z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                src={images[activeImage]} 
                alt="Property View" 
                className="max-h-[70vh] max-w-full object-contain rounded-3xl"
              />

              <button 
                onClick={() => setActiveImage((activeImage + 1) % images.length)}
                className="absolute right-4 p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all opacity-0 group-hover:opacity-100 z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex justify-center gap-2 overflow-x-auto py-4">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === index ? "border-blue-500 scale-105" : "border-transparent opacity-50 hover:opacity-100"}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="Thumbnail" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
