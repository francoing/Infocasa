import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import WelcomeModal from "@/features/home/components/WelcomeModal";

const KEY = "infocasa_welcome_seen";

const renderModal = (props = {}) =>
  render(
    <MemoryRouter>
      <WelcomeModal {...props} />
    </MemoryRouter>
  );

describe("WelcomeModal", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("primera visita → muestra la bienvenida y el CTA al Plan Fundador", () => {
    renderModal();
    expect(screen.getByRole("heading", { name: /bienvenido a infocasa/i })).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: /quiero mi plan fundador/i });
    expect(cta).toHaveAttribute("href", "/plan-fundador");
  });

  it("ya visto → no se muestra", () => {
    localStorage.setItem(KEY, "1");
    renderModal();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("enabled=false (usuario logueado) → no se muestra", () => {
    renderModal({ enabled: false });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it.each([["Cerrar"], [/seguir explorando/i]])("cerrar con '%s' → marca como visto", (name) => {
    renderModal();
    fireEvent.click(screen.getByRole("button", { name }));
    expect(localStorage.getItem(KEY)).toBe("1");
  });

  it("click en el CTA → marca como visto", () => {
    renderModal();
    fireEvent.click(screen.getByRole("link", { name: /quiero mi plan fundador/i }));
    expect(localStorage.getItem(KEY)).toBe("1");
  });

  it("click en el backdrop → marca como visto", () => {
    const { container } = renderModal();
    fireEvent.click(container.firstChild);
    expect(localStorage.getItem(KEY)).toBe("1");
  });
});
