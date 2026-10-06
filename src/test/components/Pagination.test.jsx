import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Pagination from "@/common/components/Pagination";

const meta = (over = {}) => ({
  currentPage: 2, lastPage: 4, perPage: 15, total: 52, from: 16, to: 30, ...over,
});

describe("Pagination — visibilidad", () => {
  it("no se renderiza con una sola página", () => {
    const { container } = render(<Pagination meta={meta({ lastPage: 1 })} onPageChange={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("no se renderiza sin meta", () => {
    const { container } = render(<Pagination meta={null} onPageChange={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("se renderiza con más de una página", () => {
    render(<Pagination meta={meta()} onPageChange={vi.fn()} />);
    expect(screen.getByRole("navigation", { name: "Paginación" })).toBeTruthy();
  });
});

describe("Pagination — rango mostrado", () => {
  it("muestra 'Mostrando X–Y de Z' con la etiqueta del listado", () => {
    render(<Pagination meta={meta()} onPageChange={vi.fn()} itemLabel="propiedades" />);
    const nav = screen.getByRole("navigation", { name: "Paginación" });
    expect(nav.textContent).toContain("16–30");
    expect(nav.textContent).toContain("52");
    expect(nav.textContent).toContain("propiedades");
  });

  it("marca la página actual con aria-current", () => {
    render(<Pagination meta={meta()} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Ir a la página 2" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("button", { name: "Ir a la página 1" }).getAttribute("aria-current")).toBeNull();
  });
});

describe("Pagination — navegación", () => {
  it("avisa la página elegida al hacer click en un número", () => {
    const onPageChange = vi.fn();
    render(<Pagination meta={meta()} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Ir a la página 3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("Anterior / Siguiente se mueven de a una", () => {
    const onPageChange = vi.fn();
    render(<Pagination meta={meta()} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
    fireEvent.click(screen.getByRole("button", { name: "Página anterior" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("no avisa al clickear la página actual", () => {
    const onPageChange = vi.fn();
    render(<Pagination meta={meta()} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Ir a la página 2" }));
    expect(onPageChange).not.toHaveBeenCalled();
  });
});

describe("Pagination — extremos deshabilitados", () => {
  it("en la primera página Anterior está deshabilitado", () => {
    render(<Pagination meta={meta({ currentPage: 1 })} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Página anterior" }).disabled).toBe(true);
    expect(screen.getByRole("button", { name: "Página siguiente" }).disabled).toBe(false);
  });

  it("en la última página Siguiente está deshabilitado", () => {
    render(<Pagination meta={meta({ currentPage: 4 })} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Página siguiente" }).disabled).toBe(true);
    expect(screen.getByRole("button", { name: "Página anterior" }).disabled).toBe(false);
  });
});
