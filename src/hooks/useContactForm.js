// src/hooks/useContactForm.js
import { useState } from "react";
import { api } from "../api/api";

export function useContactForm() {
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const enviar = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      // 👇 Ruta correcta de Laravel
      await api.post("/contact", formData);
      setEnviado(true);
    } catch (err) {
      console.error("Error de envío:", err);
      setError(err.message || "Error al enviar el mensaje");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setEnviado(false);
    setError(null);
  };

  return { enviado, loading, error, enviar, reset };
}
