import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, CheckCircle2, Chrome, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import Layout from "../../../common/components/Layout";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register({
        name: `${name} ${lastName}`,
        email,
        password, // En un sistema real esto se hashearía en el backend
        avatar: "",
        role: "publisher"
      });
      navigate("/");
    } catch (err) {
      setError(err.message || "Error al crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[90vh] flex items-center justify-center px-6 py-12 hero-gradient">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl shadow-blue-600/5 border border-slate-100 p-10 lg:p-14"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Crea tu cuenta</h1>
            <p className="text-slate-500 text-sm font-medium">Únete a la red inmobiliaria más exclusiva del país.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center border border-red-100">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 ml-1">Nombre</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 bg-slate-50 outline-none transition-all placeholder:text-slate-400" 
                    placeholder="Juan"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 ml-1">Apellido</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 bg-slate-50 outline-none transition-all placeholder:text-slate-400" 
                  placeholder="Pérez"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 bg-slate-50 outline-none transition-all placeholder:text-slate-400" 
                  placeholder="juan@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 bg-slate-50 outline-none transition-all placeholder:text-slate-400" 
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 px-1">
              <input type="checkbox" className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600" id="terms" required />
              <label htmlFor="terms" className="text-xs text-slate-500 font-medium leading-relaxed">
                Acepto los <Link to="#" className="text-blue-600 font-bold hover:underline">Términos de Servicio</Link> y la <Link to="#" className="text-blue-600 font-bold hover:underline">Política de Privacidad</Link>.
              </label>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Empezar ahora <CheckCircle2 className="w-5 h-5" /></>}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-500 font-medium">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-blue-600 font-bold hover:underline">Inicia sesión</Link>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
