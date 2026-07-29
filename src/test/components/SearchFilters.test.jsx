import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SearchFilters from "@/features/search/components/SearchFilters";

// El botón "Ver en el mapa" es el cruce del listado al mapa: debe existir cuando
// se pasa onGoToMap y dispararlo al click. Sin onGoToMap, no debe renderizarse.
describe("SearchFilters — botón 'Ver en el mapa'", () => {
  const baseProps = {
    form: { province: "", operation: "" },
    setField: () => {},
    onApply: () => {},
    onReset: () => {},
    onClose: () => {},
  };

  it("renderiza el botón y dispara onGoToMap al click", () => {
    const onGoToMap = vi.fn();
    render(<SearchFilters {...baseProps} onGoToMap={onGoToMap} />);

    const btn = screen.getByRole("button", { name: /ver en el mapa/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(onGoToMap).toHaveBeenCalledTimes(1);
  });

  it("no renderiza el botón si no se pasa onGoToMap", () => {
    render(<SearchFilters {...baseProps} />);
    expect(screen.queryByRole("button", { name: /ver en el mapa/i })).toBeNull();
  });
});
