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

  it("emite lat/lng/bbox cuando la ubicación fue elegida de una sugerencia (zoom del mapa)", () => {
    const url = searchToExploreUrl({
      operation: "rent",
      location: "Yerba Buena",
      lat: -26.81,
      lng: -65.31,
      bbox: [-65.4, -26.9, -65.2, -26.7],
    });
    expect(url).toBe("/explore/Alquilar?location=Yerba+Buena&lat=-26.81&lng=-65.31&bbox=-65.4%2C-26.9%2C-65.2%2C-26.7");
  });

  it("sin coords, la salida es idéntica a la de solo-texto (sin regresión)", () => {
    expect(searchToExploreUrl({ operation: "rent", location: "Yerba Buena", lat: undefined, lng: undefined, bbox: undefined }))
      .toBe("/explore/Alquilar?location=Yerba+Buena");
  });

  it("ignora coords parciales (solo lat sin lng) y bbox mal formado", () => {
    expect(searchToExploreUrl({ operation: "sale", location: "X", lat: -26.8 }))
      .toBe("/explore/Comprar?location=X");
    expect(searchToExploreUrl({ operation: "sale", location: "X", lat: -26.8, lng: -65.3, bbox: [1, 2] }))
      .toBe("/explore/Comprar?location=X&lat=-26.8&lng=-65.3");
  });
});
