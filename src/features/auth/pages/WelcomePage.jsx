import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, Home } from "lucide-react";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-slate-50">
      <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-10 md:p-16 text-center space-y-8">
        
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-slate-900">¡Bienvenido a InfoCasa!</h1>
          <p className="text-lg text-slate-500 font-medium">
            Tu cuenta ha sido creada con éxito. Ya estás un paso más cerca de publicar tu propiedad.
          </p>
        </div>

        <div className="bg-[#ffda31]/10 p-6 rounded-2xl border border-[#ffda31]/30 max-w-md mx-auto space-y-4">
          <Home className="w-8 h-8 text-[#0a192f] mx-auto" />
          <h3 className="font-bold text-[#0a192f]">¿Listo para publicar?</h3>
          <p className="text-sm text-slate-600">
            Publicá tu propiedad gratis en menos de 2 minutos y empezá a recibir consultas.
          </p>
          <Link
            to="/dashboard/properties/create"
            className="inline-flex items-center justify-center gap-2 w-full bg-[#ff0019] text-white px-6 py-4 rounded-xl font-black text-lg hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
          >
            Publicar mi propiedad ahora <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button 
            onClick={() => navigate("/dashboard")} 
            className="text-slate-400 font-bold hover:text-slate-600 transition-colors text-sm"
          >
            Ir a mi panel de control
          </button>
        </div>

      </div>
    </div>
  );
}
