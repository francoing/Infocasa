import React from "react";
import { Link } from "react-router-dom";

/** Sección CTA "¿Tenés una propiedad?" (estática). */
export default function HomeCTA() {
  return (
    <section className="bg-blue-600 py-20 px-6 lg:px-12 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-6 text-left">
          <h2 className="text-3xl md:text-5xl font-black leading-tight">
            ¿Tenés una propiedad para <span className="underline decoration-white/50 underline-offset-8">vender o alquilar</span>?
          </h2>
          <p className="text-lg text-white/90">
            Publicá tu propiedad y llegá a miles de personas buscando exactamente lo que ofrecés.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              to="/register"
              className="bg-white text-blue-600 border-2 border-transparent hover:bg-slate-50 py-3.5 px-8 rounded-[10px] font-bold text-base transition-all shadow-lg active:scale-95"
            >
              Publicar ahora
            </Link>
            <Link
              to="/search"
              className="border-2 border-white text-white hover:bg-white/10 py-3.5 px-8 rounded-[10px] font-bold text-base transition-all active:scale-95"
            >
              Conocer más
            </Link>
          </div>
        </div>
        <div className="rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"
            alt="Propiedad"
            className="w-full h-[300px] md:h-[400px] object-cover"
          />
        </div>
      </div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
    </section>
  );
}
