import React, { useState, useEffect } from "react";

/**
 * Sección "Noticias del sector inmobiliario" del NOA.
 * Incluye modal con el contenido completo de cada noticia.
 */
const NEWS = {
  1: {
    tag: "Desarrollo",
    titulo: "La sana costumbre de apostar al crecimiento de Tucumán: Avanco lanza The Point Country 2",
    descripcion: "La desarrollista tucumana apuesta a un nuevo country en San Pablo con arquitectura minimalista, áreas deportivas y un coworking.",
    fuente: "La Gaceta",
    fecha: "04/09/2026",
    texto: [
      "Es prácticamente imposible transitar las zonas urbanizadas más importantes de Tucumán sin ver un desarrollo de Avanco: el Centro y Barrio Norte, Yerba Buena, San Pablo, Tafi Viejo, son algunos de los lugares donde la emblemática empresa tucumana, desarrollista y constructora, viene dejando su impronta desde hace más de tres décadas.",
      "El Ingeniero Rubén Rojkés, CEO y fundador de Avanco, expresó: 'Cada proyecto tiene su propia historia. Sus por qué y sus para qué. Y eso se refleja en cada decisión que tomamos'. La nueva generación de la empresa, representada por sus hijos Diego, Joaquín y Martín, tuvo a su cargo la responsabilidad de conducir la etapa de Conceptualización y Diseño de The Point Country 2."
    ],
    link: "https://www.lagaceta.com.ar/nota/1152655/contenido-patrocinado/sana-costumbre-apostar-al-crecimiento-tucuman-avanco-lanza-the-point-country-2.html"
  },
  2: {
    tag: "Mercado",
    titulo: "Las compras ya no vienen del ahorro: Advierten un cambio en el mercado inmobiliario salteño",
    descripcion: "El mercado está a la baja y las operaciones ahora surgen de la venta de otros activos. Hay expectativa por el relanzamiento de los créditos hipotecarios.",
    fuente: "Informate Salta",
    fecha: "01/09/2026",
    texto: [
      "El mercado inmobiliario salteño atraviesa un momento de menor movimiento y con cambios en la forma en la que se concretan las operaciones. Sebastián Robledo, de Robledo House, aseguró que actualmente las ventas continúan, pero con menos volumen y con compradores que muchas veces llegan después de desprenderse de otros activos.",
      "'Las operaciones que se van haciendo no vienen del ahorro, no vienen de la utilidad de una empresa, vienen de ventas de activos', explicó. A pesar del panorama, Robledo considera que el relanzamiento de los créditos hipotecarios podría darle impulso al mercado durante los próximos meses."
    ],
    link: "https://informatesalta.com.ar/real-estate/-las-compras-ya-no-vienen-del-ahorro---advierten-un-cambio-en-el-mercado-inmobiliario-salteno_a6a983e2993603c7d7ddc9982"
  },
  3: {
    tag: "Alquileres",
    titulo: "En Jujuy el mercado inmobiliario recuperó protagonismo tras la derogación de la ley de alquileres",
    descripcion: "El presidente de la Cámara Inmobiliaria de Jujuy destacó la mayor fluidez del mercado y la vuelta de los carteles de 'se alquila'.",
    fuente: "Provincia Multimedios",
    fecha: "05/09/2026",
    texto: [
      "El mercado de alquileres en nuestro país atraviesa un momento de transformación. Tras la derogación de ley de alquileres, el sector inmobiliario ha recuperado fluidez, con una oferta sostenida y mayores posibilidades de elección para los inquilinos.",
      "Guillermo Bustamante, presidente de la Cámara Inmobiliaria de Jujuy, expresó que 'hoy tenemos la posibilidad de elegir. Si una vivienda no nos convence por precio o comodidades, podemos buscar otra, algo que antes era impensado'. Además, remarcó de manera optimista: 'Hemos vuelto a ver carteles frente a las viviendas (de que se alquila), que eso había desaparecido totalmente'."
    ],
    link: "https://provinciamultimedios.jujuy.gob.ar/aseguran-que-en-jujuy-el-mercado-inmobiliario-recupero-protagonismo-tras-la-derogacion-de-la-ley-de-alquileres/"
  },
  4: {
    tag: "Análisis",
    titulo: "Corredores inmobiliarios analizaron el mercado local de Santiago del Estero",
    descripcion: "Fuerte demanda de departamentos pequeños por el crecimiento estudiantil. La demanda de alquileres supera ampliamente a la oferta.",
    fuente: "El Liberal",
    fecha: "01/09/2026",
    texto: [
      "El mercado inmobiliario de Santiago del Estero atraviesa un escenario de movimiento dispar, con una fuerte demanda en determinados segmentos y dificultades para concretar operaciones vinculadas a la vivienda propia.",
      "Uno de los principales puntos abordados fue el mercado de alquileres, donde la demanda continúa creciendo y se encuentra muy por encima de la oferta disponible. Según explicó Favián Hoyos, actualmente existe una importante demanda de departamentos pequeños, monoambientes y unidades de un dormitorio, impulsada principalmente por el crecimiento de la población estudiantil."
    ],
    link: "https://www.elliberal.com.ar/nota/90364/2026/09/corredores-inmobiliarios-analizaron-el-mercado-local"
  },
  5: {
    tag: "Inversión",
    titulo: "CADISAL y el Gobierno de Salta acordaron agilizar proyectos para impulsar nuevas inversiones",
    descripcion: "Desarrolladores y Gobierno crearon una mesa de trabajo para destrabar trámites y preparar nuevos proyectos para créditos hipotecarios.",
    fuente: "IN Salta",
    fecha: "03/09/2026",
    texto: [
      "Los desarrolladores inmobiliarios salteños consiguieron abrir una instancia de trabajo directo con el Gobierno provincial y municipios del área metropolitana para abordar algunos de los principales condicionantes que enfrentan las nuevas inversiones del sector.",
      "El acuerdo surgió de una reunión que representantes de CADISAL mantuvieron con el gobernador Gustavo Sáenz y autoridades provinciales. Uno de los puntos planteados fue la necesidad de reducir los tiempos administrativos que atraviesan los emprendimientos antes de llegar a su etapa de ejecución, con reglas claras que faciliten la concreción de nuevas inversiones."
    ],
    link: "https://insalta.info/amp/plus/cadisal-y-el-gobierno-acordaron-agilizar-proyectos-para-impulsar-nuevas-inversiones-inmobiliarias"
  },
  6: {
    tag: "Financiamiento",
    titulo: "Giro en el mercado inmobiliario del NOA: la cuota hipotecaria ya iguala al alquiler",
    descripcion: "El resurgimiento de los créditos hipotecarios genera un cambio de tendencia. Las consultas y reservas de unidades aptas para crédito subieron más del 30%.",
    fuente: "El Vocero",
    fecha: "26/08/2026",
    texto: [
      "El mercado inmobiliario en el Noroeste Argentino atraviesa un punto de inflexión impulsado por el resurgimiento de las opciones de financiamiento, lo que está permitiendo a cientos de familias proyectar el salto definitivo de inquilinos a propietarios.",
      "Felipe Biella, destacado referente del sector en la región, confirmó que durante este mes de agosto se consolidó un fuerte cambio de tendencia. La clave de este nuevo escenario radica en que el valor de una cuota hipotecaria ha logrado equipararse con los montos que actualmente se abonan por un alquiler mensual. Como resultado inmediato, las inmobiliarias locales ya reportan un alza sostenida, con un incremento superior al 30% en las consultas y reservas de unidades aptas para crédito."
    ],
    link: "https://elvocero.com.ar/2026/08/27/giro-en-el-mercado-inmobiliario-del-noa-la-cuota-hipotecaria-ya-iguala-al-alquiler-y-las-consultas-suben-30/"
  }
};

