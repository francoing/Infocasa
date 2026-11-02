import React, { useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { ChevronRight, ExternalLink, Check, Copy, Smartphone } from "lucide-react";

import facebookIcon from "../assets/facebook.svg";
import whatsappIcon from "../assets/whatsapp.svg";
import xIcon from "../assets/x.svg";
import instagramIcon from "../assets/instagram.svg";
import tiktokIcon from "../assets/tiktok.svg";
import linkedinIcon from "../assets/linkedin.svg";
import telegramIcon from "../assets/telegram.svg";

function buildShareUrl(platformId, { url, text }) {
  const encoded = {
    url: encodeURIComponent(url),
    text: encodeURIComponent(text),
    full: encodeURIComponent(`${text}\n${url}`),
  };

  const intents = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded.url}`,
    whatsapp: `https://wa.me/?text=${encoded.full}`,
    x: `https://twitter.com/intent/tweet?text=${encoded.text}&url=${encoded.url}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded.url}`,
    telegram: `https://t.me/share/url?url=${encoded.url}&text=${encoded.text}`,
    instagram: `https://www.instagram.com/`,
    tiktok: `https://www.tiktok.com/`,
  };

  return intents[platformId] || null;
}

const SOCIAL_PLATFORMS = [
  { id: "facebook", name: "Facebook", color: "bg-[#1877F2]", icon: facebookIcon },
  { id: "whatsapp", name: "WhatsApp", color: "bg-[#25D366]", icon: whatsappIcon },
  { id: "x", name: "X (Twitter)", color: "bg-black", icon: xIcon },
  { id: "instagram", name: "Instagram", color: "bg-[#E4405F]", icon: instagramIcon, isCopyOnly: true },
  { id: "tiktok", name: "TikTok", color: "bg-black", icon: tiktokIcon, isCopyOnly: true },
  { id: "linkedin", name: "LinkedIn", color: "bg-[#0A66C2]", icon: linkedinIcon },
  { id: "telegram", name: "Telegram", color: "bg-[#0088CC]", icon: telegramIcon },
];

// 👇 URL BASE DE LA API (BACKEND)
// En local: http://localhost:8000
// En producción: https://api.infocasa.com.ar
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.infocasa.com.ar";

export default function SharePage() {
  const { propertyId } = useParams();
  const { state } = useLocation();
  const [copiedId, setCopiedId] = useState(null);

  const propertyTitle = state?.propertyTitle || `Propiedad en InfoCasa #${propertyId}`;
  
  // 👇 El link de compartir apunta al BACKEND, no al frontend
  const propertyUrl = `${API_BASE_URL}/share/${propertyId}`;
  
  const shareText = `¡Mirá esta propiedad en InfoCasa! ${propertyTitle}`;

  const handleCopyLink = async (platformId) => {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setCopiedId(platformId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = propertyUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedId(platformId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleShare = async (platform) => {
    if (platform.isCopyOnly) {
      await handleCopyLink(platform.id);
      window.open(buildShareUrl(platform.id, {}), "_blank");
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: propertyTitle,
          text: shareText,
          url: propertyUrl,
        });
        return;
      } catch {}
    }

    const shareUrl = buildShareUrl(platform.id, { url: propertyUrl, text: shareText });
    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=500");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-10">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-8">
        <Link to="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/search" className="hover:text-blue-600 transition-colors">Propiedades</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-600 truncate">Compartir: {propertyTitle}</span>
      </div>

      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
          Compartir propiedad
        </h1>
        <p className="text-slate-500 font-medium">
          Elegí una red social para compartir{" "}
          <span className="font-bold text-slate-700">&ldquo;{propertyTitle}&rdquo;</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SOCIAL_PLATFORMS.map((platform) => {
          const isCopied = copiedId === platform.id;

          return (
            <button
              key={platform.id}
              onClick={() => handleShare(platform)}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all text-left w-full cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${platform.color} flex items-center justify-center shadow-sm flex-shrink-0`}>
                  <img src={platform.icon} alt={platform.name} className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 text-base leading-tight">{platform.name}</h3>
                  {platform.isCopyOnly && (
                    <p className={`text-xs font-bold mt-1 flex items-center gap-1.5 ${isCopied ? "text-green-600" : "text-slate-400"}`}>
                      {isCopied ? (
                        <><Check className="w-3.5 h-3.5" /> Link copiado, abriendo app...</>
                      ) : (
                        <><Smartphone className="w-3.5 h-3.5" /> Copiar link y abrir app</>
                      )}
                    </p>
                  )}
                </div>
                {!platform.isCopyOnly && (
                  <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-10 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          Link de compartir
        </p>
        <code className="text-sm text-slate-700 break-all">{propertyUrl}</code>
      </div>
    </div>
  );
}
