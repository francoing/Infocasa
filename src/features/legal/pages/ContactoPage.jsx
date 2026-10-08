import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import Layout from "../../../common/components/Layout";
import { useContactForm } from "../../../hooks/useContactForm";

const BRAND = {
  red: "#ff0019",
  gold: "#ffda31",
  gray: "#4a4a49",
};

export default function ContactoPage() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    asunto: "Consulta general",
    mensaje: "",
  });
  
  // Usamos el hook en lugar de importar 'api' directamente
  const { enviado, loading, error: apiError, enviar, reset } = useContactForm();
  const [errores, setErrores] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errores[name]) {
      setErrores((er) => ({ ...er, [name]: null }));
    }
  };

  const validar = () => {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = "Ingresá tu nombre";
    if (!form.email.trim()) errs.email = "Ingresá tu email";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      errs.email = "Email inválido";
    if (!form.mensaje.trim()) errs.mensaje = "Escribí tu mensaje";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validar();
    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      return;
    }

    try {
      await enviar(form);
    } catch (error) {
      alert("Hubo un error al enviar el mensaje. Por favor, intentá de nuevo o escribinos por WhatsApp.");
    }
  };

  return (
      <div className="w-full bg-white dark:bg-[#121212] transition-colors duration-300">
        {/* HERO — FONDO ROJO */}
        <section style={{ background: BRAND.red }}>
          <div className="max-w-5xl mx-auto px-6 py-16 md:py-20 text-center">
            <span className="inline-block bg-white/15 text-white border border-white/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 backdrop-blur-sm">
              Contacto
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
              Hablemos
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto font-medium">
              ¿Tenés consultas, sugerencias o querés publicar tu propiedad?
              Escribinos y te respondemos a la brevedad.
            </p>
          </div>
        </section>

        {/* CONTENIDO */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* DATOS DE CONTACTO */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#4a4a49] dark:text-gray-100 mb-6">
                  Información de contacto
                </h2>
                <p className="text-[#4a4a49]/80 dark:text-gray-300 leading-relaxed">
                  Podés escribirnos por cualquiera de estos medios. Nuestro
                  equipo responde de lunes a viernes.
                </p>
              </div>

              <ContactItem
                icon={<Mail className="w-5 h-5" />}
                title="Email"
                value="infocasa.admin@gmail.com"
                href="mailto:infocasa.admin@gmail.com"
              />
              <ContactItem
                icon={<Phone className="w-5 h-5" />}
                title="WhatsApp"
                value="+54 9 3816 33-4056"
                href="https://wa.me/5493816334056"
              />
              <ContactItem
                icon={<MapPin className="w-5 h-5" />}
                title="Zona"
                value="NOA — Noroeste Argentino"
              />
              <ContactItem
                icon={<Clock className="w-5 h-5" />}
                title="Horario"
                value="Lunes a viernes, 9 a 18 h"
              />
            </div>

            {/* FORMULARIO */}
            <div className="lg:col-span-3">
              <div
                className="bg-white dark:bg-[#1e1e1e] rounded-3xl border border-slate-200 dark:border-gray-700 p-6 md:p-8 shadow-sm transition-colors duration-300"
                style={{ borderTop: `4px solid ${BRAND.red}` }}
              >
                {enviado ? (
                  <div className="text-center py-12">
                    <div
                      className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
                      style={{ background: `${BRAND.gold}40`, color: BRAND.red }}
                    >
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-[#4a4a49] dark:text-gray-100 mb-2">
                      ¡Mensaje enviado!
                    </h3>
                    <p className="text-[#4a4a49]/70 dark:text-gray-400">
                      Te vamos a responder a la brevedad.
                    </p>
                    <button
                      onClick={() => {
                        reset(); // Limpia el estado del hook
                        setForm({
                          nombre: "",
                          email: "",
                          telefono: "",
                          asunto: "Consulta general",
                          mensaje: "",
                        });
                      }}
                      className="mt-6 text-sm font-bold hover:underline"
                      style={{ color: BRAND.red }}
                    >
                      Enviar otro mensaje
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h3 className="text-xl font-black text-[#4a4a49] dark:text-gray-100 mb-2">
                      Enviá tu consulta
                    </h3>

                    {/* Mensaje de error de la API si falla el envío */}
                    {apiError && (
                      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl border border-red-200 dark:border-red-800 text-sm font-medium mb-4">
                        {apiError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        label="Nombre completo *"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        error={errores.nombre}
                        placeholder="Juan Pérez"
                      />
                      <Field
                        label="Email *"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        error={errores.email}
                        placeholder="juan@ejemplo.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        label="Teléfono"
                        name="telefono"
                        value={form.telefono}
                        onChange={handleChange}
                        placeholder="+54 11 1234-5678"
                      />
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-[#4a4a49] dark:text-gray-300 mb-2">
                          Asunto
                        </label>
                        <select
                          name="asunto"
                          value={form.asunto}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 text-sm text-[#4a4a49] dark:text-gray-200 bg-white dark:bg-[#2a2a2a] focus:outline-none focus:border-[#ff0019] transition-colors"
                        >
                          <option>Consulta general</option>
                          <option>Publicar propiedad</option>
                          <option>Reportar un problema</option>
                          <option>Sugerencia</option>
                          <option>Prensa</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-[#4a4a49] dark:text-gray-300 mb-2">
                        Mensaje *
                      </label>
                      <textarea
                        name="mensaje"
                        value={form.mensaje}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Contanos en qué podemos ayudarte..."
                        className="w-full px-4 py-3 rounded-xl border text-sm bg-white dark:bg-[#2a2a2a] text-[#4a4a49] dark:text-gray-200 border-slate-200 dark:border-gray-600 resize-none focus:outline-none focus:border-[#ff0019] transition-colors"
                        style={{
                          borderColor: errores.mensaje ? BRAND.red : undefined,
                        }}
                      />
                      {errores.mensaje && (
                        <p className="text-xs mt-1 font-bold" style={{ color: BRAND.red }}>
                          {errores.mensaje}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center gap-2 text-white px-6 py-4 rounded-xl text-sm font-black transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: BRAND.red,
                        boxShadow: `0 10px 25px -8px ${BRAND.red}80`,
                      }}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Enviar mensaje
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
  );
}

/* === Sub-componentes === */

function ContactItem({ icon, title, value, href }) {
  const content = (
    <div className="flex items-start gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${BRAND.gold}40`, color: BRAND.red }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-[#4a4a49]/60 dark:text-gray-400 mb-1">
          {title}
        </p>
        <p className="text-[#4a4a49] dark:text-gray-200 font-bold">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block hover:opacity-80 transition-opacity">
        {content}
      </a>
    );
  }
  return content;
}

function Field({ label, name, value, onChange, error, type = "text", placeholder }) {
  return (
    <div>
      <label className="block text-xs font-black uppercase tracking-wider text-[#4a4a49] dark:text-gray-300 mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border text-sm bg-white dark:bg-[#2a2a2a] text-[#4a4a49] dark:text-gray-200 border-slate-200 dark:border-gray-600 focus:outline-none focus:border-[#ff0019] transition-colors"
        style={{
          borderColor: error ? BRAND.red : undefined,
        }}
      />
      {error && (
        <p className="text-xs mt-1 font-bold" style={{ color: BRAND.red }}>
          {error}
        </p>
      )}
    </div>
  );
}