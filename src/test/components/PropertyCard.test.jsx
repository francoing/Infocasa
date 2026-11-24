import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
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
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<PropertyCard property={{ ...base, ...overrides }} />} />
        <Route path="/property/:id" element={<p>Ficha de la propiedad</p>} />
      </Routes>
    </MemoryRouter>
  );

const READY_VIDEO = { id: 1, status: "ready", url: "https://example.com/v.mp4", poster_url: "https://example.com/v.jpg" };
const PLAN_URL = "https://example.com/plano.webp";

describe("PropertyCard - video y avatar", () => {
  it("muestra el ícono de video si hay un video listo", () => {
    renderCard({ videos: [{ id: 1, status: "ready", url: "https://example.com/v.mp4" }] });
    expect(screen.getByLabelText("Ver video")).toBeInTheDocument();
  });

  it("no muestra el ícono si no hay videos", () => {
    renderCard({ videos: [] });
    expect(screen.queryByLabelText("Ver video")).not.toBeInTheDocument();
  });

  it("no muestra el ícono si el video todavía se está procesando", () => {
    renderCard({ videos: [{ id: 1, status: "processing", url: null }] });
    expect(screen.queryByLabelText("Ver video")).not.toBeInTheDocument();
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

describe("PropertyCard - botones de plano y video", () => {
  it("muestra el botón de plano solo si la propiedad tiene plano", () => {
    const { unmount } = renderCard({ floorPlanUrl: PLAN_URL });
    expect(screen.getByLabelText("Ver plano")).toBeInTheDocument();
    unmount();

    renderCard({ floorPlanUrl: null });
    expect(screen.queryByLabelText("Ver plano")).not.toBeInTheDocument();
  });

  it("al apretar el plano abre el pop-up con la imagen y no navega a la ficha", () => {
    renderCard({ floorPlanUrl: PLAN_URL });
    fireEvent.click(screen.getByLabelText("Ver plano"));

    expect(screen.getByRole("dialog", { name: "Plano de la propiedad" })).toBeInTheDocument();
    expect(screen.getByAltText("Plano de Casa en Yerba Buena")).toHaveAttribute("src", PLAN_URL);
    expect(screen.queryByText("Ficha de la propiedad")).not.toBeInTheDocument();
  });

  it("al apretar el video abre el pop-up con el video subido", () => {
    renderCard({ videos: [READY_VIDEO] });
    fireEvent.click(screen.getByLabelText("Ver video"));

    const dialog = screen.getByRole("dialog", { name: "Video de la propiedad" });
    expect(dialog.querySelector("video")).toHaveAttribute("src", READY_VIDEO.url);
    expect(screen.queryByText("Ficha de la propiedad")).not.toBeInTheDocument();
  });

  it("con varios videos permite elegir cuál ver", () => {
    const second = { id: 2, status: "ready", url: "https://example.com/v2.mp4" };
    renderCard({ videos: [READY_VIDEO, second] });
    fireEvent.click(screen.getByLabelText("Ver video"));
    fireEvent.click(screen.getByRole("button", { name: "Video 2" }));

    expect(screen.getByRole("dialog").querySelector("video")).toHaveAttribute("src", second.url);
  });

  it("clics dentro del pop-up no navegan y se cierra con la X o con Escape", () => {
    renderCard({ floorPlanUrl: PLAN_URL });
    fireEvent.click(screen.getByLabelText("Ver plano"));
    fireEvent.click(screen.getByAltText("Plano de Casa en Yerba Buena"));
    expect(screen.queryByText("Ficha de la propiedad")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Cerrar"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Ver plano"));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("clic en el fondo cierra el pop-up sin navegar", () => {
    renderCard({ videos: [READY_VIDEO] });
    fireEvent.click(screen.getByLabelText("Ver video"));
    fireEvent.click(screen.getByTestId("media-modal-backdrop"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Ficha de la propiedad")).not.toBeInTheDocument();
  });

  it("clic en el resto de la tarjeta sigue llevando a la ficha", () => {
    renderCard({ floorPlanUrl: PLAN_URL });
    fireEvent.click(screen.getByText("Casa en Yerba Buena"));
    expect(screen.getByText("Ficha de la propiedad")).toBeInTheDocument();
  });
});

describe("PropertyCard - vistas", () => {
  it("muestra la cantidad de vistas en todas las tarjetas", () => {
    renderCard({ viewsCount: 1234 });
    expect(screen.getByText("1.234 vistas")).toBeInTheDocument();
  });

  it("usa singular con una vista y muestra 0 si no hay dato", () => {
    const { unmount } = renderCard({ viewsCount: 1 });
    expect(screen.getByText("1 vista")).toBeInTheDocument();
    unmount();

    renderCard({});
    expect(screen.getByText("0 vistas")).toBeInTheDocument();
  });

  it("en súper destacadas muestra las vistas al lado de las InfoMonedas", () => {
    renderCard({ publicationType: "premium", infocoinsCount: 5, viewsCount: 42 });
    expect(screen.getByText("42 vistas")).toBeInTheDocument();
    expect(screen.getByText("5 InfoMonedas")).toBeInTheDocument();
  });
});
