import React from "react";
import { ArrowRight } from "lucide-react";

/**
 * Sección "Noticias del sector inmobiliario" (100% estática).
 * Contenido hardcodeado (no consume API). Reemplazar por fuente real si se cablea un feed.
 */
const NEWS = [
  {
    category: "Mercado",
    title: "El mercado inmobiliario argentino crece un 15% en el primer semestre",
    desc: "Las operaciones de compra-venta aumentaron significativamente en comparación con el año anterior.",
    source: "Infobae",
    date: "15/01/2024",
  },
  {
    category: "Inversión",
    title: "Los barrios más caros de Buenos Aires para invertir en 2024",
    desc: "Descubrí cuáles son las zonas con mayor plusvalía y rentabilidad del mercado porteño.",
    source: "El Cronista",
    date: "10/01/2024",
  },
  {
    category: "Finanzas",
    title: "Créditos hipotecarios: vuelven a ser una opción para los argentinos",
    desc: "Los bancos comienzan a ofrecer nuevas líneas de financiamiento para la compra de viviendas.",
    source: "La Nación",
    date: "05/01/2024",
  },
  {
    category: "Construcción",
    title: "Se espera un repunte en la venta de propiedades para 2024",
    desc: "Expertos prevén un aumento en las transacciones inmobiliarias durante los próximos meses.",
    source: "Ámbito",
    date: "02/01/2024",
  },
  {
    category: "Arquitectura",
    title: "Nuevas tendencias en arquitectura sustentable en Argentina",
    desc: "Cada vez más proyectos apuestan por la eficiencia energética y el diseño ecológico.",
    source: "Clarín",
    date: "28/12/2023",
  },
  {
    category: "Tendencias",
    title: "Alquileres temporarios: la nueva tendencia que gana terreno",
    desc: "Las plataformas de reservas impulsan el crecimiento de alquileres por cortos períodos.",
    source: "Infobae",
    date: "20/12/2023",
  },
];

export default function HomeNews() {
  return (
    <section className="bg-white py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            Noticias del sector inmobiliario
          </h2>
          <p className="text-slate-500 font-medium mt-3">
            Las últimas novedades y tendencias del mercado
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {NEWS.map((item) => (
            <article
              key={item.title}
              className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 p-6"
            >
              <span className="inline-block self-start bg-[#ff0019] text-white px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest mb-5">
                {item.category}
              </span>
              <h3 className="text-lg font-bold text-slate-900 leading-snug mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed flex-grow">
                {item.desc}
              </p>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                <span className="text-sm font-bold text-[#ff0019]">{item.source}</span>
                <span className="text-xs text-slate-400 font-medium">{item.date}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
