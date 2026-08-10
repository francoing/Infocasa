import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";
import SearchFilters from "@/features/search/components/SearchFilters";

// SearchFilters incluye LocationAutocomplete → useLocationSearch → usePropertyFormRefs
// (react-query), así que necesita un QueryClientProvider. El fetch falla (sin red) y las
// sugerencias quedan vacías: no afecta lo que probamos (el botón de cruce).
const renderWithClient = (ui) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

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
    renderWithClient(<SearchFilters {...baseProps} onCrossView={onCrossView} crossViewLabel="Ver listado" />);

    const btn = screen.getByRole("button", { name: /ver listado/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(onCrossView).toHaveBeenCalledTimes(1);
  });

  it("no renderiza el botón de cruce si no se pasa onCrossView", () => {
    renderWithClient(<SearchFilters {...baseProps} />);
    expect(screen.queryByRole("button", { name: /ver listado|ver en el mapa/i })).toBeNull();
  });
});
