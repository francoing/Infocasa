import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import Layout from "../../../common/components/Layout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await forgotPassword(email);
      setSuccess(res?.message || "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.");
      setEmail("");
    } catch (err) {
      if (err.errors) {
        const errorMessages = Object.values(err.errors).flat();
        setError(errorMessages.join(" "));
      } else {
        setError(err.message || "Hubo un problema al procesar tu solicitud. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 hero-gradient">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-blue-600/5 border border-slate-100 p-10 lg:p-14"
        >
          <div className="mb-8">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">¿Olvidaste tu contraseña?</h1>
            <p className="text-slate-500 text-sm font-medium">
              Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecerla.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center border border-red-100">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium text-center border border-emerald-100">
              {success}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 bg-slate-50 outline-none transition-all placeholder:text-slate-400" 
                  placeholder="nombre@ejemplo.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Enviar enlace <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
}
