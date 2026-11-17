// Historial de versiones de InfoCasa (página /versiones y pie de página).
// Para publicar una versión nueva: agregarla ARRIBA de la lista (la primera es la actual).

export const VERSIONS = [
  {
    version: "1.0",
    date: "2026-11-17",
    title: "Lanzamiento de InfoCasa",
    highlights: [
      "Buscador de propiedades con mapa interactivo para todo el NOA.",
      "Publicación de propiedades con hasta 30 fotos y hasta 3 videos, comprimidos automáticamente en calidad 720p.",
      "Planes para dueños directos e inmobiliarias, incluido el Plan Fundador.",
      "Marketplace con propiedades destacadas y súper destacadas.",
      "InfoMonedas para posicionar tus propiedades más arriba.",
      "Punto InfoCasa: póster con código QR que lleva a la ficha online de la propiedad.",
      "Consultas directas al anunciante, favoritos y avisos de búsqueda.",
    ],
  },
];

export const CURRENT_VERSION = VERSIONS[0].version;

/** "2026-11-17" → "17/11/2026" (sin pasar por Date para evitar corrimientos de zona horaria). */
export const formatVersionDate = (iso) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
