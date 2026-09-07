import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LocationGateModal from "@/features/home/components/LocationGateModal";

const baseProps = {
  open: true,
  status: "idle",
  province: null,
  error: null,
  onAccept: vi.fn(),
  onClose: vi.fn(),
};

const renderModal = (overrides = {}) =>
  render(<LocationGateModal {...baseProps} {...overrides} />);

describe("LocationGateModal — estados", () => {
  it("idle → pide permiso (título + Cancelar/Aceptar)", () => {
    renderModal();
    expect(screen.getByRole("heading", { name: /activá tu ubicación/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /aceptar/i })).toBeInTheDocument();
  });

  it("checking → spinner, sin botón de cerrar (X)", () => {
    renderModal({ status: "checking" });
    expect(screen.getByRole("heading", { name: /verificando ubicación/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cerrar" })).toBeNull();
  });

  it("blocked → copia de fuera de zona con la provincia detectada", () => {
    renderModal({ status: "blocked", province: "Buenos Aires" });
    expect(screen.getByRole("heading", { name: /fuera de zona/i })).toBeInTheDocument();
    expect(screen.getByText(/buenos aires/i)).toBeInTheDocument();
  });

  it("denied → copia propia (permiso denegado), NO la de fuera de zona", () => {
    renderModal({ status: "denied" });
    expect(
      screen.getByRole("heading", { name: /permiso de ubicación denegado/i })
    ).toBeInTheDocument();
    expect(screen.queryByText(/solo está disponible para/i)).toBeNull();
  });

  it("error → copia de error con el mensaje recibido", () => {
    renderModal({ status: "error", error: "Algo salió mal" });
    expect(
      screen.getByRole("heading", { name: /no pudimos verificar tu ubicación/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/algo salió mal/i)).toBeInTheDocument();
  });

  it("botón 'Entendido' en denied → llama onClose", () => {
    const onClose = vi.fn();
    renderModal({ status: "denied", onClose });
    fireEvent.click(screen.getByRole("button", { name: /entendido/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("LocationGateModal — cierre por backdrop", () => {
  it("click en backdrop durante checking → NO llama onClose (fix race)", () => {
    const onClose = vi.fn();
    const { container } = renderModal({ status: "checking", onClose });

    fireEvent.click(container.firstChild);

    expect(onClose).not.toHaveBeenCalled();
  });

  it.each(["blocked", "denied", "error"])(
    "click en backdrop en '%s' → llama onClose",
    (status) => {
      const onClose = vi.fn();
      const { container } = renderModal({ status, onClose });

      fireEvent.click(container.firstChild);

      expect(onClose).toHaveBeenCalledTimes(1);
    }
  );
});

describe("LocationGateModal — botón X", () => {
  it("visible en idle/blocked/denied/error y ausente en checking", () => {
    const { rerender } = render(<LocationGateModal {...baseProps} />);
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeInTheDocument();

    for (const status of ["blocked", "denied", "error"]) {
      rerender(<LocationGateModal {...baseProps} status={status} />);
      expect(screen.getByRole("button", { name: "Cerrar" })).toBeInTheDocument();
    }

    rerender(<LocationGateModal {...baseProps} status="checking" />);
    expect(screen.queryByRole("button", { name: "Cerrar" })).toBeNull();
  });
});