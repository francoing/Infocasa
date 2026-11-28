import { describe, it, expect } from "vitest";
import {
  importProgress,
  importSummary,
  isImportActive,
  problemRows,
  uploadErrorMessage,
  warningRows,
} from "@/hooks/propertyImport.helpers";

describe("propertyImport.helpers", () => {
  it("isImportActive: solo queued/processing", () => {
    expect(isImportActive({ status: "queued" })).toBe(true);
    expect(isImportActive({ status: "processing" })).toBe(true);
    expect(isImportActive({ status: "done" })).toBe(false);
    expect(isImportActive({ status: "failed" })).toBe(false);
    expect(isImportActive(undefined)).toBe(false);
  });

  it("uploadErrorMessage: 422 campo, 409 mensaje, 429 throttle", () => {
    expect(uploadErrorMessage({ status: 422, errors: { file: ["Faltan columnas"] } })).toBe("Faltan columnas");
    expect(uploadErrorMessage({ status: 409, message: "Ya tenés una importación en curso." })).toBe("Ya tenés una importación en curso.");
    expect(uploadErrorMessage({ status: 429, message: "Too Many Attempts." })).toMatch(/muchas importaciones/);
    expect(uploadErrorMessage(null)).toBeNull();
  });

  it("importSummary suma inválidas + fallidas", () => {
    const summary = importSummary({ counts: { created: 3, invalid: 1, failed: 1, plan_limit: 2 } });
    const byKey = Object.fromEntries(summary.map((s) => [s.key, s.value]));
    expect(byKey).toEqual({ created: 3, duplicates: 0, invalid: 2, plan_limit: 2, photo_warnings: 0 });
  });

  it("problemRows / warningRows separan las filas", () => {
    const imp = {
      rows: [
        { line: 1, result: "created", messages: [] },
        { line: 2, result: "created", messages: ["Foto 1: no es una imagen."] },
        { line: 3, result: "invalid", messages: ["x"] },
        { line: 4, result: "plan_limit", messages: ["y"] },
        { line: 5, result: "duplicate", messages: ["Ya importada."] },
      ],
    };
    expect(problemRows(imp).map((r) => r.line)).toEqual([3, 4]);
    expect(warningRows(imp).map((r) => r.line)).toEqual([2]);
  });

  it("importProgress", () => {
    expect(importProgress({ total_rows: 40, processed_rows: 20 })).toBe(50);
    expect(importProgress({ total_rows: 0, processed_rows: 0 })).toBe(0);
  });
});
