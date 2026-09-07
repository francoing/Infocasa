import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Loader from "@/common/components/Loader";

describe("Loader — preload oficial (isotipo Infocasa)", () => {
  it("renderiza el isotipo de Infocasa con la animación de latido", () => {
    render(<Loader />);
    const img = screen.getByAltText("Cargando...");
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toBeTruthy();
    expect(img.className).toContain("animate-heartbeat");
  });

  it("por defecto (full-screen) ocupa min-h-screen", () => {
    const { container } = render(<Loader />);
    expect(container.firstChild.className).toContain("min-h-screen");
  });

  it("en modo inline aplica la className de la sección y no ocupa la pantalla completa", () => {
    const { container } = render(<Loader inline className="py-20 bg-slate-50" />);
    const wrapper = container.firstChild;
    expect(wrapper.className).toContain("py-20");
    expect(wrapper.className).toContain("bg-slate-50");
    expect(wrapper.className).not.toContain("min-h-screen");
  });

  it("permite personalizar el alt (label) de accesibilidad", () => {
    render(<Loader label="Cargando propiedad…" />);
    expect(screen.getByAltText("Cargando propiedad…")).toBeInTheDocument();
  });
});
