import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PropertyRow from "@/features/dashboard/components/PropertyRow";

const baseProp = { id: 7, title: "Casa", status: "published", price: 100000, location: "Centro", priceHistory: [] };

const renderRow = (prop, onToggleStatus = vi.fn(), onFeature = vi.fn()) => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <PropertyRow
          prop={prop}
          expanded={false}
          onToggleExpand={vi.fn()}
          onDelete={vi.fn()}
          onAssignInfocoins={vi.fn()}
          onFeature={onFeature}
          onToggleStatus={onToggleStatus}
          reductionPercent={{}}
          setReductionPercent={vi.fn()}
          reductionCustom={{}}
          setReductionCustom={vi.fn()}
          reducingId={null}
          onReducePrice={vi.fn()}
        />
      </MemoryRouter>
    </QueryClientProvider>
  );
  return onToggleStatus;
};

describe("PropertyRow pause/resume button", () => {
  it("pauses a published property", () => {
    const onToggle = renderRow(baseProp);
    fireEvent.click(screen.getByTitle("Pausar publicación"));
    expect(onToggle).toHaveBeenCalledWith(7);
  });

  it("resumes a paused property", () => {
    renderRow({ ...baseProp, status: "paused" });
    expect(screen.getByTitle("Reanudar publicación")).toBeInTheDocument();
  });

  it.each(["draft", "pending_approval"])("hides the button for %s properties", (status) => {
    renderRow({ ...baseProp, status });
    expect(screen.queryByTitle("Pausar publicación")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Reanudar publicación")).not.toBeInTheDocument();
  });

  it("labels drafts and pending properties with their real status", () => {
    renderRow({ ...baseProp, status: "pending_approval" });
    expect(screen.getByText("En revisión")).toBeInTheDocument();
    expect(screen.queryByText("Pausada")).not.toBeInTheDocument();
  });
});

describe("PropertyRow visibility actions (destacar / InfoMonedas)", () => {
  it("offers to feature a published property that is not featured yet", () => {
    const onFeature = vi.fn();
    renderRow(baseProp, vi.fn(), onFeature);
    fireEvent.click(screen.getByTitle("Destacar (usa 1 destacado)"));
    expect(onFeature).toHaveBeenCalledWith(baseProp);
    expect(screen.getByTitle("Asignar InfoMonedas")).toBeInTheDocument();
  });

  it("hides the feature button once the property is featured and shows its tier", () => {
    renderRow({ ...baseProp, isFeatured: true, publicationType: "featured" });
    expect(screen.queryByTitle("Destacar (usa 1 destacado)")).not.toBeInTheDocument();
    expect(screen.getByText("Destacada")).toBeInTheDocument();
  });

  it("labels super featured properties", () => {
    renderRow({ ...baseProp, publicationType: "premium", infocoinsCount: 3 });
    expect(screen.getByText("Súper destacada")).toBeInTheDocument();
  });

  it("shows archived properties without edit or boost actions", () => {
    renderRow({ ...baseProp, status: "archived", archiveDeletesAt: "2026-12-20T00:00:00.000Z" });
    expect(screen.getByText("Archivada")).toBeInTheDocument();
    expect(screen.getByText(/Archivada por suscripción vencida/)).toBeInTheDocument();
    expect(screen.queryByTitle("Editar")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Destacar (usa 1 destacado)")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Asignar InfoMonedas")).not.toBeInTheDocument();
  });
});
