// Helpers puros de la subida de videos (ver spec backend properties/property_videos).
// Los límites espejan PropertyVideoUploadService del backend.

export const MAX_VIDEOS = 3;
export const MAX_VIDEO_MB = 200;
export const MAX_VIDEO_BYTES = MAX_VIDEO_MB * 1024 * 1024;
// 5 MB por parte: el nginx de producción corta en 20 MB y PHP en 50 MB.
export const VIDEO_CHUNK_BYTES = 5 * 1024 * 1024;

/** Rangos [start, end) en los que se parte un archivo de `size` bytes. */
export const chunkRanges = (size, chunkSize = VIDEO_CHUNK_BYTES) => {
  if (!size || size <= 0) return [];
  const ranges = [];
  for (let start = 0; start < size; start += chunkSize) {
    ranges.push([start, Math.min(start + chunkSize, size)]);
  }
  return ranges;
};

/** UUID v4 para identificar la subida (crypto.randomUUID solo existe en contextos seguros). */
export const newUploadId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};

/**
 * Filtra los archivos elegidos: solo videos, hasta MAX_VIDEO_MB y respetando el cupo.
 * Devuelve los aceptados y un mensaje de error para mostrar (o null).
 */
export const pickVideoFiles = (files, currentCount, maxVideos = MAX_VIDEOS) => {
  const accepted = [];
  let error = null;
  for (const file of files) {
    if (!file.type?.startsWith("video/")) {
      error = "Solo se pueden subir videos (MP4, MOV o WEBM).";
      continue;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      error = `«${file.name}» pesa más de ${MAX_VIDEO_MB} MB.`;
      continue;
    }
    if (currentCount + accepted.length >= maxVideos) {
      error = `Podés subir hasta ${maxVideos} videos por propiedad.`;
      break;
    }
    accepted.push(file);
  }
  return { accepted, error };
};

/** Archivos nuevos e ids de videos existentes que el usuario quitó. */
export const buildVideoOps = (videos = [], initialData) => {
  const videoFiles = videos.filter((v) => v instanceof File);
  const keptIds = videos.filter((v) => !(v instanceof File) && v?.id != null).map((v) => v.id);
  const deletedVideoIds = (initialData?.videos || []).map((v) => v.id).filter((id) => !keptIds.includes(id));
  return { videoFiles, deletedVideoIds };
};

export const formatMb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
