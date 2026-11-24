import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Building2, Calendar, ArrowRight, X } from "lucide-react";
import Logo from "../../../common/components/Logo";

const STORAGE_KEY = "infocasa_welcome_seen";

const hasSeenWelcome = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const markWelcomeSeen = () => {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Sin storage (modo privado/bloqueado): se vuelve a mostrar en la próxima visita.
  }
};

/**
 * WelcomeModal — pop up de bienvenida del Home con invitación al Plan Fundador.
 *
 * Se muestra UNA vez por navegador (flag `infocasa_welcome_seen` en localStorage) y
 * solo cuando `enabled` es true (el Home lo desactiva para usuarios logueados, porque
 * /plan-fundador los redirige a /profile). Cualquier cierre (X, backdrop, "Seguir
 * explorando" o el CTA) marca el flag.
 */
export default function WelcomeModal({ enabled = true }) {
  const [open, setOpen] = useState(() => enabled && !hasSeenWelcome());

  useEffect(() => {
    if (!enabled) setOpen(false);
  }, [enabled]);

  const close = () => {
    markWelcomeSeen();
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[440px] max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar"
              className="absolute top-3 right-3 p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            <div className="px-6 pt-8 pb-5 sm:px-8 text-center">
              <Logo className="mx-auto mb-5" />
              <h2 id="welcome-modal-title" className="text-2xl font-black text-slate-900 mb-2">
                ¡Bienvenido a Infocasa!
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                El nuevo portal inmobiliario del NOA, especializado en Tucumán. Encontrá tu próximo
                hogar o publicá tu propiedad en venta o alquiler.
              </p>
            </div>

            <div className="mx-4 sm:mx-6 mb-6 rounded-2xl bg-[#0a192f] p-5 text-left">
              <span className="inline-flex items-center gap-1.5 bg-[#ffda31] text-[#0a192f] px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase">
                <Crown className="w-3.5 h-3.5" /> Plan Fundador
              </span>
              <p className="mt-3 text-white font-black text-lg leading-snug">
                ¿Tenés una inmobiliaria? Sumate entre las primeras de Infocasa.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 border border-[#ffda31] text-white text-xs font-bold px-3 py-2 rounded-xl">
                  <Building2 className="w-4 h-4 text-[#ffda31]" /> Hasta 200 propiedades
                </span>
                <span className="inline-flex items-center gap-2 border border-[#ffda31] text-white text-xs font-bold px-3 py-2 rounded-xl">
                  <Calendar className="w-4 h-4 text-[#ffda31]" /> 6 meses sin costo
                </span>
              </div>
              <Link
                to="/plan-fundador"
                onClick={close}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-[#ff0019] text-white py-3 rounded-xl font-black text-sm hover:bg-red-700 transition-all active:scale-[0.98] shadow-lg shadow-red-500/20"
              >
                Quiero mi Plan Fundador <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="px-6 pb-6 sm:px-8">
              <button
                type="button"
                onClick={close}
                className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-[0.98]"
              >
                Seguir explorando
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
