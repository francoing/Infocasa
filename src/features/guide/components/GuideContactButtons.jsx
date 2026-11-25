import React, { useState } from "react";
import { Globe, Mail, Phone, Share2 } from "lucide-react";
import WhatsAppButton from "@/common/components/WhatsAppButton";
import { SOCIAL_NETWORKS, socialUrl, whatsappDigits } from "@/hooks/guide.mappers";

const secondaryClass =
  "inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95";

/**
 * Botones de contacto de una publicación o perfil de la Guía: WhatsApp (evento `ic_whatsapp`
 * con sección guía), llamar, email, web, redes y compartir.
 */
export default function GuideContactButtons({ contact, title, shareUrl, trackingParams }) {
  const [copied, setCopied] = useState(false);
  const wa = whatsappDigits(contact?.whatsapp);
  const phone = contact?.phone?.trim();
  const socials = SOCIAL_NETWORKS.map((n) => ({ ...n, url: socialUrl(n.key, contact?.social?.[n.key]) })).filter((n) => n.url);
  const url = shareUrl || (typeof window !== "undefined" ? window.location.href : "");

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* el usuario canceló o no hay permiso de portapapeles */
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {wa && (
        <WhatsAppButton
          variant="inline"
          phone={wa}
          message={title ? `Hola, te contacto por "${title}" en InfoCasa Guía.` : undefined}
          trackingParams={trackingParams}
          className="w-full"
        />
      )}
      <div className="grid grid-cols-2 gap-2">
        {phone && (
          <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className={secondaryClass}>
            <Phone className="w-4 h-4" /> Llamar
          </a>
        )}
        {contact?.email && (
          <a href={`mailto:${contact.email}`} className={secondaryClass}>
            <Mail className="w-4 h-4" /> Email
          </a>
        )}
        {contact?.website && (
          <a href={contact.website} target="_blank" rel="noopener noreferrer" className={secondaryClass}>
            <Globe className="w-4 h-4" /> Sitio web
          </a>
        )}
        <button type="button" onClick={share} className={secondaryClass}>
          <Share2 className="w-4 h-4" /> {copied ? "¡Link copiado!" : "Compartir"}
        </button>
      </div>
      {socials.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {socials.map((s) => (
            <a
              key={s.key}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              {s.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
