import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Crown, CheckCircle2, ChevronRight, Building2, Users, Star } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

export default function PlanFundadorPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 👇 REDIRECCIÓN INTELIGENTE: Si ya está logueado, directo al perfil para que se suscriba.
  useEffect(() => {
    if (user) {
      navigate("/profile", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="bg-white min-h-screen">
      {/* HERO SECTION */}
      <section className="bg-slate-900 text-white py-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <span className="inline-flex items-center gap-2 bg-[#ffda31] text-slate-900 px-4 py-1.5 rounded-full text-sm font-black tracking-widest uppercase">
            <Crown className="w-4 h-4" /> Exclusivo Inmobiliarias
          </span>
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter">
            Plan Fundador: <br /> Tu inmobiliaria al siguiente nivel.
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 font-medium max-w-2xl mx-auto">
            200 propiedades. 6 meses de publicación. <strong className="text-[#ffda31]">$0 de costo.</strong> Sumate a la primera generación.
          </p>
          
          <div className="pt-8">
            <Link
              to="/login"
              state={{ from: { pathname: "/profile" } }} // 👈 Le dice al login que lo devuelva al perfil
              className="inline-flex items-center gap-2 bg-[#ff0019] text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-500/20"
            >
              Quiero mi Plan Fundador <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-black text-slate-900 leading-tight">
              Todo lo que necesitás para gestionar tu cartera, sin pagar un peso.
            </h2>
            
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">Hasta 200 propiedades</h4>
                  <p className="text-slate-500 font-medium">Publicá todo tu portafolio sin límites.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">6 meses de vigencia</h4>
                  <p className="text-slate-500 font-medium">Tiempo más que suficiente para cerrar operaciones.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">Gestión de leads y consultas</h4>
                  <p className="text-slate-500 font-medium">Recibí y respondé consultas desde tu panel.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">Perfil verificado</h4>
                  <p className="text-slate-500 font-medium">Aumentá la confianza de tus clientes.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200 text-center space-y-6">
            <Crown className="w-16 h-16 text-[#ffda31] mx-auto" />
            <h3 className="text-2xl font-black text-slate-900">Plan Fundador</h3>
            <div className="text-5xl font-black text-slate-900">
              $0 <span className="text-lg text-slate-500 font-bold">/ 6 meses</span>
            </div>
            <p className="text-slate-500 font-medium text-sm">Oferta válida solo para las primeras inmobiliarias en sumarse.</p>
            
            <Link
              to="/login"
              state={{ from: { pathname: "/profile" } }}
              className="block w-full bg-[#ff0019] text-white py-4 rounded-xl font-black text-lg hover:bg-red-700 transition-all"
            >
              Sumarme al Plan
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
