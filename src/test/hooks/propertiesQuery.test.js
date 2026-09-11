import { describe, it, expect } from "vitest";
import { buildSearchQueryString } from "@/hooks/properties.query";

// Helper: parsea el query string a un objeto plano para asertar por param.
const parse = (qs) => Object.fromEntries(new URLSearchParams(qs));

describe("buildSearchQueryString — paginación / per_page", () => {
  it("sin page ni perPage → per_page=12 (default acotado, ej. Home)", () => {
    expect(parse(buildSearchQueryString({})).per_page).toBe("12");
  });

  it("con page → paginado de a 6 (listado /search)", () => {
    const q = parse(buildSearchQueryString({ page: 3 }));
    expect(q.page).toBe("3");
    expect(q.per_page).toBe("6");
  });

  it("con perPage y sin page → usa el per_page alto (mapa /explore)", () => {
    expect(parse(buildSearchQueryString({ perPage: 200 })).per_page).toBe("200");
  });

  it("page tiene prioridad sobre perPage (paginado gana)", () => {
    const q = parse(buildSearchQueryString({ page: 2, perPage: 200 }));
    expect(q.page).toBe("2");
    expect(q.per_page).toBe("6");
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
