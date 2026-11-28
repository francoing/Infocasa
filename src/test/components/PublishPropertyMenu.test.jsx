import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import PublishPropertyMenu from "@/features/dashboard/components/PublishPropertyMenu";

const renderMenu = (onImportCsv = vi.fn()) => {
  render(
    <MemoryRouter>
      <div>
        <PublishPropertyMenu onImportCsv={onImportCsv} />
        <p>afuera</p>
      </div>
    </MemoryRouter>
  );
  return onImportCsv;
};

const toggle = () => screen.getByRole("button", { name: /publicar propiedad/i });

describe("PublishPropertyMenu", () => {
  it("arranca cerrado y abre el menú con las dos opciones", () => {
    renderMenu();
    expect(screen.queryByRole("menu")).toBeNull();
    expect(toggle()).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle());

    expect(toggle()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menuitem", { name: /crear publicación/i })).toHaveAttribute("href", "/dashboard/properties/create");
    expect(screen.getByRole("menuitem", { name: /importar desde csv/i })).toBeInTheDocument();
  });

  it("el primer ítem recibe el foco y las flechas lo mueven", () => {
    renderMenu();
    fireEvent.click(toggle());
    const create = screen.getByRole("menuitem", { name: /crear publicación/i });
    const importItem = screen.getByRole("menuitem", { name: /importar desde csv/i });
    expect(create).toHaveFocus();

    fireEvent.keyDown(create, { key: "ArrowDown" });
    expect(importItem).toHaveFocus();
    fireEvent.keyDown(importItem, { key: "ArrowDown" });
    expect(create).toHaveFocus();
  });

  it("'Importar desde CSV' llama al callback y cierra el menú", () => {
    const onImportCsv = renderMenu();
    fireEvent.click(toggle());
    fireEvent.click(screen.getByRole("menuitem", { name: /importar desde csv/i }));

    expect(onImportCsv).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("Escape cierra y devuelve el foco al botón", () => {
    renderMenu();
    fireEvent.click(toggle());
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("menu")).toBeNull();
    expect(toggle()).toHaveFocus();
  });

  it("click afuera (mouse o touch) cierra", () => {
    renderMenu();
    fireEvent.click(toggle());
    fireEvent.mouseDown(screen.getByText("afuera"));
    expect(screen.queryByRole("menu")).toBeNull();

    fireEvent.click(toggle());
    fireEvent.touchStart(screen.getByText("afuera"));
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