export default function HomeNews() {
  const [noticiaModalOpen, setNoticiaModalOpen] = useState(false);
  const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null);

  // Efecto para la animación del modal
  useEffect(() => {
    if (noticiaSeleccionada) {
      const timer = setTimeout(() => {
        setNoticiaModalOpen(true);
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [noticiaSeleccionada]);

  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && noticiaModalOpen) {
        setNoticiaModalOpen(false);
        setTimeout(() => setNoticiaSeleccionada(null), 400);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [noticiaModalOpen]);

  const abrirNoticia = (id) => {
    setNoticiaSeleccionada(id);
  };

  const cerrarNoticia = () => {
    setNoticiaModalOpen(false);
    setTimeout(() => setNoticiaSeleccionada(null), 400);
  };

  return (
    <>
      <section className="section noticias-section" id="noticias">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-label">Actualidad</span>
            <h2>Noticias del sector inmobiliario</h2>
            <p className="noticias-subtitle">
              Hacé clic en cada noticia para leer el contenido completo - Septiembre 2026
            </p>
          </div>

          <div className="noticias-grid">
            {Object.entries(NEWS).map(([id, noticia]) => (
              <div
                key={id}
                className="noticia-card"
                onClick={() => abrirNoticia(id)}
              >
                <div className="noticia-header">
                  <span className="noticia-tag">{noticia.tag}</span>
                  <h3>{noticia.titulo}</h3>
                  <p className="noticia-descripcion">{noticia.descripcion}</p>
                  <div className="noticia-footer">
                    <span className="noticia-fuente">{noticia.fuente}</span>
                    <span className="noticia-fecha">{noticia.fecha}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODAL */}
      {noticiaModalOpen && noticiaSeleccionada && (
        <div
          className={`noticia-modal ${noticiaModalOpen ? 'active' : ''}`}
          onClick={cerrarNoticia}
        >
          <div className="noticia-modal-overlay"></div>
          <div className="noticia-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="noticia-modal-close" onClick={cerrarNoticia}>
              &times;
            </button>
            <div className="noticia-modal-body">
              <span className="noticia-tag">{NEWS[noticiaSeleccionada].tag}</span>
              <h2>{NEWS[noticiaSeleccionada].titulo}</h2>
              <div className="modal-meta">
                <span className="modal-fuente">{NEWS[noticiaSeleccionada].fuente}</span>
                <span>{NEWS[noticiaSeleccionada].fecha}</span>
              </div>
              <div className="modal-texto">
                {NEWS[noticiaSeleccionada].texto.map((parrafo, index) => (
                  <p key={index}>{parrafo}</p>
                ))}
                <a
                  href={NEWS[noticiaSeleccionada].link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-link"
                >
                  Leer noticia completa →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}