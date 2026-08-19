import React from "react";
import LegalDoc, { Section, Clause, P, UL, OL, Note } from "../components/LegalDoc";
import { DatosIdentificatorios, TituloIV } from "../content/sharedLegal";

const TOC = [
  { id: "datos", label: "Datos identificatorios y contacto" },
  { id: "titulo-iii", label: "Título III — Protección de datos, cookies y privacidad" },
  { id: "titulo-iv", label: "Título IV — Consumidores, garantías, seguridad y jurisdicción" },
];

export default function PrivacyPage() {
  return (
    <LegalDoc
      kicker="InfoCasa — Documento legal"
      title="Política Integral de Privacidad"
      version="Integral V3.0 (Consolidada)"
      updated="agosto 2026"
      intro="Cómo InfoCasa recolecta, utiliza, comparte y protege tus datos personales, en cumplimiento de la Ley N° 25.326 de Protección de los Datos Personales."
      toc={TOC}
    >
      <section id="datos" className="scroll-mt-24">
        <DatosIdentificatorios />
      </section>

      {/* ─── TÍTULO III ───────────────────────────────────────────── */}
      <Section id="titulo-iii" title="Título III — Protección de datos personales, cookies y privacidad">
        <Clause n="10" title="Marco legal y recopilación de datos">
          <P>
            InfoCasa trata los datos personales en estricto cumplimiento de la Ley N° 25.326 de Protección de
            los Datos Personales, su Decreto Reglamentario N° 1558/2001 y las disposiciones emitidas por la
            Agencia de Acceso a la Información Pública (AAIP).
          </P>
          <P className="font-semibold">Tipos de datos recolectados:</P>
          <UL>
            <li>
              <strong>Datos de identificación y contacto:</strong> Nombre, apellido, DNI/CUIT, correo
              electrónico, teléfono, domicilio.
            </li>
            <li>
              <strong>Datos de publicaciones y perfil:</strong> Ubicación de propiedades, fotos, precios,
              matriculación profesional, datos comerciales.
            </li>
            <li>
              <strong>Datos de navegación y técnicos:</strong> Dirección IP, cookies, historial de
              interacción, tipo de dispositivo, navegador, fecha y hora.
            </li>
          </UL>
        </Clause>

        <Clause n="11" title="Finalidades del tratamiento">
          <P>Los datos recopilados se destinan a:</P>
          <OL>
            <li>Administrar cuentas de usuario y permitir la gestión de avisos.</li>
            <li>Transmitir las solicitudes de consulta al anunciante o profesional seleccionado por el usuario.</li>
            <li>Operar, mantener, optimizar y personalizar la seguridad e infraestructura del Sitio.</li>
            <li>Prevenir fraude, spam, abusos o accesos no autorizados.</li>
            <li>
              Enviar comunicaciones operativas, de seguridad y, previa autorización, comunicaciones comerciales
              o de marketing.
            </li>
            <li>Dar cumplimiento a obligaciones legales y requerimientos judiciales o administrativos.</li>
          </OL>
        </Clause>

        <Clause n="12" title="Compartición y transferencia de datos">
          <P>
            InfoCasa no vende ni comercializa las bases de datos personales a terceros. Los datos podrán ser
            compartidos únicamente en los siguientes escenarios:
          </P>
          <UL>
            <li>
              <strong>Con anunciantes y profesionales:</strong> Cuando el usuario completa voluntariamente un
              formulario para solicitar información sobre una propiedad o servicio. El anunciante será
              responsable del tratamiento posterior de los datos recibidos.
            </li>
            <li>
              <strong>Proveedores de servicios tecnológicos:</strong> Empresas de hosting, infraestructura en
              la nube, analítica, procesamiento de pagos o envío de correos que actúan por cuenta de InfoCasa.
              Cuando estos proveedores residan fuera de la República Argentina, se adoptarán las garantías
              exigidas para la transferencia internacional de datos.
            </li>
            <li>
              <strong>Requerimiento legal:</strong> Ante citación u orden fundada de autoridad judicial o
              administrativa competente.
            </li>
          </UL>
        </Clause>

        <Clause n="13" title="Política de cookies y tecnologías de seguimiento">
          <P>
            InfoCasa utiliza cookies propias y de terceros (así como identificadores analíticos) para mantener
            sesiones activas, recordar preferencias, analizar tráfico y segmentar publicidad.
          </P>
          <UL>
            <li>
              <strong>Control del usuario:</strong> El usuario puede configurar su navegador para rechazar o
              eliminar cookies. No obstante, la desactivación de cookies operativas puede afectar el correcto
              funcionamiento de determinadas secciones de la Plataforma.
            </li>
          </UL>
        </Clause>

        <Clause n="14" title="Derechos de los titulares y procedimiento ARCO">
          <P>
            De conformidad con la Ley 25.326, el titular de los datos personales tiene la facultad de ejercer
            los derechos de Acceso, Rectificación, Actualización y Supresión (ARCO) de sus datos de forma
            gratuita.
          </P>
          <UL>
            <li>
              <strong>Procedimiento:</strong> El titular deberá enviar una solicitud por escrito al correo{" "}
              <a className="font-semibold text-[#ff0019] hover:underline" href="mailto:soporte@infocasa.com.ar">
                soporte@infocasa.com.ar
              </a>
              , adjuntando copia de DNI/CUIT o documento que acredite su identidad.
            </li>
            <li>
              <strong>Plazos de respuesta:</strong> Las solicitudes de acceso se responderán en un plazo máximo
              de diez (10) días corridos; las de rectificación, actualización o supresión, en un plazo de cinco
              (5) días hábiles.
            </li>
          </UL>
          <Note>
            <strong>Órgano de control.</strong> "La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter
            de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos
            que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas
            vigentes en materia de protección de datos personales."
          </Note>
        </Clause>
      </Section>

      {/* ─── TÍTULO IV (compartido) ───────────────────────────────── */}
      <TituloIV />
    </LegalDoc>
  );
}
