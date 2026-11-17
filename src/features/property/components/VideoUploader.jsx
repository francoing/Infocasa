import React, { useState, useRef, useEffect } from "react";
import { Film, X, Loader2, AlertTriangle } from "lucide-react";
import { MAX_VIDEOS, MAX_VIDEO_MB, pickVideoFiles, formatMb } from "../videoUpload.helpers";

/**
 * Selector de videos del formulario de propiedad. Los items son `File` (nuevos, se suben
 * al guardar) u objetos existentes `{ id, url, poster_url, status }`.
 * El backend los comprime a 720p; mientras tanto quedan en estado `processing`.
 */
export default function VideoUploader({ videos = [], onChange, maxVideos = MAX_VIDEOS }) {
  const [error, setError] = useState(null);

  // File → objectURL, creado una vez y revocado al desmontar (igual que ImageUploader).
  const urlCache = useRef(new Map());
  useEffect(() => {
    const cache = urlCache.current;
    return () => {
      for (const url of cache.values()) URL.revokeObjectURL(url);
      cache.clear();
    };
  }, []);

  const previewSrc = (file) => {
    if (!urlCache.current.has(file)) urlCache.current.set(file, URL.createObjectURL(file));
    return urlCache.current.get(file);
  };

  const handleFileInput = (e) => {
    const { accepted, error: pickError } = pickVideoFiles(Array.from(e.target.files), videos.length, maxVideos);
    setError(pickError);
    if (accepted.length > 0) onChange([...videos, ...accepted]);
    e.target.value = "";
  };

  const removeVideo = (index) => {
    setError(null);
    onChange(videos.filter((_, i) => i !== index));
  };

  const full = videos.length >= maxVideos;

  return (
    <div className="space-y-4">
      <label
        className={`relative border-2 border-dashed rounded-3xl p-8 transition-all flex flex-col items-center justify-center text-center ${
          full ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed" : "border-slate-200 hover:border-blue-400 bg-slate-50 cursor-pointer"
        }`}
      >
        <input type="file" multiple accept="video/*" onChange={handleFileInput} disabled={full} className="hidden" />
        <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-3">
          <Film className="w-8 h-8 text-blue-600" />
        </div>
        <p className="text-lg font-bold text-slate-900">{full ? "Llegaste al máximo de videos" : "Sumá videos de la propiedad"}</p>
        <p className="text-slate-500 text-sm mt-1">Los comprimimos automáticamente en calidad 720p</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3">
          MP4, MOV o WEBM hasta {MAX_VIDEO_MB}MB · máximo {maxVideos} videos ({videos.length}/{maxVideos}) · hasta 3 min
        </p>
      </label>

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

      {videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {videos.map((video, index) => (
            <div key={video instanceof File ? `file-${index}-${video.name}` : video.id} className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-900 aspect-video">
              <VideoTile video={video} src={video instanceof File ? previewSrc(video) : video.url} />
              <button
                type="button"
                onClick={() => removeVideo(index)}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg"
                aria-label="Quitar video"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VideoTile({ video, src }) {
  if (video instanceof File) {
    return (
      <>
        <video src={src} muted preload="metadata" className="w-full h-full object-cover" />
        <span className="absolute bottom-2 left-2 bg-blue-600 text-[10px] text-white font-black uppercase px-2 py-1 rounded-md">
          Nuevo · {formatMb(video.size)}
        </span>
      </>
    );
  }

  if (video.status === "ready") {
    return <video src={src} poster={video.poster_url || undefined} controls preload="none" className="w-full h-full object-cover" />;
  }

  const failed = video.status === "failed";
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white text-center px-4">
      {failed ? <AlertTriangle className="w-7 h-7 text-amber-400" /> : <Loader2 className="w-7 h-7 animate-spin text-blue-300" />}
      <p className="text-xs font-bold">
        {failed ? "No pudimos procesar este video. Quitalo y probá con otro archivo." : "Procesando video… estará visible en unos minutos."}
      </p>
    </div>
  );
}
