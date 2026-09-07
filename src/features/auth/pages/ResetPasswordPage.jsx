import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import Layout from "../../../common/components/Layout";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { resetPassword } = useAuth();

  useEffect(() => {
    if (!token || !email) {
      setError("El enlace de recuperación es inválido o ha expirado. Por favor, solicita uno nuevo.");
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !email) {
      setError("Enlace de recuperación inválido.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      setSuccess(res?.message || "Contraseña restablecida exitosamente. Redirigiendo...");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      if (err.errors) {
        const errorMessages = Object.values(err.errors).flat();
        setError(errorMessages.join(" "));
      } else {
        setError(err.message || "Hubo un problema al restablecer tu contraseña. Intenta de nuevo.");
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
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Restablecer contraseña</h1>
            <p className="text-slate-500 text-sm font-medium">
              Elige una contraseña nueva y segura para tu cuenta.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center border border-red-100">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center space-y-6 py-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
              </div>
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-100">
                {success}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Serás redirigido al inicio de sesión en unos instantes...
              </p>
              <Link 
                to="/login"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors w-full"
              >
                Ir a Iniciar Sesión ahora
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 ml-1">Nueva Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 bg-slate-50 outline-none transition-all placeholder:text-slate-400" 
                    placeholder="••••••••"
                    required
                    disabled={loading || !token || !email}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 ml-1">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 bg-slate-50 outline-none transition-all placeholder:text-slate-400" 
                    placeholder="••••••••"
                    required
                    disabled={loading || !token || !email}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading || !token || !email}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Guardar nueva contraseña"
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
