import React from "react";
import { Search, Shield, Users, Home } from "lucide-react";

const BENEFITS = [
  { icon: Search, title: "Opciones", desc: "Amplia variedad verificada." },
  { icon: Shield, title: "Confianza", desc: "Seguridad en cada paso." },
  { icon: Users, title: "Acompañamiento", desc: "Asesoramiento personalizado." },
  { icon: Home, title: "Decisiones", desc: "Información clara y transparente." },
];

/** Sección "Por qué Infocasa" (estática). */
export default function HomeBenefits() {
  return (
    <section className="bg-slate-50 py-24 px-6 lg:px-12 text-center">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center mb-16">
          <span className="inline-block bg-blue-600 text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
            Por qué Infocasa
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            Más opciones, mejores decisiones
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white p-10 rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center space-y-4"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500 font-medium">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
