import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Crown, Layers, Calendar, Users, ShieldCheck, 
  Building2, ArrowRight, Laptop, MessageCircle, CheckCircle2
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

export default function PlanFundadorPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/profile", { replace: true });
    }
  }, [user, navigate]);

  // Función para formatear el precio con ARS
  const formatPrice = (price) => {
    if (price === 0) return "Gratis";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const planesAgente = [
    {
      id: 4, name: "Plan Fundador", price: 0, limit: 200, destacadas: 0,
      features: ["Hasta 200 propiedades", "Sin destacadas incluidas", "Soporte 24/7", "Asignación directa de leads"],
      highlight: false
    },
    {
      id: 5, name: "Profesional", price: 40000, limit: 30, destacadas: 5,
      features: ["Hasta 30 propiedades", "Incluye 5 destacadas", "Soporte 24/7"],
      highlight: false
    },
    {
      id: 6, name: "Profesional Plus", price: 80000, limit: 100, destacadas: 15,
      features: ["Hasta 100 propiedades", "Incluye 15 destacadas", "Soporte 24/7"],
      highlight: false
    },
    {
      id: 7, name: "Profesional Premium", price: 160000, limit: 200, destacadas: 30,
      features: ["Hasta 200 propiedades", "Incluye 30 destacadas", "Soporte prioritario"],
      highlight: true,
      badge: "Más Elegido"
    }
  ];

  return (
    <div className="bg-white min-h-screen font-sans flex flex-col">
      {/* 1. HERO SECTION */}
      <section 
        className="relative w-full min-h-[450px] lg:min-h-[550px] flex items-center bg-[#0a192f] bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: `url('/img/mockupinfocasa.png')` }}
      >
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-y-0 left-0 w-[50%] bg-gradient-to-r from-[#0a192f] via-[#0a192f]/90 to-transparent"></div>
          <div className="absolute inset-y-0 right-0 w-[50%] bg-gradient-to-l from-[#0a192f] via-[#0a192f]/90 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0a192f] to-transparent"></div>
        </div>

        <div className="relative max-w-6xl mx-auto w-full px-6 py-10 z-10">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-2 bg-[#ffda31] text-[#0a192f] px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase">
              <Crown className="w-4 h-4" /> Exclusivo para Inmobiliarias
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-white drop-shadow-lg">
              Plan Fundador: <br />
              Tu inmobiliaria, entre las <br />
              primeras de InfoCasa.
            </h1>
            
            <p className="text-lg md:text-xl text-slate-200 font-medium max-w-md drop-shadow-md">
              Publicá tu cartera, ganá visibilidad y sumate al nuevo portal inmobiliario de Tucumán.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-3 bg-[#112240]/80 border border-[#ffda31] px-5 py-3 rounded-2xl backdrop-blur-sm">
                <Building2 className="w-6 h-6 text-[#ffda31]" />
                <div>
                  <p className="text-[#ffda31] font-black text-lg leading-tight">200</p>
                  <p className="text-white text-xs font-bold">propiedades</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#112240]/80 border border-[#ffda31] px-5 py-3 rounded-2xl backdrop-blur-sm">
                <Calendar className="w-6 h-6 text-[#ffda31]" />
                <div>
                  <p className="text-[#ffda31] font-black text-lg leading-tight">6 meses</p>
                  <p className="text-white text-xs font-bold">sin costo</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/register"
                state={{ fromLanding: "plan-fundador" }}
                className="inline-flex items-center gap-3 bg-[#ff0019] text-white px-8 py-4 rounded-xl font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-500/20"
              >
                Quiero mi Plan Fundador <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BENEFICIOS */}
      <section className="py-16 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-black text-[#0a192f] mb-12 max-w-3xl mx-auto leading-tight">
          Todo lo que necesitás para gestionar tu cartera, sin pagar un peso.
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto text-[#ffda31] flex items-center justify-center"><Layers className="w-12 h-12" /></div>
            <h3 className="font-black text-lg text-[#0a192f]">Hasta 200 propiedades</h3>
            <p className="text-slate-500 text-sm font-medium">Publicá todo tu portafolio sin límites.</p>
          </div>
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto text-[#ffda31] flex items-center justify-center"><Calendar className="w-12 h-12" /></div>
            <h3 className="font-black text-lg text-[#0a192f]">6 meses de vigencia</h3>
            <p className="text-slate-500 text-sm font-medium">Tiempo más que suficiente para cerrar operaciones.</p>
          </div>
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto text-[#ffda31] flex items-center justify-center"><Users className="w-12 h-12" /></div>
            <h3 className="font-black text-lg text-[#0a192f]">Gestión de leads y consultas</h3>
            <p className="text-slate-500 text-sm font-medium">Recibí y respondé consultas desde tu panel.</p>
          </div>
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto text-[#ffda31] flex items-center justify-center"><ShieldCheck className="w-12 h-12" /></div>
            <h3 className="font-black text-lg text-[#0a192f]">Perfil verificado</h3>
            <p className="text-slate-500 text-sm font-medium">Aumentá la confianza de tus clientes.</p>
          </div>
        </div>
      </section>

      {/* 3. PUNTO INFOCASA BANNER */}
      <section className="px-6 max-w-6xl mx-auto py-8">
        <div className="bg-slate-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-slate-100">
          <div className="flex-1 space-y-4">
            <span className="bg-[#ffda31] text-[#0a192f] px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">Tu diferencial</span>
            <h2 className="text-3xl font-black text-[#0a192f]">Punto InfoCasa</h2>
            <p className="text-slate-600 font-medium text-lg">Generá el código QR de cada propiedad y colocalo en carteles, vidrieras o redes. Más consultas, más oportunidades.</p>
          </div>
          <div className="flex-1 w-full max-w-md">
            <img src="/img/punto-infocasa-2.jpg" alt="Punto InfoCasa" className="rounded-2xl shadow-lg w-full object-contain" />
          </div>
        </div>
      </section>

      {/* 4. ¿CÓMO FUNCIONA? */}
      <section className="py-16 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-black text-[#0a192f] mb-12">¿Cómo funciona?</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
          <div className="flex flex-col items-center max-w-[200px]">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center relative mb-4">
              <span className="absolute -top-2 -left-2 bg-[#ff0019] text-white w-8 h-8 rounded-full flex items-center justify-center font-black">1</span>
              <Building2 className="w-8 h-8 text-[#0a192f]" />
            </div>
            <h3 className="font-bold text-[#0a192f]">Registrá tu inmobiliaria</h3>
          </div>
          <ArrowRight className="w-8 h-8 text-slate-300 hidden md:block" />
          <div className="flex flex-col items-center max-w-[200px]">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center relative mb-4">
              <span className="absolute -top-2 -left-2 bg-[#ff0019] text-white w-8 h-8 rounded-full flex items-center justify-center font-black">2</span>
              <Laptop className="w-8 h-8 text-[#0a192f]" />
            </div>
            <h3 className="font-bold text-[#0a192f]">Publicá tus propiedades</h3>
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

      {/* 4.5 PLANES PARA INMOBILIARIAS */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-center text-[#0a192f] mb-4">Escalá tu negocio inmobiliario</h2>
        <p className="text-center text-slate-500 font-medium mb-12 max-w-xl mx-auto">
          Nuestros planes están diseñados para que puedas gestionar tu cartera sin límites.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {planesAgente.map((plan) => (
            <div 
              key={plan.id} 
              className={`rounded-3xl p-8 flex flex-col shadow-xl relative overflow-hidden ${
                plan.highlight ? "bg-[#0a192f] text-white scale-105 border-2 border-[#ffda31]" : "bg-white text-slate-900 border border-slate-200"
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-0 bg-[#ffda31] text-[#0a192f] text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-lg">
                  {plan.badge}
                </div>
              )}
              <Crown className={`absolute -right-6 -top-6 w-24 h-24 ${plan.highlight ? "text-[#ffda31]/10" : "text-slate-100"}`} />
              
              <h3 className={`text-xl font-black uppercase ${plan.highlight ? "text-[#ffda31]" : "text-[#0a192f]"}`}>
                {plan.name}
              </h3>
              
              {/* 👇 FORMATEO DEL PRECIO CON ARS */}
              <div className="text-3xl font-black my-4">
                {formatPrice(plan.price)}
                {plan.price > 0 && <span className={`text-base font-bold ${plan.highlight ? "text-slate-400" : "text-slate-500"}`}> /mes</span>}
              </div>
              
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat, i) => (
                  <li key={i} className={`flex items-center gap-2 text-sm font-medium ${plan.highlight ? "text-slate-200" : "text-slate-600"}`}>
                    <CheckCircle2 className={`w-5 h-5 ${plan.highlight ? "text-[#ffda31]" : "text-[#ff0019]"}`} />
                    {feat}
                  </li>
                ))}
              </ul>
              
              <Link
                to="/register"
                state={{ fromLanding: "plan-fundador" }}
                className={`w-full py-3 rounded-xl font-black text-center transition-all ${
                  plan.highlight 
                    ? "bg-[#ffda31] text-[#0a192f] hover:bg-yellow-400" 
                    : "bg-[#ff0019] text-white hover:bg-red-700"
                }`}
              >
                {plan.price === 0 ? "Empezar gratis" : "Elegir este plan"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CTA FINAL */}
      <section className="bg-[#0a192f] pt-16 pb-12 px-6 flex-1 flex flex-col justify-end">
        <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-8 bg-[#112240] p-8 md:p-10 rounded-3xl border border-[#ffda31]/20 relative overflow-hidden mb-0">
          <Crown className="absolute -right-8 -bottom-8 w-48 h-48 text-[#ffda31]/5" />
          <div className="flex-1 space-y-2 z-10">
            <div className="flex items-center gap-2 text-[#ffda31]">
              <Crown className="w-6 h-6" />
              <span className="font-black tracking-widest uppercase text-sm">Oferta exclusiva</span>
            </div>
            <h2 className="text-3xl font-black text-white leading-tight">Sé parte de la primera generación de inmobiliarias de InfoCasa.</h2>
          </div>
          <div className="z-10 w-full md:w-auto text-center">
            <Link
              to="/register"
              state={{ fromLanding: "plan-fundador" }}
              className="inline-flex items-center gap-2 bg-[#ff0019] text-white px-8 py-4 rounded-xl font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 whitespace-nowrap"
            >
              Sumarme al Plan Fundador <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-xs text-slate-400 font-medium mt-3">Oferta válida solo para las primeras inmobiliarias en sumarse.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
