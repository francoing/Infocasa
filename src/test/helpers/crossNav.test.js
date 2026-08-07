import { describe, it, expect } from "vitest";
import { exploreToSearchUrl, pathOperationToApi } from "@/features/explore/explore.helpers";
import { searchToExploreUrl } from "@/features/search/search.helpers";

// Parse "/path?query" → { path, params } para asertar sin depender del orden de los params.
const parse = (url) => {
  const [path, qs = ""] = url.split("?");
  return { path, params: Object.fromEntries(new URLSearchParams(qs)) };
};

describe("exploreToSearchUrl (mapa → listado)", () => {
  it("conserva TODOS los filtros hacia /search", () => {
    const { path, params } = parse(
      exploreToSearchUrl({ operation: "sale", location: "Tafí del Valle", propertyTypeId: "3" })
    );
    expect(path).toBe("/search");
    expect(params).toEqual({ operation: "sale", location: "Tafí del Valle", propertyTypeId: "3" });
  });

  it("sin filtros → /search pelado", () => {
    expect(exploreToSearchUrl({})).toBe("/search");
  });
});

describe("searchToExploreUrl (listado → mapa)", () => {
  it("conserva TODOS los filtros hacia /explore (incluida la operación)", () => {
    const { path, params } = parse(
      searchToExploreUrl({ operation: "rent", location: "San Miguel", propertyTypeId: "2" })
    );
    expect(path).toBe("/explore");
    expect(params).toEqual({ operation: "rent", location: "San Miguel", propertyTypeId: "2" });
  });

  it("'Todas' (operación vacía) NO fuerza ninguna operación → el mapa muestra todas", () => {
    const { path, params } = parse(searchToExploreUrl({ operation: "", location: "Termas" }));
    expect(path).toBe("/explore");
    expect(params.operation).toBeUndefined();
    expect(params.location).toBe("Termas");
  });

  it("emite lat/lng/bbox para el zoom cuando hay coords", () => {
    const { params } = parse(
      searchToExploreUrl({ operation: "rent", location: "Yerba Buena", lat: -26.81, lng: -65.31, bbox: [-65.4, -26.9, -65.2, -26.7] })
    );
    expect(params.lat).toBe("-26.81");
    expect(params.lng).toBe("-65.31");
    expect(params.bbox).toBe("-65.4,-26.9,-65.2,-26.7");
  });

  it("sin coords no agrega lat/lng/bbox; coords parciales se ignoran", () => {
    expect(parse(searchToExploreUrl({ operation: "rent", location: "YB" })).params).toEqual({ operation: "rent", location: "YB" });
    expect(parse(searchToExploreUrl({ operation: "sale", location: "X", lat: -26.8 })).params).toEqual({ operation: "sale", location: "X" });
  });
});

describe("pathOperationToApi (semilla del path viejo /explore/:operation)", () => {
  it("mapea segmentos conocidos y cae a '' (todas) si no", () => {
    expect(pathOperationToApi("Comprar")).toBe("sale");
    expect(pathOperationToApi("Alquilar")).toBe("rent");
    expect(pathOperationToApi("Temporario")).toBe("temporary_rent");
    expect(pathOperationToApi("todas")).toBe("");
    expect(pathOperationToApi(undefined)).toBe("");
  });
});
