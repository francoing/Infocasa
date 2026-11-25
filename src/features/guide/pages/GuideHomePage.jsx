import React from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, MessageCircle, Search } from "lucide-react";
import Loader from "@/common/components/Loader";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useGuideCategories } from "@/hooks/useGuideDirectory";
import GuideCategoryGrid from "../components/GuideCategoryGrid";
import GuideSearchBar from "../components/GuideSearchBar";
import GuidePublishCta from "../components/GuidePublishCta";

const STEPS = [
  { icon: Search, title: "Buscá", text: "Por oficio, profesión, comercio o producto, en tu localidad." },
  { icon: BadgeCheck, title: "Compará", text: "Mirá fotos, zona de trabajo, horarios y si atienden a domicilio." },
  { icon: MessageCircle, title: "Contactá", text: "Escribí por WhatsApp, llamá o pedí presupuesto sin intermediarios." },
];

/** `/guia` — home de la InfoCasa Guía: buscador, categorías y rubros. */
export default function GuideHomePage() {
  const { user } = useAuth();
  const { data: categories = [], isLoading } = useGuideCategories();
  useDocumentMeta(
    "InfoCasa Guía — profesionales, oficios y comercios",
    "Encontrá arquitectos, electricistas, plomeros, corralones, ferreterías y empresas de construcción y hogar cerca tuyo."
  );

  return (
    <div className="bg-slate-50">
      <section className="bg-[#ff0019] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-14 md:py-20 flex flex-col gap-6">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-[#ffda31]">InfoCasa Guía</span>
          <h1 className="text-3xl md:text-5xl font-black leading-tight max-w-3xl">
            Todo lo que necesitás para construir, refaccionar y mantener tu casa
          </h1>
          <p className="text-white/80 max-w-2xl">
            Profesionales, oficios, comercios y empresas de tu zona, en un solo lugar.
          </p>
          <div className="max-w-4xl">
            <GuideSearchBar />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 flex flex-col gap-8">
        <h2 className="text-2xl font-bold text-slate-900">Explorá por categoría</h2>
        {isLoading ? <Loader inline className="py-16" /> : <GuideCategoryGrid categories={categories} />}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-12 grid grid-cols-1 md:grid-cols-3 gap-5">
        {STEPS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="bg-white rounded-2xl border border-slate-100 p-6 flex gap-4">
            <Icon className="w-6 h-6 text-red-600 shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500">{text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-16">
        <GuidePublishCta user={user} />
        <p className="text-xs text-slate-400 mt-4">
          ¿Buscás una propiedad? <Link to="/search" className="font-bold text-red-600 hover:underline">Andá al marketplace</Link>.
        </p>
      </section>
    </div>
  );
}
