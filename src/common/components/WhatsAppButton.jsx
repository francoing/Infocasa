import React from "react";
import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "549381414374";

export default function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Chateá con nosotros por WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-green-500/30 hover:bg-green-600 hover:scale-110 hover:rotate-3 transition-all active:scale-95"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
