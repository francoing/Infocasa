import { describe, it, expect } from "vitest";
import { normalizeProvince, isAllowedProvince } from "@/hooks/useUserProvince.helpers";

describe("normalizeProvince", () => {
  it("quita acentos, baja a minúscula y recorta", () => {
    expect(normalizeProvince("Tucumán")).toBe("tucuman");
    expect(normalizeProvince("TUCUMÁN")).toBe("tucuman");
    expect(normalizeProvince("  Tucuman  ")).toBe("tucuman");
    expect(normalizeProvince("")).toBe("");
  });
});

describe("isAllowedProvince", () => {
  it("acepta la provincia con y sin acento (el bug: Geoapify manda 'Tucuman')", () => {
    expect(isAllowedProvince("Tucumán")).toBe(true);
    expect(isAllowedProvince("Tucuman")).toBe(true);
    expect(isAllowedProvince("tucuman")).toBe(true);
    expect(isAllowedProvince("Santiago del Estero")).toBe(true);
    expect(isAllowedProvince("Santiago Del Estero")).toBe(true);
  });

  it("tolera el prefijo 'Provincia de …'", () => {
    expect(isAllowedProvince("Provincia de Tucumán")).toBe(true);
  });

  it("rechaza provincias fuera de zona y vacíos", () => {
    expect(isAllowedProvince("Córdoba")).toBe(false);
    expect(isAllowedProvince("Buenos Aires")).toBe(false);
    expect(isAllowedProvince("")).toBe(false);
    expect(isAllowedProvince(null)).toBe(false);
    expect(isAllowedProvince(undefined)).toBe(false);
  });
});
