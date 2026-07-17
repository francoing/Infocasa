import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Info } from "lucide-react";
import Layout from "../../../common/components/Layout";

/**
 * Aterrizaje tras la redirección del backend: {FRONTEND_URL}/email-verified?status=success|already.
 * El backend ya verificó por el link firmado; esta página solo comunica el resultado.
 */
export default function EmailVerifiedPage() {
  const [params] = useSearchParams();
  const status = params.get("status");

  let content;
  if (status === "success") {
    content = {
      icon: <CheckCircle2 className="w-16 h-16 text-green-500" />,
      title: "¡Correo verificado!",
      msg: "Tu cuenta quedó activada. Ya podés usar todas las funciones de InfoCasa.",
    };
  } else if (status === "already") {
    content = {
      icon: <Info className="w-16 h-16 text-blue-500" />,
      title: "Tu correo ya estaba verificado",
      msg: "No hace falta hacer nada más. Podés continuar.",
    };
  } else {
    content = {
      icon: <Info className="w-16 h-16 text-slate-400" />,
      title: "Verificación de correo",
      msg: "Si llegaste desde el enlace del correo, tu verificación ya fue procesada.",
    };
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <div className="flex justify-center mb-6">{content.icon}</div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">{content.title}</h1>
        <p className="text-slate-500 mb-8">{content.msg}</p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            Ir al tablero
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </Layout>
  );
}
