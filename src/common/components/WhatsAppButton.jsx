import React from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { trackWhatsApp } from "../../lib/tracking";
import { cn } from "../../lib/utils";

const WHATSAPP_NUMBER = "5493816334056";

/**
 * Botón de WhatsApp. Sin props = el flotante de soporte de InfoCasa (en todas las páginas).
 * Con `phone` + `variant="inline"` lo usa la InfoCasa Guía para contactar a un anunciante:
 * mismo evento `ic_whatsapp`, con `trackingParams` (ej. `{ section: "guia", guide_listing_id }`).
 */
export default function WhatsAppButton({
  phone = WHATSAPP_NUMBER,
  message,
  variant = "floating",
  label = "WhatsApp",
  trackingParams,
  className,
}) {
  const { pathname } = useLocation();
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  const whatsappUrl = `https://wa.me/${phone}${text}`;
  const onClick = () => trackWhatsApp(pathname, trackingParams);

  if (variant === "inline") {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={cn(
          "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 transition-all active:scale-95 shadow-lg shadow-green-500/20",
          className
        )}
      >
        <MessageCircle className="w-5 h-5" /> {label}
      </a>
    );
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      title="Chateá con nosotros por WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-green-500/30 hover:bg-green-600 hover:scale-110 hover:rotate-3 transition-all active:scale-95"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
