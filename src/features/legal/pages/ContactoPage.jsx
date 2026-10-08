import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import Layout from "../../../common/components/Layout";
import { api } from "/src/api/api"; 

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
  const [enviado, setEnviado] = useState(false);
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
      // Usamos tu api.js. Automáticamente usará localhost:8000 en local, 
      // y la URL de producción cuando lo subas.
      // Asegúrate de que el archivo en el backend se llame contact.php
      await api.post("/contact.php", form);
      
      // Si llega aquí, la petición fue exitosa (status 200-299)
      setEnviado(true);
    } catch (error) {
      console.error("Error de envío:", error);
      alert("Hubo un error al enviar el mensaje. Por favor, intentá de nuevo o escribinos por WhatsApp.");
    }
  };

  return (
      <div className="w-full">
        {/* HERO — FONDO ROJO */}
        <section style={{ background: BRAND.red }}>
          <div className="max-w-5xl mx-auto px-6 py-16 md:py-20 text-center">
            <span className="inline-block bg-white/15 text-white border border-white/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 backdrop-blur-sm">
              Contacto
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
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
                <h2 className="text-2xl font-black text-[#4a4a49] mb-6">
                  Información de contacto
                </h2>
                <p className="text-[#4a4a49]/80 leading-relaxed">
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
                className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm"
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
                    <h3 className="text-2xl font-black text-[#4a4a49] mb-2">
                      ¡Mensaje enviado!
                    </h3>
                    <p className="text-[#4a4a49]/70">
                      Te vamos a responder a la brevedad.
                    </p>
                    <button
                      onClick={() => {
                        setEnviado(false);
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
                    <h3 className="text-xl font-black text-[#4a4a49] mb-2">
                      Enviá tu consulta
                    </h3>

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
                        <label className="block text-xs font-black uppercase tracking-wider text-[#4a4a49] mb-2">
                          Asunto
                        </label>
                        <select
                          name="asunto"
                          value={form.asunto}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-[#4a4a49] bg-white focus:outline-none focus:border-[#ff0019] transition-colors"
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
                      <label className="block text-xs font-black uppercase tracking-wider text-[#4a4a49] mb-2">
                        Mensaje *
                      </label>
                      <textarea
                        name="mensaje"
                        value={form.mensaje}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Contanos en qué podemos ayudarte..."
                        className="w-full px-4 py-3 rounded-xl border text-sm text-[#4a4a49] resize-none focus:outline-none transition-colors"
                        style={{
                          borderColor: errores.mensaje
                            ? BRAND.red
                            : "rgb(226,232,240)",
                        }}
                      />
                      {errores.mensaje && (
                        <p
                          className="text-xs mt-1 font-bold"
                          style={{ color: BRAND.red }}
                        >
                          {errores.mensaje}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 text-white px-6 py-4 rounded-xl text-sm font-black transition-all active:scale-[0.98]"
                      style={{
                        background: BRAND.red,
                        boxShadow: `0 10px 25px -8px ${BRAND.red}80`,
                      }}
                    >
                      <Send className="w-4 h-4" /> Enviar mensaje
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
        <p className="text-xs font-black uppercase tracking-wider text-[#4a4a49]/60 mb-1">
          {title}
        </p>
        <p className="text-[#4a4a49] font-bold">{value}</p>
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
      <label className="block text-xs font-black uppercase tracking-wider text-[#4a4a49] mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border text-sm text-[#4a4a49] focus:outline-none transition-colors"
        style={{
          borderColor: error ? BRAND.red : "rgb(226,232,240)",
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