import React, { useMemo, useState } from "react";
import { X, ExternalLink, MapPin, Newspaper } from "lucide-react";

const BRAND = {
  red: "#ff0019",
  gold: "#ffda31",
  gray: "#4a4a49",
};

// ─── Datos base por provincia ────────────────────────────────────────
const PROVINCIAS_DATA = {
  Tucumán: {
    ciudades: ["San Miguel de Tucumán", "Yerba Buena", "Tafí Viejo", "Banda del Río Salí", "Concepción", "Aguilares"],
    fuentes: [
      { nombre: "La Gaceta", url: "https://www.lagaceta.com.ar/" },
      { nombre: "Contexto Tucumán", url: "https://www.contextotucuman.com/" },
      { nombre: "Tucumán Noticias", url: "https://www.tucumanoticias.com.ar/" },
    ],
  },
  Salta: {
    ciudades: ["Salta Capital", "San Lorenzo", "Cerrillos", "Rosario de Lerma", "Cafayate", "Metán"],
    fuentes: [
      { nombre: "El Tribuno", url: "https://www.eltribuno.com/" },
      { nombre: "La Gaceta Salta", url: "https://www.lagacetasalta.com.ar/" },
      { nombre: "Salta Noticias", url: "https://www.saltanoticias.com.ar/" },
    ],
  },
  Jujuy: {
    ciudades: ["San Salvador de Jujuy", "Palpalá", "San Pedro", "Humahuaca", "Tilcara", "La Quiaca"],
    fuentes: [
      { nombre: "El Tribuno de Jujuy", url: "https://www.eltribunodejujuy.com/" },
      { nombre: "Jujuy al Momento", url: "https://www.jujuyalmomento.com/" },
      { nombre: "Pregón", url: "https://www.pregon.com.ar/" },
    ],
  },
  Catamarca: {
    ciudades: ["San Fernando del Valle", "Fray Mamerto Esquiú", "Valle Viejo", "Andalgalá", "Tinogasta", "Belén"],
    fuentes: [
      { nombre: "El Ancasti", url: "https://www.elancasti.com.ar/" },
      { nombre: "La Unión", url: "https://www.launionnoticias.com.ar/" },
      { nombre: "Catamarca Actual", url: "https://www.catamarcactual.com.ar/" },
    ],
  },
  "Santiago del Estero": {
    ciudades: ["Santiago Capital", "La Banda", "Termas de Río Hondo", "Añatuya", "Frías", "Quimilí"],
    fuentes: [
      { nombre: "El Liberal", url: "https://www.elliberal.com.ar/" },
      { nombre: "Nuevo Diario", url: "https://www.nuevodiarioweb.com.ar/" },
      { nombre: "Diario Panorama", url: "https://www.diariopanorama.com/" },
    ],
  },
  "La Rioja": {
    ciudades: ["La Rioja Capital", "Chilecito", "Chamical", "Aimogasta", "Famatina", "Villa Unión"],
    fuentes: [
      { nombre: "Nueva Rioja", url: "https://www.nuevarioja.com.ar/" },
      { nombre: "El Independiente", url: "https://www.elindependiente.com.ar/" },
      { nombre: "Rioja Virtual", url: "https://www.riojavirtual.com.ar/" },
    ],
  },
};

