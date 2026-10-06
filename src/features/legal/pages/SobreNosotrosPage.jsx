import React from "react";
import { Link } from "react-router-dom";
import Layout from "../../../common/components/Layout";
import {
  Target,
  Eye,
  Handshake,
  Briefcase,
  Mail,
  Phone,
  FileText,
} from "lucide-react";

const BRAND = {
  red: "#ff0019",
  gold: "#ffda31",
  gray: "#4a4a49",
};

export default function SobreNosotrosPage() {
  const values = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Misión",
      desc: "Facilitar la difusión de propiedades y generar nuevas oportunidades de contacto entre profesionales inmobiliarios y potenciales compradores o inquilinos, usando tecnología para hacer más simple, directa y visible la oferta inmobiliaria.",
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Visión",
      desc: "Construir una plataforma de referencia para el mercado inmobiliario del NOA, acompañando a inmobiliarias y corredores con herramientas que potencien la exposición de sus propiedades y les permitan llegar a más personas.",
    },
    {
      icon: <Handshake className="w-6 h-6" />,
      title: "Compromiso",
      desc: "Trabajar junto a los profesionales y las instituciones que representan al sector, escuchando sus necesidades y desarrollando herramientas que realmente aporten valor.",
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: "Para profesionales",
      desc: "Ser una herramienta complementaria para aumentar la exposición de propiedades, facilitar el contacto con interesados y aprovechar nuevos canales digitales de comunicación.",
    },
  ];

  return (
      <div className="w-full">
        {/* HERO — FONDO ROJO */}
        <section className="relative overflow-hidden" style={{ background: BRAND.red }}>
          <div className="max-w-5xl mx-auto px-6 py-20 md:py-28 text-center">
            <span className="inline-block bg-white/15 text-white border border-white/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-5 backdrop-blur-sm">
              Sobre nosotros
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
              Más opciones, <br className="hidden sm:block" />
              mejores decisiones.
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              InfoCasa es una plataforma digital creada para conectar
              propiedades, profesionales inmobiliarios y personas que buscan
              comprar, vender o alquilar.
            </p>
          </div>
        </section>

        {/* ¿QUIÉNES SOMOS? */}
        <section className="max-w-4xl mx-auto px-6 py-16 md:py-20">
          <span
            className="inline-block text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4"
            style={{ background: BRAND.red }}
          >
            ¿Quiénes somos?
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-[#4a4a49] mb-6">
            Una plataforma pensada para el NOA
          </h2>
          <p className="text-[#4a4a49]/85 text-lg leading-relaxed">
            InfoCasa es una plataforma digital creada para conectar propiedades,
            profesionales inmobiliarios y personas que buscan comprar, vender o
            alquilar. Nacemos con la visión de brindar mayor visibilidad al
            mercado inmobiliario del NOA mediante herramientas digitales
            simples, accesibles y pensadas para las nuevas formas de buscar
            propiedades.
          </p>
        </section>

        {/* PILARES */}
        <section className="bg-slate-50 py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <span
                className="inline-block text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3"
                style={{ background: BRAND.red }}
              >
                Lo que nos mueve
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[#4a4a49]">
                Nuestros pilares
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 hover:border-[#ff0019] hover:shadow-lg transition-all group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
                    style={{ background: `${BRAND.gold}40`, color: BRAND.red }}
                  >
                    <span className="group-hover:scale-110 transition-transform">
                      {v.icon}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[#4a4a49] mb-3">
                    {v.title}
                  </h3>
                  <p className="text-[#4a4a49]/75 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOJA MEMBRETADA — VISOR DE IMAGEN (no descargable) */}
        <section className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center mb-8">
            <span
              className="inline-flex items-center gap-2 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3"
              style={{ background: BRAND.red }}
            >
              <FileText className="w-3.5 h-3.5" /> Documento institucional
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#4a4a49] mb-3">
              Hoja membretada
            </h2>
            <p className="text-[#4a4a49]/70 max-w-xl mx-auto">
              Toda la información institucional de InfoCasa, disponible para
              leer directamente acá.
            </p>
          </div>

          {/* Visor de imagen — altura responsive y grande */}
          <div
            className="rounded-2xl overflow-hidden shadow-xl border-2 bg-slate-100"
            style={{ borderColor: BRAND.red }}
          >
            <div className="h-[700px] md:h-[1000px] lg:h-[1200px] overflow-y-auto p-4 md:p-8">
              <img
                src="/img/hoja-membretada_page-0001.jpg"
                alt="Hoja membretada InfoCasa"
                className="w-full rounded-lg shadow-md select-none pointer-events-none"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          </div>

          <p className="text-center text-xs text-[#4a4a49]/60 mt-4">
            Documento institucional InfoCasa · NOA
          </p>
        </section>

        {/* CONTACTO DIRECTO */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="mailto:infocasa.admin@gmail.com"
              className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#ff0019] hover:shadow-lg transition-all"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${BRAND.gold}40`, color: BRAND.red }}
              >
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wider text-[#4a4a49]/60 mb-0.5">
                  Email
                </p>
                <p className="text-[#4a4a49] font-bold truncate">
                  infocasa.admin@gmail.com
                </p>
              </div>
            </a>

            <a
              href="https://wa.me/5493816334056"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#ff0019] hover:shadow-lg transition-all"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${BRAND.gold}40`, color: BRAND.red }}
              >
                <Phone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wider text-[#4a4a49]/60 mb-0.5">
                  WhatsApp
                </p>
                <p className="text-[#4a4a49] font-bold truncate">
                  +54 9 3816 33-4056
                </p>
              </div>
            </a>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-20">
          <div
            className="max-w-5xl mx-auto rounded-3xl px-8 md:px-16 py-12 md:py-16 text-center"
            style={{ background: BRAND.red }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              ¿Listo para encontrar tu próximo hogar?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Explorá miles de propiedades en venta, alquiler y temporario.
            </p>
            <Link
              to="/search"
              className="inline-flex items-center bg-white px-8 py-3.5 rounded-full text-sm font-black transition-all active:scale-95 shadow-lg hover:bg-slate-100"
              style={{ color: BRAND.red }}
            >
              Explorar propiedades
            </Link>
          </div>
        </section>
      </div>
  );
}