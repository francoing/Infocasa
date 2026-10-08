// src/hooks/useContactForm.js
import { useState } from "react";
import { api } from "../api/api"; // Ajusta la ruta si tu api.js está en otro lado

export function useContactForm() {
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const enviar = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await api.post("/contact.php", formData);
      setEnviado(true);
    } catch (err) {
      console.error("Error de envío:", err);
      setError(err.message || "Error al enviar el mensaje");
      throw err; // Re-lanzamos para que la página pueda mostrar un alert si quiere
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