// ─── Plantillas de noticias por categoría ────────────────────────────
const PLANTILLAS = {
  Mercado: [
    { t: "El metro cuadrado en {ciudad} sube {pct}% en el último trimestre", d: "Los valores de venta en zonas céntricas mostraron un incremento sostenido por la demanda.", c: "El mercado inmobiliario de {ciudad} registró un incremento del {pct}% en el precio promedio del metro cuadrado durante el último trimestre. Las zonas céntricas y los barrios residenciales con buena conectividad lideran el alza, impulsadas por una mayor demanda y una oferta limitada de propiedades usadas en buen estado." },
    { t: "Precios de venta en {ciudad}: qué se espera para fin de año", d: "Analistas del sector anticipan una estabilización de los valores tras meses de ajustes.", c: "Los especialistas en el mercado inmobiliario de {ciudad} anticipan una estabilización de los precios de venta hacia fin de año. El {pct}% de aumento acumulado en los últimos meses podría desacelerarse, según los datos relevados en las principales inmobiliarias de la zona." },
    { t: "Oferta de propiedades en {ciudad} crece {pct}% y presiona sobre los precios", d: "Una mayor oferta de unidades comienza a equilibrar el mercado tras meses de escasez.", c: "La oferta de propiedades en venta en {ciudad} creció un {pct}% en los últimos meses. Este incremento en la oferta comienza a equilibrar un mercado que venía con escasez de unidades y presionaba al alza sobre los precios." },
    { t: "{ciudad}: compradores priorizan barrios con servicios y conectividad", d: "Las zonas con mejor infraestructura y accesos concentran la mayor demanda.", c: "Los compradores en {ciudad} priorizan cada vez más barrios con servicios completos y buena conectividad. Las zonas cercanas a centros comerciales, colegios y accesos rápidos concentran el {pct}% de las consultas, según datos de las principales inmobiliarias locales." },
  ],
  Alquiler: [
    { t: "Alquileres en {ciudad} suben {pct}% en el trimestre", d: "La escasez de unidades disponibles y el aumento de la demanda explican el fenómeno.", c: "Los alquileres en {ciudad} registraron un incremento promedio del {pct}% durante el último trimestre. La escasez de unidades disponibles y el aumento de la demanda por parte de estudiantes y jóvenes profesionales explican el fenómeno, según datos del sector." },
    { t: "Nuevas regulaciones para contratos de alquiler en {ciudad}", d: "Los contratos firmados desde este mes deberán incluir cláusulas específicas sobre ajustes y plazos.", c: "La nueva normativa establece que los contratos de alquiler en {ciudad} deberán especificar con claridad el mecanismo de ajuste, los plazos de notificación y las condiciones de renovación. El objetivo es dar mayor previsibilidad tanto a propietarios como a inquilinos." },
    { t: "{ciudad}: crece la demanda de alquileres temporarios", d: "El auge del turismo impulsa la oferta de alquileres temporarios en la zona.", c: "La demanda de alquileres temporarios en {ciudad} creció un {pct}% en el último año, impulsada por el auge del turismo. Los propietarios están adaptando sus viviendas para recibir huéspedes, mientras las plataformas digitales facilitan la conexión entre anfitriones y visitantes." },
    { t: "Alquileres en {ciudad}: qué documentación piden los propietarios", d: "Un repaso por los requisitos más habituales que solicitan las inmobiliarias locales.", c: "Las inmobiliarias de {ciudad} solicitan cada vez más documentación a los inquilinos. Entre los requisitos más habituales figuran el recibo de sueldo, garantía propietaria, seguro de caución y comprobantes de ingresos. Algunos propietarios aceptan también garantías alternativas." },
  ],
  Tendencias: [
    { t: "Crece la demanda de departamentos con balcón en {ciudad}", d: "Los espacios abiertos se posicionan como los atributos más buscados por compradores jóvenes.", c: "El interés por departamentos con balcón o terraza creció un {pct}% en {ciudad}. Los compradores priorizan la calidad de vida dentro del hogar y buscan espacios abiertos, aunque sean reducidos. Los desarrolladores están adaptando sus proyectos a esta nueva preferencia." },
    { t: "Home office: cómo elegir una propiedad con espacio para trabajar en {ciudad}", d: "La demanda de ambientes extra para oficina en casa sigue en aumento.", c: "Un ambiente dedicado al home office aporta funcionalidad y mejor calidad de vida. Al visitar una propiedad en {ciudad}, conviene evaluar la iluminación natural, la conexión a internet de la zona y la aislación acústica. Muchos compradores priorizan hoy este atributo por encima de otros." },
    { t: "{ciudad}: crece la demanda de viviendas sustentables", d: "Paneles solares, aislación térmica y materiales reciclados se posicionan como atributos valorados.", c: "Las viviendas sustentables ganan terreno en {ciudad}. Paneles solares, aislación térmica de alta eficiencia y sistemas de recolección de agua son cada vez más valorados por los compradores, que buscan reducir su huella ambiental y los costos a largo plazo." },
    { t: "Cocinas integradas: la tendencia que gana terreno en {ciudad}", d: "Los ambientes integrados y las cocinas abiertas se consolidan como preferencia.", c: "Las cocinas integradas al living se consolidan como una de las tendencias más fuertes en {ciudad}. Los compradores valoran la amplitud visual y la funcionalidad de estos espacios, que se adaptan mejor a los nuevos estilos de vida y a la vida social en casa." },
  ],
  Inversión: [
    { t: "Invertir en pozo en {ciudad}: qué evaluar antes de comprar", d: "Los desarrollos en pozo ofrecen precios más bajos pero requieren analizar plazos y respaldo.", c: "Comprar en pozo puede representar una oportunidad interesante de inversión en {ciudad}, siempre que se analicen la trayectoria del desarrollador, los plazos de entrega, el esquema de financiamiento y la zona del proyecto. Los especialistas recomiendan asesorarse antes de firmar." },
    { t: "{ciudad}: rentabilidad de alquileres alcanza el {pct}% anual", d: "Los inversores encuentran en el alquiler una alternativa atractiva frente a otros instrumentos.", c: "La rentabilidad anual de los alquileres en {ciudad} alcanza el {pct}% según los últimos datos del sector. Este rendimiento, sumado a la revalorización de los inmuebles, posiciona al mercado inmobiliario local como una alternativa atractiva para inversores." },
    { t: "Créditos hipotecarios en {ciudad}: qué ofrecen los bancos", d: "Un repaso por las principales líneas vigentes, tasas y requisitos.", c: "Las líneas de crédito hipotecario vigentes en {ciudad} presentan tasas variables según el banco y el perfil del solicitante. En general se exige un ingreso demostrable, una antigüedad laboral mínima y un porcentaje del valor como anticipo." },
    { t: "{ciudad}: terrenos en zonas en desarrollo atraen inversores", d: "Los terrenos en zonas de expansión urbana concentran el interés de los inversores.", c: "Los terrenos ubicados en zonas de expansión urbana de {ciudad} concentran el interés de los inversores. La proyección de crecimiento, la llegada de servicios y las obras de infraestructura previstas son los principales factores que impulsan la demanda." },
  ],
};

