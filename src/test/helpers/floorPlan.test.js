import { describe, it, expect } from "vitest";
import {
  INITIAL_STATE,
  validateFloorPlanFile,
  buildPropertyPayload,
  mapInitialToForm,
} from "@/features/property/propertyForm.helpers";

const file = (name, type, size = 1024) => {
  const f = new File(["x"], name, { type });
  Object.defineProperty(f, "size", { value: size });
  return f;
};

const form = (overrides = {}) => ({ ...INITIAL_STATE, location_id: 1, ...overrides });

describe("validateFloorPlanFile", () => {
  it("acepta JPG, PNG y WEBP", () => {
    expect(validateFloorPlanFile(file("p.jpg", "image/jpeg"))).toBeNull();
    expect(validateFloorPlanFile(file("p.png", "image/png"))).toBeNull();
    expect(validateFloorPlanFile(file("p.webp", "image/webp"))).toBeNull();
  });

  it("rechaza lo que no es imagen", () => {
    expect(validateFloorPlanFile(file("p.pdf", "application/pdf"))).toMatch(/imagen/);
  });

  it("rechaza más de 10 MB", () => {
    expect(validateFloorPlanFile(file("p.jpg", "image/jpeg", 11 * 1024 * 1024))).toMatch(/10 MB/);
  });
});

describe("buildPropertyPayload — plano", () => {
  it("manda el archivo nuevo como floor_plan", () => {
    const plan = file("p.png", "image/png");
    const fd = buildPropertyPayload(form({ floor_plan: plan }), "Tucumán", "Capital");
    expect(fd.get("floor_plan")).toBeInstanceOf(File);
    expect(fd.has("remove_floor_plan")).toBe(false);
  });

  it("si se quitó el plano que tenía, pide borrarlo", () => {
    const fd = buildPropertyPayload(form({ floor_plan: null, floor_plan_removed: true }), "Tucumán", "Capital");
    expect(fd.get("remove_floor_plan")).toBe("1");
    expect(fd.has("floor_plan")).toBe(false);
  });

  it("si el plano ya cargado no cambió, no manda nada", () => {
    const fd = buildPropertyPayload(form({ floor_plan: { existingUrl: "https://x/p.webp" } }), "Tucumán", "Capital");
    expect(fd.has("floor_plan")).toBe(false);
    expect(fd.has("remove_floor_plan")).toBe(false);
  });
});

describe("mapInitialToForm — plano", () => {
  it("precarga el plano existente al editar", () => {
    expect(mapInitialToForm({ floorPlanUrl: "https://x/p.webp" }).floor_plan).toEqual({ existingUrl: "https://x/p.webp" });
  });

  it("sin plano queda null", () => {
    expect(mapInitialToForm({}).floor_plan).toBeNull();
  });
});
