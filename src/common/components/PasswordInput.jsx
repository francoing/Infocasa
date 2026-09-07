import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Input de contraseña con toggle de visibilidad (ojito). Acepta las props de un
 * <input> normal (value, onChange, placeholder, required, minLength…) más un
 * `leftIcon` opcional (ej: <Lock/> posicionado absoluto). El className controla
 * el padding: dejá lugar a la derecha (pr-12) para que el ojito no tape el texto.
 */
export default function PasswordInput({ leftIcon = null, className = "", ...props }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      {leftIcon}
      <input {...props} type={show ? "text" : "password"} className={className} />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        tabIndex={-1}
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}
