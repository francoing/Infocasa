import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Home, Tag, Layers, Eye, Rocket, ShieldCheck, 
  UserPlus, MessageCircle, ArrowRight, Crown 
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

export default function PublicarGratisPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirección si ya está logueado
  useEffect(() => {
    if (user) {
      navigate("/dashboard/properties/create", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="bg-white min-h-screen font-sans flex flex-col">
      
      {/* 1. HERO SECTION CON LA IMAGEN DE FONDO Y DEGRADADOS LATERALES */}
      <section 
        className="relative w-full min-h-[450px] lg:min-h-[550px] flex items-center bg-[#0a192f] bg-contain bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: `url('/img/punto-infocasa-1.jpg')` }}
      >
        {/* Capa de gradientes para fusionar la imagen */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-y-0 left-0 w-[50%] bg-gradient-to-r from-[#0a192f] via-[#0a192f]/90 to-transparent"></div>
          <div className="absolute inset-y-0 right-0 w-[50%] bg-gradient-to-l from-[#0a192f] via-[#0a192f]/90 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0a192f] to-transparent"></div>
        </div>

        <div className="relative max-w-6xl mx-auto w-full px-6 py-10 z-10">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-2 bg-[#ffda31] text-[#0a192f] px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase">
              <Home className="w-4 h-4" /> Exclusivo para propietarios
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-white drop-shadow-lg">
              ¿Tenés una propiedad <br />
              en <span className="text-[#ffda31]">Tucumán</span>?
            </h1>
            
            <p className="text-lg md:text-xl text-slate-200 font-medium max-w-md drop-shadow-md">
              Publicala en InfoCasa y conectá directamente con interesados, sin intermediarios ni comisiones.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-3 bg-[#112240]/80 border border-[#ffda31] px-5 py-3 rounded-2xl backdrop-blur-sm">
                <Tag className="w-6 h-6 text-[#ffda31]" />
                <div>
                  <p className="text-[#ffda31] font-black text-lg leading-tight">6 meses</p>
                  <p className="text-white text-xs font-bold">sin costo</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#112240]/80 border border-[#ffda31] px-5 py-3 rounded-2xl backdrop-blur-sm">
                <Layers className="w-6 h-6 text-[#ffda31]" />
                <div>
                  <p className="text-[#ffda31] font-black text-lg leading-tight">Hasta 10</p>
                  <p className="text-white text-xs font-bold">propiedades</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/register"
                state={{ from: { pathname: "/dashboard/properties/create" } }}
                className="inline-flex items-center gap-3 bg-[#ff0019] text-white px-8 py-4 rounded-xl font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-500/20"
              >
                Publicar mi propiedad gratis <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BENEFICIOS (ICONOS AHORA SON ROJOS) */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-center text-[#0a192f] mb-12">
          ¿Por qué publicar en InfoCasa?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto text-[#ff0019] flex items-center justify-center">
              <Tag className="w-12 h-12" />
            </div>
            <h3 className="font-black text-lg text-[#0a192f]">Sin comisiones</h3>
            <p className="text-slate-500 text-sm font-medium">Vendé o alquilá directamente, sin intermediarios.</p>
          </div>
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto text-[#ff0019] flex items-center justify-center">
              <Eye className="w-12 h-12" />
            </div>
            <h3 className="font-black text-lg text-[#0a192f]">Más visibilidad</h3>
            <p className="text-slate-500 text-sm font-medium">Tu propiedad en un portal 100% de Tucumán.</p>
          </div>
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto text-[#ff0019] flex items-center justify-center">
              <Rocket className="w-12 h-12" />
            </div>
            <h3 className="font-black text-lg text-[#0a192f]">Fácil y rápido</h3>
            <p className="text-slate-500 text-sm font-medium">Publicás en minutos y recibís consultas directas.</p>
          </div>
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto text-[#ff0019] flex items-center justify-center">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <h3 className="font-black text-lg text-[#0a192f]">Seguro y confiable</h3>
            <p className="text-slate-500 text-sm font-medium">Un espacio pensado para propietarios como vos.</p>
          </div>
        </div>
      </section>

      {/* 3. PUNTO INFOCASA BANNER */}
      <section className="px-6 max-w-6xl mx-auto py-8">
        <div className="bg-slate-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-slate-100">
          <div className="flex-1 space-y-4">
            <span className="bg-[#ffda31] text-[#0a192f] px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
              Tu aliado en cada propiedad
            </span>
            <h2 className="text-3xl font-black text-[#0a192f]">Punto InfoCasa</h2>
            <p className="text-slate-600 font-medium text-lg">
              Generá el código QR de tu publicación y colocalo en el frente, cartel o vidriera. Más consultas, más oportunidades.
            </p>
          </div>
          <div className="flex-1 w-full max-w-md">
            <img 
              src="/img/punto-infocasa-2.jpg" 
              alt="Punto InfoCasa" 
              className="rounded-2xl shadow-lg w-full object-cover" 
            />
          </div>
        </div>
      </section>

      {/* 4. ¿CÓMO FUNCIONA? */}
      <section className="py-16 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-black text-[#0a192f] mb-12">
          ¿Cómo funciona?
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
          
          <div className="flex flex-col items-center max-w-[200px]">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center relative mb-4">
              <span className="absolute -top-2 -left-2 bg-[#ff0019] text-white w-8 h-8 rounded-full flex items-center justify-center font-black">1</span>
              <UserPlus className="w-8 h-8 text-[#0a192f]" />
            </div>
            <h3 className="font-bold text-[#0a192f]">Registrate gratis</h3>
          </div>

          <ArrowRight className="w-8 h-8 text-slate-300 hidden md:block" />

          <div className="flex flex-col items-center max-w-[200px]">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center relative mb-4">
              <span className="absolute -top-2 -left-2 bg-[#ff0019] text-white w-8 h-8 rounded-full flex items-center justify-center font-black">2</span>
              <Home className="w-8 h-8 text-[#0a192f]" />
            </div>
            <h3 className="font-bold text-[#0a192f]">Publicá tu propiedad</h3>
          </div>

          <ArrowRight className="w-8 h-8 text-slate-300 hidden md:block" />

          <div className="flex flex-col items-center max-w-[200px]">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center relative mb-4">
              <span className="absolute -top-2 -left-2 bg-[#ff0019] text-white w-8 h-8 rounded-full flex items-center justify-center font-black">3</span>
              <MessageCircle className="w-8 h-8 text-[#0a192f]" />
            </div>
            <h3 className="font-bold text-[#0a192f]">Recibí consultas de interesados</h3>
          </div>

        </div>
      </section>

      {/* 5. CTA FINAL (PLAN FUNDADOR) - AJUSTADO PARA PEGAR CON EL FOOTER */}
      <section className="bg-[#0a192f] pt-16 pb-12 px-6 flex-1 flex flex-col justify-end">
        <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-8 bg-[#112240] p-8 md:p-10 rounded-3xl border border-[#ffda31]/20 relative overflow-hidden mb-0">
          <Crown className="absolute -right-8 -bottom-8 w-48 h-48 text-[#ffda31]/5" />
          
          <div className="flex-1 space-y-2 z-10">
            <div className="flex items-center gap-2 text-[#ffda31]">
              <Crown className="w-6 h-6" />
              <span className="font-black tracking-widest uppercase text-sm">Oferta exclusiva</span>
            </div>
            <h2 className="text-3xl font-black text-white leading-tight">
              Sumate hoy al Plan Fundador y publicá <span className="text-[#ffda31]">gratis por 6 meses.</span>
            </h2>
            <p className="text-slate-400 font-medium">
              Sé parte de la primera generación de propietarios de InfoCasa en Tucumán.
            </p>
          </div>

          <div className="z-10 w-full md:w-auto text-center">
            <Link
              to="/register"
              state={{ from: { pathname: "/dashboard/properties/create" } }}
              className="inline-flex items-center gap-2 bg-[#ff0019] text-white px-8 py-4 rounded-xl font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 whitespace-nowrap"
            >
              Publicar mi propiedad gratis <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-xs text-slate-400 font-medium mt-3">Oferta válida por tiempo limitado.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
