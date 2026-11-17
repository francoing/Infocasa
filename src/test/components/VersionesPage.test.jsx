import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import VersionesPage from "@/features/legal/pages/VersionesPage";
import { VERSIONS, CURRENT_VERSION, formatVersionDate } from "@/data/versions";

describe("VersionesPage — historial de versiones", () => {
  it("la versión actual es la 1.0", () => {
    expect(CURRENT_VERSION).toBe("1.0");
  });

  it("muestra cada versión con su fecha y marca la primera como actual", () => {
    render(<VersionesPage />);
    for (const release of VERSIONS) {
      expect(screen.getByRole("heading", { name: `Versión ${release.version}` })).toBeInTheDocument();
    }
    expect(screen.getByText("Actual")).toBeInTheDocument();
    expect(screen.getByText(new RegExp(formatVersionDate(VERSIONS[0].date)))).toBeInTheDocument();
  });

  it("formatea la fecha sin corrimiento de zona horaria", () => {
    expect(formatVersionDate("2026-11-17")).toBe("17/11/2026");
  });
});
