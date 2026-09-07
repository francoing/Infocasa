import { motion, AnimatePresence } from "framer-motion";
import { MapPin, LocateOff, X } from "lucide-react";
import Loader from "../../../common/components/Loader";

/**
 * LocationGateModal — Modal que guía al usuario en la verificación de provincia.
 *
 * Estados:
 *   idle      → pide permiso de geolocalización
 *   checking  → spinner mientras se verifica
 *   allowed   → ubicación verificada (cierra automáticamente)
 *   blocked   → usuario fuera de Tucumán/Santiago del Estero
 *   denied    → el navegador denegó el permiso de ubicación
 *   error     → no se pudo verificar
 *
 * El backdrop SOLO cierra en blocked | denied | error: durante `checking` queda
 * bloqueado para evitar la race con el callback asíncrono de getCurrentPosition
 * (si el usuario cierra y después otorga el permiso, el resultado allowed se
 * pierde con el modal cerrado). La X es visible en idle | blocked | denied | error.
 */
export default function LocationGateModal({ open, status, province, error, onAccept, onClose }) {
  const canCloseViaBackdrop = status === "blocked" || status === "denied" || status === "error";
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={canCloseViaBackdrop ? onClose : undefined}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-8 w-full max-w-[400px] text-center"
          >
            {/* Close (solo visible en idle/blocked/denied/error) */}
            {(status === "idle" || status === "blocked" || status === "denied" || status === "error") && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            )}

            {/* ——— IDLE ——— */}
            {status === "idle" && (
              <>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <MapPin className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Activá tu ubicación</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Necesitamos saber tu ubicación para mostrarte propiedades disponibles cerca de vos.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-[0.98]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={onAccept}
                    className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20"
                  >
                    Aceptar
                  </button>
                </div>
              </>
            )}

            {/* ——— CHECKING ——— */}
            {status === "checking" && (
              <>
                <Loader inline className="mb-5" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Verificando ubicación</h3>
                <p className="text-slate-400 text-sm">Un momento por favor...</p>
              </>
            )}

            {/* ——— BLOCKED ——— */}
            {status === "blocked" && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <MapPin className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Fuera de zona</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  {province && (
                    <>
                      Actualmente te encuentras en <strong>{province}</strong>.{" "}
                    </>
                  )}
                  Esta aplicación solo está disponible para las provincias de{" "}
                  <strong>Tucumán</strong> y <strong>Santiago del Estero</strong>, Argentina.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20"
                >
                  Entendido
                </button>
              </>
            )}

            {/* ——— DENIED ——— */}
            {status === "denied" && (
              <>
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <LocateOff className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Permiso de ubicación denegado</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Bloqueaste el permiso de ubicación en tu navegador, por lo que no pudimos
                  verificar tu provincia. Para volver a intentar, activá el permiso desde los
                  ajustes del navegador y buscá nuevamente.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20"
                >
                  Entendido
                </button>
              </>
            )}

            {/* ——— ERROR ——— */}
            {status === "error" && (
              <>
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <MapPin className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No pudimos verificar tu ubicación</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  {error ||
                    "Ocurrió un error al obtener tu ubicación. Asegurate de tener los servicios de ubicación activados e intentá de nuevo."}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20"
                >
                  Entendido
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
