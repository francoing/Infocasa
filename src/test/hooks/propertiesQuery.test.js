import { describe, it, expect } from "vitest";
import { buildSearchQueryString, buildMapQueryString } from "@/hooks/properties.query";

// Helper: parsea el query string a un objeto plano para asertar por param.
const parse = (qs) => Object.fromEntries(new URLSearchParams(qs));

describe("buildSearchQueryString — paginación (listado /search)", () => {
  it("sin page → per_page=12 (default acotado, ej. Home)", () => {
    expect(parse(buildSearchQueryString({})).per_page).toBe("12");
  });

  it("con page → paginado de a 6", () => {
    const q = parse(buildSearchQueryString({ page: 3 }));
    expect(q.page).toBe("3");
    expect(q.per_page).toBe("6");
  });
});

describe("buildMapQueryString — mapa (/properties/map, sin paginar)", () => {
  it("NO agrega page ni per_page (el mapa trae todo de una)", () => {
    const q = parse(buildMapQueryString({ operation: "sale" }));
    expect(q.per_page).toBeUndefined();
    expect(q.page).toBeUndefined();
    expect(q.operation).toBe("sale");
  });

  it("sin filtros → query string vacío", () => {
    expect(buildMapQueryString({})).toBe("");
  });

  it("ignora page/perPage aunque vengan en filters (el mapa no pagina)", () => {
    const q = parse(buildMapQueryString({ page: 2, perPage: 200, operation: "rent" }));
    expect(q.page).toBeUndefined();
    expect(q.per_page).toBeUndefined();
    expect(q.operation).toBe("rent");
  });
});

describe("buildSearchQueryString — filtros", () => {
  it("mapea filtros simples a sus params del backend", () => {
    const q = parse(buildSearchQueryString({ location: "Córdoba", minPrice: 1000, currency: "USD" }));
    expect(q.city).toBe("Córdoba");
    expect(q.price_min).toBe("1000");
    expect(q.currency).toBe("USD");
  });

  it("omite valores vacíos/null/undefined", () => {
    const q = parse(buildSearchQueryString({ location: "", province: null, department: undefined }));
    expect(q.city).toBeUndefined();
    expect(q.province).toBeUndefined();
    expect(q.department).toBeUndefined();
  });
});
