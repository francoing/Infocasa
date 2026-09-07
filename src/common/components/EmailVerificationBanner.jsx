import React, { useState } from "react";
import { MailWarning, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

/**
 * Banner para usuarios logueados NO verificados (user.is_verified === false).
 * Ofrece reenviar el correo. Se autogatea: no renderiza si no aplica.
 */
export default function EmailVerificationBanner() {
  const { user, isAuthenticated, resendVerification } = useAuth();
  const toast = useToast();
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!isAuthenticated || !user || user.is_verified !== false || dismissed) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    try {
      await resendVerification();
      toast.success("Te reenviamos el correo de verificación. Revisá tu bandeja.");
    } catch (err) {
      toast.error(
        err.status === 429
          ? "Esperá unos minutos antes de reintentar."
          : "No pudimos reenviar el correo. Intentá de nuevo."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3 flex items-center gap-3 text-sm">
        <MailWarning className="w-5 h-5 flex-shrink-0 text-amber-600" />
        <p className="flex-1 font-medium">
          Verificá tu correo para activar tu cuenta. Revisá tu bandeja o reenviá el correo.
        </p>
        <button
          onClick={handleResend}
          disabled={sending}
          className="font-bold text-amber-800 hover:text-amber-950 underline disabled:opacity-50 whitespace-nowrap"
        >
          {sending ? "Enviando…" : "Reenviar correo"}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-amber-500 hover:text-amber-800"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
