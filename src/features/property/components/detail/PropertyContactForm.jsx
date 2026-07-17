import React from "react";
import { CheckCircle2, MessageCircle, Phone } from "lucide-react";
import loadingIcon from "@/assets/img/Icono.png";

/** Card de contacto con el anunciante: datos del publisher + formulario de lead. */
export default function PropertyContactForm({
  publisher,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  submitSuccess,
  setSubmitSuccess,
  submitError,
}) {
  const setField = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Contactar Anunciante</h3>

      {publisher && (
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-base uppercase overflow-hidden border border-blue-200">
            {publisher.avatar ? <img src={publisher.avatar} className="w-full h-full object-cover" /> : publisher.name.charAt(0)}
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Inmobiliaria / Agente</p>
            <h4 className="font-bold text-slate-900 text-base leading-tight">{publisher.name}</h4>
            {publisher.phoneArea && publisher.phoneNumber && (
              <p className="text-xs text-slate-500 font-bold mt-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> ({publisher.phoneArea}) {publisher.phoneNumber}
              </p>
            )}
          </div>
        </div>
      )}

      {submitSuccess ? (
        <div className="p-6 bg-green-50 border border-green-200 text-green-700 rounded-3xl text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
          <h4 className="font-black uppercase text-sm tracking-widest">¡Consulta Enviada!</h4>
          <p className="text-xs font-medium">Hemos registrado tu contacto correctamente. El publicador se comunicará contigo a la brevedad.</p>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="text-xs font-bold underline text-green-700 hover:text-green-800 pt-2 block mx-auto"
          >
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {submitError && (
            <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">{submitError}</p>
          )}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nombre Completo</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={setField("name")}
              placeholder="Tu nombre"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all text-sm font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Correo Electrónico</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={setField("email")}
              placeholder="tu@email.com"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all text-sm font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Teléfono (Opcional)</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={setField("phone")}
              placeholder="Tu celular"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all text-sm font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Mensaje</label>
            <textarea
              required
              rows="4"
              value={formData.message}
              onChange={setField("message")}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all text-sm font-medium resize-none leading-relaxed"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <img src={loadingIcon} alt="" className="w-5 h-5 object-contain animate-heartbeat" /> : <MessageCircle className="w-5 h-5" />}
            Enviar Consulta
          </button>
        </form>
      )}
    </div>
  );
}
