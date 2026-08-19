import React from "react";
import { Section, Clause, P, OL, UL } from "../components/LegalDoc";

/**
 * Datos identificatorios y canales de contacto. Encabeza ambas páginas legales.
 */
export function DatosIdentificatorios() {
  const filas = [
    ["Denominación / Titular", "InfoCasa — Actividad Unipersonal"],
    ["CUIT", "27-26638115-3"],
    ["Correo de atención / reclamos", "soporte@infocasa.com.ar · admin@infocasa.com.ar"],
    ["URL oficial", "www.infocasa.com.ar"],
    ["Contacto", "3812066967"],
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
          Datos identificatorios y canales de contacto
        </p>
      </div>
      <dl className="divide-y divide-slate-100">
        {filas.map(([k, v]) => (
          <div key={k} className="px-6 py-3 sm:flex sm:gap-4">
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500 sm:w-56 shrink-0">{k}</dt>
            <dd className="text-[15px] text-slate-700 mt-1 sm:mt-0 break-words">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * TÍTULO IV — Consumidores, Garantías, Seguridad y Jurisdicción.
 * Compartido por Términos y por la Política de privacidad (según el documento base).
 */
export function TituloIV() {
  return (
    <Section id="titulo-iv" title="Título IV — Consumidores, Garantías, Seguridad y Jurisdicción">
      <Clause n="15" title="Defensa del consumidor y contratación en línea">
        <P>
          En aquellas contrataciones donde InfoCasa comercialice sus propios servicios tecnológicos a
          usuarios finales con calidad de consumidores, resultarán aplicables la Ley N° 24.240 de Defensa
          del Consumidor y el Código Civil y Comercial de la Nación.
        </P>
        <OL>
          <li>
            <strong>Información clara:</strong> Los precios, duración de publicaciones y renovaciones se
            informarán de forma transparente de manera previa al cobro.
          </li>
          <li>
            <strong>Botón de Arrepentimiento / Baja:</strong> En los servicios contratados a distancia,
            InfoCasa mantendrá operativo un mecanismo o "Botón de Arrepentimiento" que permita revocar la
            contratación dentro de los plazos legales aplicables.
          </li>
        </OL>
      </Clause>

      <Clause n="16" title="Indemnidad y usos prohibidos">
        <UL>
          <li>
            <strong>Usos prohibidos:</strong> Se prohíbe expresamente el uso de robots, programas de
            extracción masiva (scraping), ingeniería inversa, inyección de código malicioso, suplantación
            de identidad o la publicación de avisos con fines ilícitos o de captación fraudulenta de dinero
            o datos (phishing).
          </li>
          <li>
            <strong>Cláusula de indemnidad:</strong> El anunciante, usuario o proveedor indemnizará y
            mantendrá indemne a InfoCasa, su titular y colaboradores ante cualquier reclamo, demanda,
            sanción administrativa o gasto judicial/extrajudicial derivado de la falsedad de sus
            publicaciones, infracción a derechos de propiedad intelectual, defectos en bienes u omisiones
            profesionales.
          </li>
        </UL>
      </Clause>

      <Clause n="17" title="Limitación de responsabilidad">
        <P>
          En la máxima medida permitida por las leyes imperativas aplicables, InfoCasa no será responsable
          por daños directos, indirectos, lucro cesante o pérdidas derivadas de:
        </P>
        <OL>
          <li>Contratos, señas o pagos efectuados a terceros anunciantes.</li>
          <li>Interrupciones técnicas, caídas de servidor o fallas en las redes de telecomunicaciones.</li>
          <li>Exactitud o actualización del contenido cargado por los usuarios.</li>
        </OL>
      </Clause>

      <Clause n="18" title="Marco aplicable y jurisdicción">
        <P>
          Este documento se rige íntegramente por la legislación de la República Argentina (Constitución
          Nacional, Código Civil y Comercial — Ley 26.994, Ley 24.240, Ley 25.326, Ley 11.723 de Propiedad
          Intelectual, Ley 22.400 de Seguros y normativa sectorial aplicable).
        </P>
        <UL>
          <li>
            <strong>Relaciones de consumo:</strong> En los reclamos entablados por consumidores, regirán los
            fueros imperativos de competencia dispuestos por la legislación de defensa del consumidor.
          </li>
          <li>
            <strong>Relaciones comerciales / profesionales:</strong> Para los casos no contemplados por
            normas imperativas de consumo, las partes se someten a la competencia de los Tribunales
            Ordinarios correspondientes al domicilio legal del titular de InfoCasa.
          </li>
        </UL>
      </Clause>
    </Section>
  );
}
