import { useEffect } from "react";

const SUFFIX = " | InfoCasa";

/**
 * Título y descripción por página (SEO básico de la SPA). Restaura los valores previos al
 * desmontar. Los bots de redes usan las páginas `/share/guia/...` del backend (OG).
 */
export function useDocumentMeta(title, description) {
  useEffect(() => {
    if (!title) return undefined;
    const prevTitle = document.title;
    let meta = document.querySelector('meta[name="description"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    const prevDescription = meta.getAttribute("content");

    document.title = title.endsWith(SUFFIX) ? title : `${title}${SUFFIX}`;
    if (description) meta.setAttribute("content", description.slice(0, 160));

    return () => {
      document.title = prevTitle;
      if (created) meta.remove();
      else if (prevDescription !== null) meta.setAttribute("content", prevDescription);
    };
  }, [title, description]);
}
