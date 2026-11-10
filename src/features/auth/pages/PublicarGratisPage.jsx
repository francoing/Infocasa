import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, CheckCircle2, ChevronRight, Zap, ShieldCheck, TrendingUp } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

export default function PublicarGratisPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 👇 REDIRECCIÓN INTELIGENTE: Si ya está logueado, directo a crear propiedad.
  useEffect(() => {
    if (user) {
      navigate("/dashboard/properties/create", { replace: true });
    }
  }, [user, navigate]);

  // Si no está logueado, mostramos la landing y el botón lo manda al login
  return (
    <div className="bg-white min-h-screen">
      {/* HERO SECTION */}
      <section className="bg-[#ff0019] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase">
            Para Dueños Directos
          </span>
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter">
            Publicá tu propiedad <br /> gratis en 2 minutos.
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-medium max-w-2xl mx-auto">
            Sin costo. Sin comisiones. Llegá a miles de compradores y inquilinos en todo el NOA.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
            <Link
              to="/login"
              state={{ from: { pathname: "/dashboard/properties/create" } }} // 👈 Le dice al login que lo devuelva acá
              className="bg-white text-[#ff0019] px-8 py-4 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-current" />
              Publicar Gratis Ahora
            </Link>
            <Link
              to="/login"
              state={{ from: { pathname: "/dashboard/properties/create" } }}
              className="bg-transparent border-2 border-white/40 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-[#ff0019] rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Sin comisiones ocultas</h3>
            <p className="text-slate-500 font-medium">No te cobramos por publicar. Lo que ves es lo que pagás (cero).</p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-[#ff0019] rounded-2xl flex items-center justify-center mx-auto">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Máxima visibilidad</h3>
            <p className="text-slate-500 font-medium">Tu propiedad aparece en los primeros resultados de búsqueda.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-[#ff0019] rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Fácil y rápido</h3>
            <p className="text-slate-500 font-medium">Subí fotos, completá los datos y publicá en menos de 2 minutos.</p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-slate-50 py-16 px-6 text-center">
        <h2 className="text-3xl font-black text-slate-900 mb-6">¿Listo para vender o alquilar?</h2>
        <Link
          to="/login"
          state={{ from: { pathname: "/dashboard/properties/create" } }}
          className="inline-flex items-center gap-2 bg-[#ff0019] text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-500/20"
        >
          Publicar mi propiedad <ChevronRight className="w-5 h-5" />
        </Link>
      </section>
    </div>
  );
}
