import { describe, it, expect } from "vitest";
import { buildPageRange, readPaginated, PAGE_GAP } from "@/lib/pagination";

describe("readPaginated — normaliza el paginador de Laravel", () => {
  const laravel = {
    data: [{ id: 1 }, { id: 2 }],
    links: {},
    meta: { current_page: 2, last_page: 4, per_page: 15, total: 52, from: 16, to: 30 },
  };

  it("extrae items y meta en camelCase", () => {
    const { items, meta } = readPaginated(laravel);
    expect(items).toHaveLength(2);
    expect(meta).toEqual({ currentPage: 2, lastPage: 4, perPage: 15, total: 52, from: 16, to: 30 });
  });

  it("aplica el mapper a cada item", () => {
    const { items } = readPaginated(laravel, (p) => ({ ...p, mapped: true }));
    expect(items.every((i) => i.mapped)).toBe(true);
  });

  it("tolera una respuesta SIN paginar (array plano) → meta de 1 página", () => {
    const { items, meta } = readPaginated([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(items).toHaveLength(3);
    expect(meta.lastPage).toBe(1);
    expect(meta.total).toBe(3);
    expect(meta.from).toBe(1);
    expect(meta.to).toBe(3);
  });

  it("tolera `{data}` sin `meta`", () => {
    const { items, meta } = readPaginated({ data: [{ id: 1 }] });
    expect(items).toHaveLength(1);
    expect(meta.lastPage).toBe(1);
    expect(meta.total).toBe(1);
  });

  it("no rompe con null/undefined ni con un shape inesperado", () => {
    for (const bad of [null, undefined, {}, { data: null }, 42]) {
      const { items, meta } = readPaginated(bad);
      expect(items).toEqual([]);
      expect(meta.total).toBe(0);
      expect(meta.from).toBe(0);
      expect(meta.lastPage).toBe(1);
    }
  });
});

describe("buildPageRange", () => {
  it("devuelve vacío cuando no hay nada que paginar", () => {
    expect(buildPageRange(1, 1)).toEqual([]);
    expect(buildPageRange(1, 0)).toEqual([]);
  });

  it("lista todas las páginas sin cortes cuando son pocas", () => {
    expect(buildPageRange(2, 4)).toEqual([1, 2, 3, 4]);
    expect(buildPageRange(1, 3)).toEqual([1, 2, 3]);
  });

  it("no usa '…' para tapar una sola página: muestra el número", () => {
    // 1,2 + 4 → el hueco es solo la 3, así que se renderiza en vez del corte.
    expect(buildPageRange(1, 4)).toEqual([1, 2, 3, 4]);
  });

  it("corta con PAGE_GAP alrededor de la página actual", () => {
    expect(buildPageRange(5, 10)).toEqual([1, PAGE_GAP, 4, 5, 6, PAGE_GAP, 10]);
  });

  it("conserva siempre la primera y la última", () => {
    const range = buildPageRange(9, 20);
    expect(range[0]).toBe(1);
    expect(range[range.length - 1]).toBe(20);
  });

  it("no emite páginas fuera de rango en los extremos", () => {
    const first = buildPageRange(1, 8);
    const last = buildPageRange(8, 8);
    const nums = (r) => r.filter((p) => p !== PAGE_GAP);
    expect(Math.min(...nums(first))).toBe(1);
    expect(Math.max(...nums(last))).toBe(8);
  });
});
