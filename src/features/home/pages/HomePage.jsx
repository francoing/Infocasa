import React, { useState } from "react";
import { Search, MapPin, Home as HomeIcon, Wallet, ShieldCheck, Map, ArrowRight, BarChart3, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../../../common/components/Layout";
import PropertyCard from "../../../common/components/PropertyCard";
import Loader from "../../../common/components/Loader";
import { useProperties } from "../../../hooks/useProperties";

export default function HomePage() {
  const { data: properties, loading, error } = useProperties();
  const [location, setLocation] = useState("");
  const [operation, setOperation] = useState("Comprar Propiedad");
  const [priceRange, setPriceRange] = useState("$500k - $1M");
  const navigate = useNavigate();

  const featured = properties.filter(p => p.featured);

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (location) queryParams.set("location", location);
    queryParams.set("operation", operation);
    queryParams.set("priceRange", priceRange);
    navigate(`/search?${queryParams.toString()}`);
  };

  return (
    <Layout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="hero-gradient py-20 lg:py-32 px-6 lg:px-12 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight"
            >
              Encuentra tu próximo capítulo <br className="hidden md:block" /> en la vida de lujo.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12"
            >
              Experimenta el motor de búsqueda de propiedades más refinado, diseñado para quienes valoran la claridad, la velocidad y la estética premium.
            </motion.p>
            
            <motion.form 
              onSubmit={handleSearch}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-2 rounded-2xl shadow-xl border border-slate-100 max-w-4xl mx-auto flex flex-col md:flex-row gap-2"
            >
              <div className="flex-1 flex items-center px-4 py-3 gap-3 border-b md:border-b-0 md:border-r border-slate-100">
                <MapPin className="text-slate-400 w-5 h-5" />
                <div className="text-left w-full">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500">Ubicación</label>
                  <input 
                    className="w-full border-none p-0 focus:ring-0 text-slate-900 placeholder:text-slate-400 text-sm font-medium bg-transparent" 
                    placeholder="¿Dónde quieres vivir?" 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 flex items-center px-4 py-3 gap-3 border-b md:border-b-0 md:border-r border-slate-100">
                <HomeIcon className="text-slate-400 w-5 h-5" />
                <div className="text-left w-full">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500">Operación</label>
                  <select 
                    className="w-full border-none p-0 focus:ring-0 text-slate-900 text-sm font-medium bg-transparent appearance-none"
                    value={operation}
                    onChange={(e) => setOperation(e.target.value)}
                  >
                    <option>Comprar Propiedad</option>
                    <option>Alquilar Propiedad</option>
                  </select>
                </div>
              </div>
              <div className="flex-1 flex items-center px-4 py-3 gap-3">
                <Wallet className="text-slate-400 w-5 h-5" />
                <div className="text-left w-full">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500">Rango de Precio</label>
                  <select 
                    className="w-full border-none p-0 focus:ring-0 text-slate-900 text-sm font-medium bg-transparent appearance-none"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                  >
                    <option>$500k - $1M</option>
                    <option>$1M - $5M</option>
                    <option>$5M+</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit"
                className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Buscar
              </button>
            </motion.form>
          </div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-slate-100/20 rounded-full blur-3xl"></div>
        </section>

        {/* Featured Properties */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 w-full">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Propiedades Destacadas</h2>
              <p className="text-slate-500 mt-2">Propiedades de lujo seleccionadas por su excelencia.</p>
            </div>
            <Link to="/search" className="text-blue-600 font-semibold border-b-2 border-blue-600/20 pb-1 hover:border-blue-600 transition-all">
              Ver todas las propiedades
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
              Error al cargar las propiedades.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.length > 0 ? (
                featured.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))
              ) : (
                <p className="text-center col-span-full py-12 text-slate-500 font-medium italic">No se encontraron propiedades destacadas.</p>
              )}
            </div>
          )}
        </section>

        {/* Value Proposition / Bento */}
        <section className="bg-slate-50 py-24 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 bg-white p-10 lg:p-14 rounded-3xl border border-slate-200 flex flex-col justify-between shadow-sm">
                <div className="max-w-md">
                  <h2 className="text-3xl font-bold text-slate-900 mb-6">Información del mercado que te impulsa.</h2>
                  <p className="text-slate-600 mb-8">Accede a datos en tiempo real, tendencias de precios históricos e informes comunitarios directamente en tu panel de propiedad.</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="bg-slate-100 p-4 rounded-2xl">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="bg-slate-100 p-4 rounded-2xl">
                    <Map className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="bg-slate-100 p-4 rounded-2xl">
                    <ShieldCheck className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="md:col-span-4 bg-blue-600 p-10 lg:p-14 rounded-3xl flex flex-col justify-center text-white">
                <ShieldCheck className="w-12 h-12 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Solo Agentes Certificados</h3>
                <p className="text-blue-100/80 mb-8">Cada profesional en nuestra plataforma es evaluado por su experiencia, conocimiento local e integridad.</p>
                <Link to="/register" className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors w-full text-center">
                  Postular como Agente
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Map CTA Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 w-full">
          <div className="relative h-[450px] rounded-3xl overflow-hidden shadow-2xl">
            <img 
              className="w-full h-full object-cover grayscale opacity-40" 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200"
              alt="Search Map"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-transparent flex items-center px-10 md:px-20">
              <div className="max-w-md text-white">
                <h2 className="text-3xl font-bold mb-4">Buscar en el Mapa</h2>
                <p className="text-blue-100 mb-8">Visualiza tu futuro vecindario. Mira la proximidad a parques, escuelas y servicios esenciales en tiempo real.</p>
                <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold shadow-xl hover:-translate-y-1 transition-transform flex items-center gap-3">
                  Explorar Mapa Local
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
