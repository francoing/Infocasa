import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Loader2, CheckCircle, QrCode, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutModal({ plan, onConfirm, onCancel }) {
  const [step, setStep] = useState('form'); // 'form', 'processing', 'success'
  const [method, setMethod] = useState('card'); // 'card', 'qr'
  
  const handlePay = (e) => {
    if (e) e.preventDefault();
    setStep('processing');
    
    // Simular procesamiento de pago
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onConfirm(plan.id);
      }, 2000);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
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
                  {method === 'card' ? <CreditCard className="w-6 h-6" /> : <QrCode className="w-6 h-6" />}
                </div>
                <h3 className="text-2xl font-black text-slate-900">Finalizar Compra</h3>
                <p className="text-slate-500 text-sm font-medium mt-1">Plan <span className="font-bold text-blue-600 uppercase">{plan.name}</span> - ${plan.price}/año</p>
              </div>

              {/* Method Selector */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl mb-6">
                <button 
                  onClick={() => setMethod('card')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${method === 'card' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <CreditCard className="w-4 h-4" /> Tarjeta
                </button>
                <button 
                  onClick={() => setMethod('qr')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${method === 'qr' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <QrCode className="w-4 h-4" /> QR MP
                </button>
              </div>

              <AnimatePresence mode="wait">
                {method === 'card' ? (
                  <motion.form 
                    key="card-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handlePay} 
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Número de Tarjeta</label>
                      <input required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none font-mono" placeholder="0000 0000 0000 0000" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none" placeholder="MM/AA" />
                      <input required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none" placeholder="CVC" />
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 shadow-xl transition-all mt-4">
                      Confirmar Pago
                    </button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="qr-section"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6 text-center"
                  >
                    <div className="p-6 bg-white border-4 border-blue-50 rounded-3xl inline-block shadow-inner">
                      {/* Generando un QR ficticio de Mercado Pago */}
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=mercadopago://payment?plan=${plan.id}&amount=${plan.price}`} 
                        alt="QR Mercado Pago" 
                        className="w-40 h-40"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-slate-900 flex items-center justify-center gap-2">
                         <Phone className="w-4 h-4 text-blue-600" /> Escaneá con la App de Mercado Pago
                      </p>
                      <p className="text-xs text-slate-400 font-medium px-8">Una vez realizado el pago, presioná el botón de abajo para activar tu plan.</p>
                    </div>
                    <button 
                      onClick={handlePay}
                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]"
                    >
                      Ya escaneé y pagué
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

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
              className="p-20 flex flex-col items-center justify-center text-center"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">¡Plan Activado!</h3>
              <p className="text-slate-500 text-sm mt-2">Gracias por confiar en EstatePro. Ya podés disfrutar de tus nuevos beneficios.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