// ─── Generador de noticias ──────────────────────────────────────────
// Genera 30 noticias por provincia (6 provincias × 30 = 180 noticias),
// con fechas entre el 6/8/2026 y el 6/10/2026 (últimos 2 meses).
const generarNoticias = () => {
  const noticias = [];
  const categorias = Object.keys(PLANTILLAS);

  // Rango de fechas: 6/8/2026 al 6/10/2026
  const fechaInicio = new Date("2026-08-06T00:00:00").getTime();
  const fechaFin = new Date("2026-10-06T23:59:59").getTime();

  // Fuente pseudo-aleatoria pero determinística (para que las fechas no cambien cada render)
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  let id = 1;
  Object.entries(PROVINCIAS_DATA).forEach(([provincia, data]) => {
    for (let i = 0; i < 30; i++) {
      // Categoría rotativa: 0=Mercado, 1=Alquiler, 2=Tendencias, 3=Inversión, 4=Mercado, ...
      const cat = categorias[i % categorias.length];
      const plantilla = PLANTILLAS[cat][i % PLANTILLAS[cat].length];

      // Selecciones variadas
      const ciudad = data.ciudades[i % data.ciudades.length];
      const fuente = data.fuentes[i % data.fuentes.length];
      const pct = 5 + ((i * 7) % 20); // entre 5% y 24%

      // Fecha aleatoria dentro del rango
      const ts = fechaInicio + rand() * (fechaFin - fechaInicio);
      const fecha = new Date(ts);

      // Texto con variables reemplazadas
      const titulo = plantilla.t.replace(/{ciudad}/g, ciudad).replace(/{pct}/g, pct);
      const descripcion = plantilla.d.replace(/{ciudad}/g, ciudad).replace(/{pct}/g, pct);
      const contenido = plantilla.c.replace(/{ciudad}/g, ciudad).replace(/{pct}/g, pct);

      noticias.push({
        id: id++,
        tag: cat,
        provincia,
        titulo,
        descripcion,
        contenido,
        fuente,
        fecha: formatearFecha(fecha),
      });
    }
  });

  // Ordenar por fecha descendente (más recientes primero)
  return noticias.sort((a, b) => new Date(b.fechaRaw) - new Date(a.fechaRaw));
};

