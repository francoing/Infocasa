import { describe, it, expect } from "vitest";
import { activeFilterCount, guideSearchUrl, readGuideFilters, withFilter } from "@/hooks/guide.query";

describe("readGuideFilters", () => {
  it("lee solo claves conocidas, normaliza flags y página", () => {
    const params = new URLSearchParams("q=plomero&trade=plomeros&home_service=true&has_store=0&page=3&foo=bar&city=");
    expect(readGuideFilters(params)).toEqual({ q: "plomero", trade: "plomeros", home_service: 1, page: 3 });
  });

  it("cercanía solo con lat y lng juntos", () => {
    expect(readGuideFilters(new URLSearchParams("lat=-26.8&radius_km=5"))).toEqual({});
    expect(readGuideFilters(new URLSearchParams("lat=-26.8&lng=-65.2&radius_km=5"))).toEqual({ lat: "-26.8", lng: "-65.2", radius_km: "5" });
  });

  it("página 1 no se escribe", () => {
    expect(readGuideFilters(new URLSearchParams("page=1"))).toEqual({});
  });
});

describe("guideSearchUrl / withFilter", () => {
  it("arma la URL sin vacíos", () => {
    expect(guideSearchUrl({ q: "corralón", works_in: "", home_service: 1, trade: undefined })).toBe("/guia/buscar?q=corral%C3%B3n&home_service=1");
    expect(guideSearchUrl()).toBe("/guia/buscar");
  });

  it("cambiar un filtro vuelve a la página 1 y cambiar categoría limpia el rubro", () => {
    const filters = { category: "empresas", trade: "constructoras", page: 4 };
    expect(withFilter(filters, "province", "Tucumán")).toEqual({ category: "empresas", trade: "constructoras", province: "Tucumán" });
    expect(withFilter(filters, "category", "profesionales")).toEqual({ category: "profesionales" });
    expect(withFilter(filters, "trade", "")).toEqual({ category: "empresas" });
  });

  it("cuenta filtros activos sin texto ni página", () => {
    expect(activeFilterCount({ q: "x", page: 2, category: "a", home_service: 1, lat: "1", lng: "2", radius_km: 5 })).toBe(3);
  });
});
