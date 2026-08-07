import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SearchFilters from "@/features/search/components/SearchFilters";

// El botón de cruce (mapa ↔ listado) es genérico: label por prop, y dispara onCrossView.
describe("SearchFilters — botón de cruce (onCrossView)", () => {
  const baseProps = {
    form: { province: "", operation: "" },
    setField: () => {},
    onApply: () => {},
    onReset: () => {},
    onClose: () => {},
  };

  it("renderiza el botón con el label dado y dispara onCrossView al click", () => {
    const onCrossView = vi.fn();
    render(<SearchFilters {...baseProps} onCrossView={onCrossView} crossViewLabel="Ver listado" />);

    const btn = screen.getByRole("button", { name: /ver listado/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(onCrossView).toHaveBeenCalledTimes(1);
  });

  it("no renderiza el botón de cruce si no se pasa onCrossView", () => {
    render(<SearchFilters {...baseProps} />);
    expect(screen.queryByRole("button", { name: /ver listado|ver en el mapa/i })).toBeNull();
  });
});
