import { describe, it, expect } from "vitest";
import { buildProperty, buildMapMarker } from "@/hooks/property.mappers";
import { buildPopupHtml } from "@/features/home/components/provinceMap.helpers";

// Item tal como lo devuelve GET /properties/map (payload liviano, sin images[]).
const mapItem = (overrides = {}) => ({
  id: 12,
  title: "Casa en Yerba Buena",
  operation: "sale",
  property_type: "Casa",
  price: { amount: "120000.00", currency: "USD" },
  coordinates: { lat: -26.82, lng: -65.21, exact: true },
  image_url: "https://api.infocasa.com.ar/storage/properties/abc.jpg",
  ...overrides,
});

// La foto genérica que usa toda la app cuando una propiedad no tiene imágenes.
const FALLBACK = buildProperty({}).imageUrl;

describe("buildMapMarker — miniatura del mapa (image_url)", () => {
  it("usa image_url del backend como imageUrl", () => {
    expect(buildMapMarker(mapItem()).imageUrl).toBe(
      "https://api.infocasa.com.ar/storage/properties/abc.jpg"
    );
  });

  it("sin foto (image_url null) cae a la imagen genérica, como las cards", () => {
    expect(buildMapMarker(mapItem({ image_url: null })).imageUrl).toBe(FALLBACK);
  });

  it("si el backend aún no manda image_url (deploy desfasado), mantiene la genérica", () => {
    const { image_url: _omit, ...legacy } = mapItem();
    expect(buildMapMarker(legacy).imageUrl).toBe(FALLBACK);
  });

  it("conserva coordenadas y precisión del pin", () => {
    const marker = buildMapMarker(mapItem({ coordinates: { lat: -26.8, lng: -65.2, exact: false } }));
    expect(marker.latitude).toBe(-26.8);
    expect(marker.longitude).toBe(-65.2);
    expect(marker.coordinatesExact).toBe(false);
  });

  it("el popup del mapa muestra la miniatura real, no la genérica", () => {
    const html = buildPopupHtml(buildMapMarker(mapItem()), true);
    expect(html).toContain('src="https://api.infocasa.com.ar/storage/properties/abc.jpg"');
    expect(html).not.toContain(FALLBACK);
  });
});
