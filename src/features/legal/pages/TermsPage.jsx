import React from "react";
import LegalDoc, { Section, Clause, P, UL, OL, Note } from "../components/LegalDoc";
import { DatosIdentificatorios, TituloIV } from "../content/sharedLegal";

const TOC = [
  { id: "datos", label: "Datos identificatorios y contacto" },
  { id: "titulo-i", label: "Título I — Marco contractual, rol de la plataforma y condiciones de uso" },
  { id: "titulo-ii", label: "Título II — Regulación de publicaciones y verticales de negocio" },
  { id: "titulo-iv", label: "Título IV — Consumidores, garantías, seguridad y jurisdicción" },
];

export default function TermsPage() {
  return (
    <LegalDoc
      kicker="InfoCasa — Documento legal"
      title="Términos y Condiciones Generales de Uso"
      version="Integral V3.0 (Consolidada)"
      updated="agosto 2026"
      intro="Documento base de Términos y Condiciones de Uso para el ecosistema InfoCasa. El acceso, registro, publicación o contratación de cualquier servicio implica la aceptación plena de estas cláusulas."
      toc={TOC}
    >
      <section id="datos" className="scroll-mt-24">
        <DatosIdentificatorios />
      </section>

      {/* ─── TÍTULO I ─────────────────────────────────────────────── */}
      <Section id="titulo-i" title="Título I — Marco contractual, rol de la plataforma y condiciones de uso">
        <Clause n="1" title="Objeto y aceptación">
          <P>
            Las presentes cláusulas regulan el acceso, navegación, registro y utilización del sitio web,
            aplicaciones móviles, herramientas informáticas, bases de datos, servicios y espacios comerciales
            que integran el ecosistema InfoCasa (en adelante, "InfoCasa", el "Sitio" o la "Plataforma").
          </P>
          <P>
            InfoCasa podrá incorporar publicaciones de compraventa y alquiler inmobiliario, alojamientos
            temporales, espacios publicitarios, herramientas de estimación y cotización de valores, mecanismos
            de generación de contactos, perfiles profesionales, productos de decoración, construcción,
            mantenimiento, soluciones de financiación, seguros y futuras categorías afines.
          </P>
          <P>
            El acceso, registro, publicación de anuncios, envío de formularios o contratación de cualquier
            Servicio dentro de la Plataforma implica la aceptación plena, implícita e incondicionada de todos
            los términos establecidos en este documento en la medida en que resulte legalmente válido.
          </P>
        </Clause>

        <Clause n="2" title="Naturaleza y rol de InfoCasa">
          <P>
            InfoCasa es una plataforma tecnológica y medio de difusión publicitaria destinado a facilitar la
            búsqueda, publicación, comunicación y contacto entre usuarios, anunciantes y prestadores de
            servicios de terceros.
          </P>
          <P>
            Salvo indicación técnica o comercial expresa respecto de un servicio propio, InfoCasa no es
            propietario, vendedor, comprador, locador, arrendatario, administrador de consorcios, constructor,
            corredor inmobiliario, martillero público, tasador, profesional matriculado, entidad aseguradora,
            productor asesor de seguros, entidad financiera, banco ni proveedor directo de los productos o
            servicios ofrecidos por terceros.
          </P>
          <P>
            La utilización de términos como "intermediario", "conector" o "facilitador" dentro del Sitio
            describe exclusivamente el rol tecnológico de la Plataforma y no implica bajo ningún supuesto el
            ejercicio de actividades reguladas para las cuales se requiera matriculación o habilitación
            específica. La contratación de publicidad o destacados genera responsabilidad para InfoCasa
            únicamente por la prestación de su servicio tecnológico, sin asumir responsabilidad por el
            cumplimiento o legalidad de la actividad del tercero.
          </P>
        </Clause>

        <Clause n="3" title="Condiciones de acceso, registro y capacidad">
          <UL>
            <li>
              <strong>Acceso libre y registrado:</strong> El acceso general para búsquedas y consultas no
              requiere suscripción. Sin embargo, la publicación de contenidos, contratación de planes o uso de
              herramientas avanzadas exigirá la creación de un perfil y/o el abono de una tarifa.
            </li>
            <li>
              <strong>Capacidad legal:</strong> El uso de la Plataforma está reservado a personas humanas con
              plena capacidad legal para contratar y a representantes de personas jurídicas. Queda prohibida la
              contratación o registro por parte de menores de edad sin la debida representación legal.
            </li>
          </UL>
        </Clause>
      </Section>

      {/* ─── TÍTULO II ────────────────────────────────────────────── */}
      <Section id="titulo-ii" title="Título II — Regulación de publicaciones y verticales de negocio">
        <Clause n="4" title="Publicaciones inmobiliarias">
          <P>
            El anunciante (sea propietario particular o profesional inmobiliario) es el único y exclusivo
            responsable por la veracidad, exactitud, vigencia, integridad y legalidad del aviso publicado. Esto
            incluye precios, tipo de moneda, ubicación, fotografías, planos, estado dominial, superficies,
            disponibilidad y documentación.
          </P>
          <P>
            InfoCasa no audita ni garantiza la existencia real, titularidad jurídica o disponibilidad de los
            inmuebles. Corresponde al usuario interesado verificar la documentación e información antes de
            efectuar pagos, reservas o firmas de contratos. Los anunciantes profesionales deberán contar con
            las matrículas y habilitaciones correspondientes conforme a la normativa de su jurisdicción.
          </P>
        </Clause>

        <Clause n="5" title="Alquiler temporal y certificación documental de domicilio">
          <OL>
            <li>
              <strong>Alquiler temporal:</strong> InfoCasa actúa como mero escaparate publicitario para
              hospedajes turísticos o temporarios. El operador o propietario responde íntegramente por la
              higiene, seguridad, capacidad, precios, impuestos y habilitaciones locales. Salvo contratación
              expresa, InfoCasa no percibe comisiones por las reservas pactadas.
            </li>
            <li>
              <strong>Domicilio certificado:</strong> InfoCasa podrá ofrecer una insignia de "Domicilio
              Certificado" basada en la validación de documentación aportada (ej. facturas de servicios).
              <UL>
                <li>
                  <strong>Alcance:</strong> La validación es estrictamente documental e informática.
                </li>
                <li>
                  <strong>Exclusiones:</strong> NO constituye inspección física del lugar, comprobación de la
                  existencia del inmueble, certificación de dominio, habilitación municipal/turística, ni
                  garantía de reserva o seguridad.
                </li>
              </UL>
            </li>
          </OL>
          <Note>
            <strong>Leyenda informativa.</strong> Toda publicación certificada exhibirá la leyenda:
            "Validación documental del domicilio declarado. No implica inspección física, certificación de
            existencia, habilitación, titularidad ni garantía del establecimiento."
          </Note>
        </Clause>

        <Clause n="6" title="Publicidad, anunciantes y sponsorización">
          <P>
            InfoCasa comercializa espacios de difusión (banners, publicaciones patrocinadas, destacados) para
            empresas desarrolladoras, constructoras, corralones, aseguradoras, entidades bancarias y comercios.
          </P>
          <P>
            El pago de espacio publicitario no representa una recomendación, aval, homologación o asociación
            jurídica por parte de InfoCasa hacia el anunciante. InfoCasa se reserva el derecho de rechazar,
            suspender o dar de baja publicidad que resulte engañosa, engañe al consumidor o infrinja la ley.
          </P>
        </Clause>

        <Clause n="7" title="Directorio de profesionales y marketplace">
          <UL>
            <li>
              <strong>Marketplace de materiales y servicios:</strong> Los comercios o prestadores de reformas,
              mantenimiento, mudanzas o decoración responden directamente por la entrega, calidad, stock y
              garantía de los bienes comprados.
            </li>
            <li>
              <strong>Perfiles profesionales:</strong> Arquitectos, escribanos, abogados, ingenieros y maestros
              mayor de obras inscritos responden individualmente por la idoneidad técnica y profesional de sus
              servicios. La exhibición del perfil no constituye garantía de resultado por parte de InfoCasa.
            </li>
          </UL>
        </Clause>

        <Clause n="8" title="Tasaciones y herramientas de cotización">
          <P>
            Las calculadoras, estadísticas, valuadores o rangos de precios provistos en el Sitio poseen
            carácter meramente orientativo e informativo. No constituyen una tasación profesional, pericia
            judicial, avalúo fiscal ni informe bancario, ni implican asesoramiento de inversión o financiero.
          </P>
        </Clause>

        <Clause n="9" title="Financiación, créditos y seguros">
          <OL>
            <li>
              <strong>Servicios financieros:</strong> Los simuladores de créditos o hipotecas no representan
              oferta formal ni aprobación de crédito. La elegibilidad, tasas, cuotas y otorgamiento
              corresponden exclusivamente a las entidades financieras autorizadas.
            </li>
            <li>
              <strong>Seguros:</strong> InfoCasa no actúa como aseguradora ni como Productor Asesor de Seguros
              (Ley 22.400). Toda emisión, emisión de póliza o liquidación de siniestros es responsabilidad de
              la compañía de seguros o intermediario regulado que publicite en la Plataforma.
            </li>
          </OL>
        </Clause>
      </Section>

      {/* ─── TÍTULO IV (compartido) ───────────────────────────────── */}
      <TituloIV />
    </LegalDoc>
  );
}