// Formatea "hace X días" según la fecha real
const formatearFecha = (fecha) => {
  const hoy = new Date("2026-10-06T12:00:00");
  const diffDias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
  if (diffDias <= 0) return "Hoy";
  if (diffDias === 1) return "Ayer";
  if (diffDias < 7) return `Hace ${diffDias} días`;
  if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semana${Math.floor(diffDias / 7) > 1 ? "s" : ""}`;
  return `Hace ${Math.floor(diffDias / 30)} mes${Math.floor(diffDias / 30) > 1 ? "es" : ""}`;
};

const CATEGORIAS = ["Todas", "Mercado", "Alquiler", "Tendencias", "Inversión"];
const PROVINCIAS = [
  "Todas",
  "Tucumán",
  "Salta",
  "Jujuy",
  "Catamarca",
  "Santiago del Estero",
  "La Rioja",
];

export default function NoticiasPage() {
  // Generamos una sola vez al montar (useMemo sin deps)
  const noticias = useMemo(() => generarNoticias(), []);

  const [filtro, setFiltro] = useState("Todas");
  const [provincia, setProvincia] = useState("Todas");
  const [noticiaActiva, setNoticiaActiva] = useState(null);
  const [pagina, setPagina] = useState(1);
  const POR_PAGINA = 12;

  const noticiasFiltradas = useMemo(() => {
    return noticias.filter((n) => {
      const okCat = filtro === "Todas" || n.tag === filtro;
      const okProv = provincia === "Todas" || n.provincia === provincia;
      return okCat && okProv;
    });
  }, [noticias, filtro, provincia]);

  // Reset de página al cambiar filtros
  React.useEffect(() => {
    setPagina(1);
  }, [filtro, provincia]);

  const totalPaginas = Math.ceil(noticiasFiltradas.length / POR_PAGINA);
  const noticiasPagina = noticiasFiltradas.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA
  );

  return (
    <div className="w-full">
      {/* HERO — FONDO ROJO */}
      <section style={{ background: BRAND.red }}>
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20 text-center">
          <span className="inline-flex items-center gap-2 bg-white/15 text-white border border-white/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 backdrop-blur-sm">
            <Newspaper className="w-3.5 h-3.5" /> Noticias
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Novedades del NOA
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto font-medium">
            Análisis, tendencias y datos del mercado inmobiliario del Noroeste
            Argentino.
          </p>
        </div>
      </section>

      {/* FILTROS */}
      <section className="max-w-5xl mx-auto px-6 py-8 -mt-6 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-2 bg-white rounded-full shadow-lg border border-slate-100 p-2">
          {CATEGORIAS.map((cat) => {
            const active = filtro === cat;
            return (
              <button
                key={cat}
                onClick={() => setFiltro(cat)}
                className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all"
                style={{
                  background: active ? BRAND.red : "transparent",
                  color: active ? "#fff" : BRAND.gray,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {PROVINCIAS.map((prov) => {
            const active = provincia === prov;
            return (
              <button
                key={prov}
                onClick={() => setProvincia(prov)}
                className="px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border"
                style={{
                  background: active ? BRAND.gray : "#fff",
                  color: active ? "#fff" : BRAND.gray,
                  borderColor: active ? BRAND.gray : "#e2e8f0",
                }}
              >
                {prov}
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-500 font-medium pt-2">
          {noticiasFiltradas.length} noticia
          {noticiasFiltradas.length !== 1 ? "s" : ""} encontrada
          {noticiasFiltradas.length !== 1 ? "s" : ""}
        </p>
      </section>

      {/* GRID DE NOTICIAS */}
      <section className="noticias-section" style={{ background: "transparent" }}>
        <div className="container">
          {noticiasFiltradas.length === 0 ? (
            <p className="text-center text-slate-500 py-16">
              No hay noticias con esos filtros.
            </p>
          ) : (
            <div className="noticias-grid">
              {noticiasPagina.map((n) => (
                <article
                  key={n.id}
                  className="noticia-card"
                  onClick={() => setNoticiaActiva(n)}
                >
                  <div className="noticia-header">
                    <span className="noticia-tag">{n.tag}</span>
                    <h3>{n.titulo}</h3>
                    <p className="noticia-descripcion">{n.descripcion}</p>
                  </div>
                  <div className="noticia-footer">
                    <a
                      href={n.fuente.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="noticia-fuente inline-flex items-center gap-1 hover:underline"
                      title={`Ir a la nota original en ${n.fuente.nombre}`}
                    >
                      {n.fuente.nombre}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3" />
                      {n.provincia}
                    </span>
                    <span className="text-[11px] text-slate-500">{n.fecha}</span>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* PAGINACIÓN */}
          {totalPaginas > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="px-5 py-2 rounded-full text-sm font-bold border border-slate-200 text-slate-600 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                ← Anterior
              </button>
              <span className="px-4 py-2 text-sm font-bold text-slate-500">
                Página {pagina} de {totalPaginas}
              </span>
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="px-5 py-2 rounded-full text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: BRAND.red }}
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* MODAL */}
      {noticiaActiva && (
        <div
          className="noticia-modal active"
          onClick={() => setNoticiaActiva(null)}
        >
          <div className="noticia-modal-overlay" />
          <div
            className="noticia-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="noticia-modal-close"
              onClick={() => setNoticiaActiva(null)}
              aria-label="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="noticia-modal-body">
              <span className="noticia-tag">{noticiaActiva.tag}</span>
              <h2>{noticiaActiva.titulo}</h2>
              <div className="modal-meta">
                <a
                  href={noticiaActiva.fuente.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-fuente inline-flex items-center gap-1 hover:underline"
                >
                  {noticiaActiva.fuente.nombre}
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3 h-3" />
                  {noticiaActiva.provincia} · {noticiaActiva.fecha}
                </span>
              </div>
              <div className="modal-texto">
                <p>{noticiaActiva.contenido}</p>
              </div>
              <a
                href={noticiaActiva.fuente.url}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-link inline-flex items-center gap-1"
              >
                Leer nota completa en {noticiaActiva.fuente.nombre}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}