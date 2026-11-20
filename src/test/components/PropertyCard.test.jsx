import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PropertyCard from "../../common/components/PropertyCard";

vi.mock("../../hooks/useFavorites", () => ({ setPropertyFavorite: vi.fn() }));
vi.mock("../../hooks/useToast", () => ({
  useToast: () => ({ success: vi.fn(), info: vi.fn(), error: vi.fn() }),
}));

const base = {
  id: 1,
  title: "Casa en Yerba Buena",
  imageUrl: "https://example.com/casa.jpg",
  price: 100000,
  priceCurrency: "USD",
  operation: "Venta",
  operationRaw: "sale",
  location: "Yerba Buena",
  publicationType: "basic",
  condition: "good",
  videos: [],
  owner: { name: "Juan Pérez" },
};

const renderCard = (overrides = {}) =>
  render(
    <MemoryRouter>
      <PropertyCard property={{ ...base, ...overrides }} />
    </MemoryRouter>
  );

describe("PropertyCard - video y avatar", () => {
  it("muestra el ícono de video si hay un video listo", () => {
    renderCard({ videos: [{ id: 1, status: "ready", url: "https://example.com/v.mp4" }] });
    expect(screen.getByLabelText("Tiene video")).toBeInTheDocument();
  });

  it("no muestra el ícono si no hay videos", () => {
    renderCard({ videos: [] });
    expect(screen.queryByLabelText("Tiene video")).not.toBeInTheDocument();
  });

  it("no muestra el ícono si el video todavía se está procesando", () => {
    renderCard({ videos: [{ id: 1, status: "processing", url: null }] });
    expect(screen.queryByLabelText("Tiene video")).not.toBeInTheDocument();
  });

  it("muestra el avatar de quien publica si tiene foto", () => {
    renderCard({ owner: { name: "Juan Pérez", avatar_url: "https://example.com/juan.png" } });
    expect(screen.getByAltText("Foto de Juan Pérez")).toHaveAttribute("src", "https://example.com/juan.png");
  });

  it("ignora la ruta relativa `avatar` (no es una URL usable)", () => {
    renderCard({ owner: { name: "Ana", avatar: "avatars/ana.png" } });
    expect(screen.queryByAltText("Foto de Ana")).not.toBeInTheDocument();
  });

  it("no muestra avatar si quien publica no tiene foto", () => {
    renderCard({ owner: { name: "Juan Pérez" } });
    expect(screen.queryByAltText("Foto de Juan Pérez")).not.toBeInTheDocument();
  });
});
