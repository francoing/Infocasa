import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  MapPin, Bed, Bath, Maximize, Home, Share2, Heart, 
  ChevronLeft, ChevronRight, X, Image as ImageIcon,
  CheckCircle2, Loader2, Calendar, User, MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../../../common/components/Layout";
import { getPropertyById, getPublisherById } from "../../../hooks/useProperties";
import { useAuth } from "../../../hooks/useAuth";
import PropertyCard from "../../../common/components/PropertyCard";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const propData = await getPropertyById(id);
        setProperty(propData);
        
        if (propData.userId) {
          const userData = await getPublisherById(propData.userId);
          setPublisher(userData);
        }
      } catch (err) {
        console.error("Error fetching property:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  const images = property.gallery?.length > 0 ? property.gallery : [property.imageUrl];

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
            <span className="text-slate-900 truncate max-w-[200px]">{property.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
              <Share2 className="w-5 h-5 text-slate-600" />
            </button>
            <button className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
              <Heart className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Hero Gallery Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-12 aspect-[16/9] md:aspect-[21/9] lg:aspect-[25/9]">
          <div 
            className="lg:col-span-8 rounded-[2.5rem] overflow-hidden relative group cursor-pointer border border-slate-100"
            onClick={() => setShowGallery(true)}
          >
            <img src={images[0]} alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
              <button className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 border border-white/30 hover:bg-white/30 transition-all">
                <ImageIcon className="w-5 h-5" /> Ver todas las fotos
              </button>
            </div>
          </div>
          <div className="hidden lg:grid lg:col-span-4 grid-rows-2 gap-4">
            <div className="rounded-[2.5rem] overflow-hidden relative group cursor-pointer border border-slate-100" onClick={() => setShowGallery(true)}>
              <img src={images[1] || images[0]} alt="Gallery 1" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="rounded-[2.5rem] overflow-hidden relative group cursor-pointer border border-slate-100" onClick={() => setShowGallery(true)}>
              <img src={images[2] || images[0]} alt="Gallery 2" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              {images.length > 3 && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                  <span className="text-3xl font-black">+{images.length - 3}</span>
                  <span className="text-xs font-black uppercase tracking-widest mt-1">Fotos</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Content */}
          <div className="lg:col-span-8 space-y-12">
            <section>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{property.status}</span>
                <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{property.type}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4">{property.title}</h1>
              <div className="flex items-center gap-2 text-slate-500 font-bold">
                <MapPin className="w-5 h-5 text-blue-600" />
                {property.location} {property.address && `• ${property.address}`}
              </div>
            </section>

            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
              <SpecItem icon={<Bed />} value={property.bedrooms} label="Dormitorios" />
              <SpecItem icon={<Bath />} value={property.bathrooms} label="Baños" />
              <SpecItem icon={<Maximize />} value={`${property.area} m²`} label="Superficie" />
              <SpecItem icon={<Home />} value={property.type} label="Tipo" />
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-6">Descripción</h2>
              <p className="text-slate-600 leading-relaxed text-lg font-medium whitespace-pre-line selection:bg-blue-100">
                {property.description}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-6">Características</h2>
              <div className="flex flex-wrap gap-3">
                {property.features?.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100 shadow-sm transition-all hover:bg-white hover:border-blue-200 group">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-slate-700">{f}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-2xl shadow-blue-600/5 sticky top-28">
              <div className="mb-8">
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">Precio de {property.status}</p>
                <div className="text-4xl font-black text-slate-900 tracking-tighter">
                  USD {property.price.toLocaleString()}
                </div>
              </div>

              {publisher && (
                <div className="flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl overflow-hidden border-2 border-white shadow-lg">
                    {publisher.avatar ? <img src={publisher.avatar} className="w-full h-full object-cover" /> : publisher.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Publicado por</p>
                    <p className="text-lg font-black text-slate-900 truncate">{publisher.name}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 active:scale-[0.98]">
                  <MessageCircle className="w-6 h-6" /> Contactar ahora
                </button>
                <button className="w-full bg-slate-100 text-slate-900 py-5 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-[0.98]">
                  Pedir visita
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 flex justify-between items-center text-white bg-slate-900/50 backdrop-blur-md border-b border-white/10 z-10">
              <div className="font-black tracking-tighter">
                <span className="text-blue-400">{activeImage + 1}</span> / {images.length}
              </div>
              <h3 className="hidden md:block font-bold truncate max-w-md">{property.title}</h3>
              <button 
                onClick={() => setShowGallery(false)}
                className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Slider Content */}
            <div className="flex-1 relative flex items-center justify-center p-4 md:p-12 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeImage}
                  src={images[activeImage]}
                  initial={{ opacity: 0, x: 100, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -100, scale: 0.9 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="max-h-full max-w-full object-contain rounded-3xl shadow-2xl"
                />
              </AnimatePresence>

              {/* Navigation Arrows */}
              <button 
                onClick={() => setActiveImage(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                className="absolute left-4 md:left-12 p-4 bg-white/10 text-white rounded-full backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button 
                onClick={() => setActiveImage(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 md:right-12 p-4 bg-white/10 text-white rounded-full backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>

            {/* Thumbnails Bar */}
            <div className="p-6 bg-slate-900/50 backdrop-blur-md border-t border-white/10 overflow-x-auto">
              <div className="flex justify-center gap-4 min-w-max mx-auto">
                {images.map((img, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-blue-500 scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

function SpecItem({ icon, value, label }) {
  return (
    <div className="text-center md:text-left">
      <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-xl mb-3">
        {React.cloneElement(icon, { className: "w-5 h-5" })}
      </div>
      <div className="text-lg font-black text-slate-900 leading-none">{value}</div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}
