import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Loader2, CheckCircle, QrCode, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutModal({ plan, onConfirm, onCancel }) {
  const [step, setStep] = useState('form'); // 'form', 'processing', 'success', 'error'
  const [method, setMethod] = useState('card'); // 'card', 'qr'
  const [errorMsg, setErrorMsg] = useState('');

  const handlePay = async (e) => {
    if (e) e.preventDefault();
    if (!plan?.id) {
      setErrorMsg('No se seleccionó un plan válido.');
      setStep('error');
      return;
    }
    setStep('processing');
    setErrorMsg('');

    try {
      await onConfirm(plan.id);
      // El caller cierra el modal (setShowCheckout(false)) y muestra toast en éxito
      // Por seguridad, si el modal sigue montado lo cerramos igual
      onCancel();
    } catch (err) {
      setErrorMsg(err.message || 'Error al procesar el pago. Intentalo de nuevo.');
      setStep('error');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative"
      >
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-10"
            >
              <div className="text-center mb-8">
                <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-4">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Finalizar Compra</h3>
                <p className="text-slate-500 text-sm font-medium mt-1">Plan <span className="font-bold text-blue-600 uppercase">{plan.name}</span></p>
              </div>

              {Number(plan.price) === 0 ? (
                <div className="space-y-6 text-center">
                  <p className="text-slate-600 text-sm font-medium px-4">
                    Estás por activar el plan gratuito. No se te realizará ningún cobro.
                  </p>
                  <button 
                    onClick={handlePay}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 shadow-xl transition-all active:scale-[0.98]"
                  >
                    Activar Plan Gratis
                  </button>
                </div>
              ) : (
                <div className="space-y-6 text-center">
                  <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-4">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span>Total a pagar:</span>
                      <span className="text-2xl font-black text-slate-900">${plan.price}/año</span>
                    </div>
                    <p className="text-xs text-slate-500 text-left leading-relaxed">
                      Serás redirigido de forma segura al sandbox de Mercado Pago para completar tu pago con tarjeta o saldo de prueba.
                    </p>
                  </div>
                  <button 
                    onClick={handlePay}
                    className="w-full bg-[#009EE3] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#008CD0] shadow-xl shadow-blue-500/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Pagar con Mercado Pago
                  </button>
                </div>
              )}

              <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Seguridad garantizada por Mercado Pago
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-20 flex flex-col items-center justify-center text-center"
            >
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
              <h3 className="text-xl font-bold text-slate-900">Verificando Pago...</h3>
              <p className="text-slate-500 text-sm mt-2">Estamos confirmando la transacción con Mercado Pago.</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-20 flex flex-col items-center justify-center text-center"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">¡Plan Activado!</h3>
              <p className="text-slate-500 text-sm mt-2">Gracias por confiar en InfoCasa. Ya podés disfrutar de tus nuevos beneficios.</p>
              <button
                onClick={onCancel}
                className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                Cerrar
              </button>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-10 flex flex-col items-center justify-center text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <X className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Error al procesar</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-xs">{errorMsg}</p>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep('form')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                  Intentar de nuevo
                </button>
                <button
                  onClick={onCancel}
                  className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
