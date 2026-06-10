import React, { useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { ChevronRight, ExternalLink, Check, Copy } from "lucide-react";
import Layout from "@/common/components/Layout";

/* ---------- Social Brand Icons (imported as images) ---------- */
import facebookIcon from "../assets/facebook.svg";
import whatsappIcon from "../assets/whatsapp.svg";
import xIcon from "../assets/x.svg";
import instagramIcon from "../assets/instagram.svg";
import tiktokIcon from "../assets/tiktok.svg";
import linkedinIcon from "../assets/linkedin.svg";
import telegramIcon from "../assets/telegram.svg";
import youtubeIcon from "../assets/youtube.svg";

/* ---------- Share Intent URLs ---------- */

function buildShareUrl(platformId, { url, text }) {
  const encoded = {
    url: encodeURIComponent(url),
    text: encodeURIComponent(text),
    full: encodeURIComponent(`${text}\n${url}`),
  };

  const intents = {
    facebook:  `https://www.facebook.com/sharer/sharer.php?u=${encoded.url}`,
    whatsapp:  `https://wa.me/?text=${encoded.full}`,
    x:         `https://twitter.com/intent/tweet?text=${encoded.text}&url=${encoded.url}`,
    linkedin:  `https://www.linkedin.com/sharing/share-offsite/?url=${encoded.url}`,
    telegram:  `https://t.me/share/url?url=${encoded.url}&text=${encoded.text}`,
  };

  return intents[platformId] || null;
}

function canShareDirectly(platformId) {
  return ["facebook", "whatsapp", "x", "linkedin", "telegram"].includes(platformId);
}

/* ---------- Platform Config ---------- */

const SOCIAL_PLATFORMS = [
  { id: "facebook",  name: "Facebook",    color: "bg-[#1877F2]", icon: facebookIcon },
  { id: "whatsapp",  name: "WhatsApp",    color: "bg-[#25D366]", icon: whatsappIcon },
  { id: "x",         name: "X (Twitter)", color: "bg-black",     icon: xIcon },
  { id: "instagram", name: "Instagram",   color: "bg-[#E4405F]", icon: instagramIcon, noDirectShare: true },
  { id: "tiktok",    name: "TikTok",      color: "bg-black",     icon: tiktokIcon,    noDirectShare: true },
  { id: "linkedin",  name: "LinkedIn",    color: "bg-[#0A66C2]", icon: linkedinIcon },
  { id: "telegram",  name: "Telegram",    color: "bg-[#0088CC]", icon: telegramIcon },
  { id: "youtube",   name: "YouTube",     color: "bg-[#FF0000]", icon: youtubeIcon,   noDirectShare: true },
];

export default function SharePage() {
  const { propertyId } = useParams();
  const { state } = useLocation();
  const [copiedId, setCopiedId] = useState(null);

  const propertyTitle = state?.propertyTitle || `Propiedad en InfoCasa #${propertyId}`;
  const propertyUrl = propertyId
    ? `${window.location.origin}/property/${propertyId}`
    : null;

  const shareText = `¡Mirá esta propiedad en InfoCasa! ${propertyTitle}`;

  const handleCopyLink = async (platformId) => {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setCopiedId(platformId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
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

  const handleShare = (platformId) => {
    const shareUrl = buildShareUrl(platformId, { url: propertyUrl, text: shareText });
    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=500");
    }
  };

  if (!propertyUrl) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-6 lg:px-12 py-20 text-center">
          <h1 className="text-3xl font-black text-slate-900 mb-4">Sin propiedad seleccionada</h1>
          <p className="text-slate-500">Seleccioná una propiedad para poder compartirla.</p>
          <Link to="/" className="mt-6 inline-block text-blue-600 font-bold hover:underline">Volver al inicio</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-8">
          <Link to="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/search" className="hover:text-blue-600 transition-colors">Propiedades</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-600 truncate">Compartir: {propertyTitle}</span>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
            Compartir propiedad
          </h1>
          <p className="text-slate-500 font-medium">
            Elegí una red social para compartir <span className="font-bold text-slate-700">&ldquo;{propertyTitle}&rdquo;</span>
          </p>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SOCIAL_PLATFORMS.map((platform) => {
            const isCopied = copiedId === platform.id;

            const handleClick = platform.noDirectShare
              ? () => handleCopyLink(platform.id)
              : () => handleShare(platform.id);

            return (
              <button
                key={platform.id}
                onClick={handleClick}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all text-left w-full cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${platform.color} flex items-center justify-center shadow-sm flex-shrink-0`}>
                    <img src={platform.icon} alt={platform.name} className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-base leading-tight">{platform.name}</h3>
                    {platform.noDirectShare && (
                      <p className={`text-xs font-bold mt-1 flex items-center gap-1.5 ${isCopied ? "text-green-600" : "text-slate-400"}`}>
                        {isCopied ? <><Check className="w-3.5 h-3.5" /> Link copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar enlace</>}
                      </p>
                    )}
                  </div>
                  {!platform.noDirectShare && (
                    <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>


      </div>
    </Layout>
  );
}
