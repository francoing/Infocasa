import { describe, it, expect } from "vitest";
import { exploreToSearchUrl } from "@/features/explore/explore.helpers";
import { searchToExploreUrl } from "@/features/search/search.helpers";

describe("exploreToSearchUrl (mapa → listado)", () => {
  it("conserva operación y ubicación", () => {
    expect(exploreToSearchUrl({ operationApi: "sale", location: "Tafí del Valle" }))
      .toBe("/search?operation=sale&location=Taf%C3%AD+del+Valle");
  });

  it("omite params vacíos", () => {
    expect(exploreToSearchUrl({ operationApi: "rent", location: "" })).toBe("/search?operation=rent");
    expect(exploreToSearchUrl({})).toBe("/search");
  });
});

describe("searchToExploreUrl (listado → mapa)", () => {
  it("traduce la operación al segmento del path del mapa", () => {
    expect(searchToExploreUrl({ operation: "sale", location: "San Miguel" }))
      .toBe("/explore/Comprar?location=San+Miguel");
    expect(searchToExploreUrl({ operation: "rent" })).toBe("/explore/Alquilar");
    expect(searchToExploreUrl({ operation: "temporary_rent" })).toBe("/explore/Temporario");
  });

  it("defaultea a Comprar cuando la operación es 'Todas' (vacía)", () => {
    expect(searchToExploreUrl({ operation: "" })).toBe("/explore/Comprar");
  });

  it("cae a department/province si no hay location de texto", () => {
    expect(searchToExploreUrl({ operation: "sale", department: "Yerba Buena" }))
      .toBe("/explore/Comprar?location=Yerba+Buena");
    expect(searchToExploreUrl({ operation: "sale", province: "Tucumán" }))
      .toBe("/explore/Comprar?location=Tucum%C3%A1n");
  });
});
