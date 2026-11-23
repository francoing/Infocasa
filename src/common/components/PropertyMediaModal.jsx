import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// Videos que se pueden reproducir: mismo criterio que la ficha pública (PropertyVideos).
export const readyVideos = (property) =>
  Array.isArray(property?.videos) ? property.videos.filter((v) => v.status === "ready" && v.url) : [];

const TITLES = { video: "Video de la propiedad", floorPlan: "Plano de la propiedad" };

function VideoContent({ videos }) {
  const [current, setCurrent] = useState(0);
  const video = videos[current];

  return (
    <div className="space-y-3">
      <video
        key={video.id ?? current}
        src={video.url}
        poster={video.poster_url || undefined}
        controls
        autoPlay
        playsInline
        className="w-full max-h-[70vh] rounded-xl bg-black"
      />
      {videos.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Elegir video">
          {videos.map((v, i) => (
            <button
              key={v.id ?? i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-pressed={i === current}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors ${
                i === current ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Video {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FloorPlanContent({ property }) {
  return (
    <img
      src={property.floorPlanUrl}
      alt={`Plano de ${property.title || "la propiedad"}`}
      className="w-full max-h-[75vh] object-contain rounded-xl bg-slate-50"
    />
  );
}

/**
 * Pop-up de medios de la tarjeta: el video subido a la propiedad o la imagen del plano.
 * Se monta en un portal (fuera del <Link> de la tarjeta) para que sus clics no naveguen.
 * Cierra con la X, clic en el fondo o Escape.
 */
export default function PropertyMediaModal({ type, property, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const videos = readyVideos(property);
  if (type === "video" && videos.length === 0) return null;
  if (type === "floorPlan" && !property?.floorPlanUrl) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      data-testid="media-modal-backdrop"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={TITLES[type]}
        className="relative w-full max-w-4xl bg-white rounded-2xl p-4 sm:p-6 shadow-2xl max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-black text-slate-900 truncate">{TITLES[type]}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {type === "video" ? <VideoContent videos={videos} /> : <FloorPlanContent property={property} />}
      </div>
    </div>,
    document.body,
  );
}
