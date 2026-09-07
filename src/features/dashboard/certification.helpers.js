// Helpers puros para la revisión de certificación (sin JSX ni estado).

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp|avif)(\?|#|$)/i;

/** True si la URL apunta a una imagen embebible directamente en un <img>. */
export const isImageUrl = (url) => typeof url === "string" && IMAGE_EXT.test(url);
