import { describe, it, expect } from "vitest";
import { buildLocationSuggestions, findLocationFocus } from "@/hooks/useLocationSearch.helpers";

const LOCS = [
  { city: "Termas de Río Hondo", department: "Río Hondo", province: "Santiago del Estero", latitude: "-27.49", longitude: "-64.86", properties_count: 5 },
  { city: "Termas de Río Hondo", department: "Río Hondo", province: "Santiago del Estero", latitude: "-27.50", longitude: "-64.87", properties_count: 2 }, // dup ciudad
  { city: "Yerba Buena", department: "Yerba Buena", province: "Tucumán", latitude: "-26.81", longitude: "-65.31", properties_count: 0 }, // sin propiedades
  { city: "Tafí del Valle", department: "Tafí del Valle", province: "Tucumán", latitude: "-26.85", longitude: "-65.71" }, // sin count (rollout)
];

describe("buildLocationSuggestions", () => {
  it("sugiere solo lugares con propiedades, dedupe por ciudad, sin acentos", () => {
    const out = buildLocationSuggestions(LOCS, "termas");
    expect(out).toHaveLength(1); // las dos 'Termas' se dedupean
    expect(out[0]).toMatchObject({
      value: "Termas de Río Hondo",
      label: "Termas de Río Hondo, Santiago del Estero",
      lat: -27.49,
      lon: -64.86,
      bbox: null,
    });
  });

  it("excluye lugares con properties_count = 0", () => {
    expect(buildLocationSuggestions(LOCS, "yerba")).toHaveLength(0);
  });

  it("incluye ubicaciones sin count (rollout del backend)", () => {
    const out = buildLocationSuggestions(LOCS, "tafi");
    expect(out).toHaveLength(1);
    expect(out[0].value).toBe("Tafí del Valle");
  });

  it("con menos de 2 caracteres no sugiere nada", () => {
    expect(buildLocationSuggestions(LOCS, "t")).toEqual([]);
  });
});

describe("findLocationFocus", () => {
  it("devuelve coords por match exacto de ciudad (sin acentos)", () => {
    expect(findLocationFocus(LOCS, "Termas de Rio Hondo")).toEqual({ lat: -27.49, lng: -64.86, bbox: null });
  });

  it("cae a match por 'contiene' (provincia/departamento)", () => {
    expect(findLocationFocus(LOCS, "tucuman")).toEqual({ lat: -26.81, lng: -65.31, bbox: null });
  });

  it("null si no matchea o faltan coords", () => {
    expect(findLocationFocus(LOCS, "cordoba")).toBeNull();
    expect(findLocationFocus(LOCS, "")).toBeNull();
    expect(findLocationFocus([], "termas")).toBeNull();
  });
});
