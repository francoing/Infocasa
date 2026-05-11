import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, ArrowRight, Chrome, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import Layout from "../../../common/components/Layout";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Credenciales inválidas. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    setEmail(role === 'admin' ? 'admin@inmob.com' : 'pedro@inmob.com');
    setPassword('123456');
    // El usuario tendrá que hacer click en el botón de login
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 hero-gradient">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-blue-600/5 border border-slate-100 p-10 lg:p-14"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Bienvenido de nuevo</h1>
            <p className="text-slate-500 text-sm font-medium">Ingresa tus credenciales para acceder a tu cuenta.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center border border-red-100">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
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
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-slate-900">Contraseña</label>
                <Link to="#" className="text-xs font-bold text-blue-600 hover:underline">¿Olvidaste tu contraseña?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 bg-slate-50 outline-none transition-all placeholder:text-slate-400" 
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Iniciar Sesión <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleQuickLogin('publisher')}
              className="text-[10px] uppercase tracking-widest font-bold py-2 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              Demo Publisher
            </button>
            <button 
              onClick={() => handleQuickLogin('admin')}
              className="text-[10px] uppercase tracking-widest font-bold py-2 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              Demo Admin
            </button>
          </div>

          <p className="mt-10 text-center text-sm text-slate-500 font-medium">
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className="text-blue-600 font-bold hover:underline">Regístrate gratis</Link>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
