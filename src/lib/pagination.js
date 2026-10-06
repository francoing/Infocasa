/**
 * Helpers puros de paginación (sin estado, sin HTTP).
 */

/**
 * Normaliza una respuesta del paginador de Laravel (`{ data, links, meta }`) al shape
 * que consumen los listados: `{ items, meta }` en camelCase.
 *
 * Tolera respuestas SIN paginar (array plano, o `{data}` sin `meta`) — el mock y cualquier
 * endpoint que deje de paginar caen ahí: se deriva una meta de 1 página, así el paginador
 * no se muestra y los contadores siguen funcionando.
 */
export const readPaginated = (res, mapFn) => {
  const raw = Array.isArray(res) ? res : res?.data;
  const list = Array.isArray(raw) ? raw : [];
  const items = mapFn ? list.map(mapFn) : list;
  const m = res?.meta;

  return {
    items,
    meta: {
      currentPage: m?.current_page ?? 1,
      lastPage: m?.last_page ?? 1,
      perPage: m?.per_page ?? items.length,
      total: m?.total ?? items.length,
      from: m?.from ?? (items.length ? 1 : 0),
      to: m?.to ?? items.length,
    },
  };
};

/** Marcador de corte entre bloques de páginas no contiguos. */
export const PAGE_GAP = "gap";

/**
 * Arma la lista de páginas a mostrar: siempre la primera y la última, más una
 * ventana alrededor de la actual. Los saltos se representan con `PAGE_GAP`.
 *
 * buildPageRange(5, 10) → [1, PAGE_GAP, 4, 5, 6, PAGE_GAP, 10]
 *
 * @returns {Array<number|string>} vacío si hay 1 página o menos (no hay nada que paginar).
 */
export const buildPageRange = (current, last, windowSize = 1) => {
  if (!Number.isFinite(last) || last <= 1) return [];

  const wanted = new Set([1, last]);
  for (let p = current - windowSize; p <= current + windowSize; p += 1) {
    if (p >= 1 && p <= last) wanted.add(p);
  }

  const out = [];
  let prev = 0;
  for (const page of [...wanted].sort((a, b) => a - b)) {
    // Un "…" que tapa una sola página ocupa lo mismo que el número: mejor mostrarlo.
    if (prev && page - prev === 2) out.push(page - 1);
    else if (prev && page - prev > 2) out.push(PAGE_GAP);
    out.push(page);
    prev = page;
  }
  return out;
};
