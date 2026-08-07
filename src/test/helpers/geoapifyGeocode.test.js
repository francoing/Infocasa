import { describe, it, expect } from "vitest";
import { parseFirstGeocode } from "@/hooks/useGeoapifyGeocode.helpers";

describe("parseFirstGeocode", () => {
  it("devuelve lat/lng/bbox del primer resultado (lon → lng)", () => {
    const data = {
      features: [
        {
          properties: { lat: -27.49, lon: -64.86 },
          bbox: [-64.9, -27.55, -64.8, -27.45],
        },
      ],
    };
    expect(parseFirstGeocode(data)).toEqual({
      lat: -27.49,
      lng: -64.86,
      bbox: [-64.9, -27.55, -64.8, -27.45],
    });
  });

  it("bbox = null cuando falta o está mal formado", () => {
    expect(parseFirstGeocode({ features: [{ properties: { lat: 1, lon: 2 } }] }))
      .toEqual({ lat: 1, lng: 2, bbox: null });
    expect(parseFirstGeocode({ features: [{ properties: { lat: 1, lon: 2 }, bbox: [1, 2] }] }))
      .toEqual({ lat: 1, lng: 2, bbox: null });
  });

  it("null cuando no hay resultados o faltan coords", () => {
    expect(parseFirstGeocode({ features: [] })).toBeNull();
    expect(parseFirstGeocode({})).toBeNull();
    expect(parseFirstGeocode(null)).toBeNull();
    expect(parseFirstGeocode({ features: [{ properties: { lat: -27.49 } }] })).toBeNull(); // sin lon
  });
});
