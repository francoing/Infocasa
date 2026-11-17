import React from "react";

/**
 * Videos de la propiedad en la ficha pública. Solo se muestran los ya comprimidos
 * (`ready`); `preload="none"` evita descargar el video hasta que el usuario lo reproduce.
 */
export default function PropertyVideos({ videos = [] }) {
  const ready = videos.filter((v) => v.status === "ready" && v.url);
  if (ready.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
        {ready.length === 1 ? "Video de la Propiedad" : "Videos de la Propiedad"}
      </h2>
      <div className={`grid gap-4 ${ready.length > 1 ? "md:grid-cols-2" : ""}`}>
        {ready.map((video) => {
          const vertical = video.height > video.width;
          return (
            <div
              key={video.id}
              className={`rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-black flex items-center justify-center ${vertical ? "max-h-[36rem]" : ""}`}
            >
              <video
                src={video.url}
                poster={video.poster_url || undefined}
                controls
                playsInline
                preload="none"
                className={vertical ? "h-full max-h-[36rem] w-auto" : "w-full aspect-video"}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
