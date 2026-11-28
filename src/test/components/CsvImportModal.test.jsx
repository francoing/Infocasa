import React, { useState } from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CsvImportModal from "@/features/dashboard/components/CsvImportModal";

const { post, get } = vi.hoisted(() => ({ post: vi.fn(), get: vi.fn() }));

vi.mock("@/api/api", () => ({
  API_BASE_URL: "http://api.test/api/v1",
  api: { post, get },
}));

const queued = { id: 7, status: "queued", total_rows: 3, processed_rows: 0, counts: {}, rows: [] };
const done = {
  id: 7,
  status: "done",
  total_rows: 3,
  processed_rows: 3,
  counts: { created: 2, duplicates: 0, invalid: 1, plan_limit: 0, failed: 0, photo_warnings: 1, locations_created: 1 },
  rows: [
    { line: 1, external_id: "A1", result: "created", messages: ["Foto 2: no es una imagen."] },
    { line: 2, external_id: "A2", result: "created", messages: [] },
    { line: 3, external_id: "A3", result: "invalid", messages: ["El campo operación seleccionado es inválido."] },
  ],
};

let queryClient;

/** Envuelve el modal con el estado del padre (importId), como el Dashboard. */
function Harness({ onClose }) {
  const [importId, setImportId] = useState(null);
  return <CsvImportModal open onClose={onClose} importId={importId} onImportStarted={setImportId} />;
}

const renderModal = (onClose = vi.fn()) => {
  render(
    <QueryClientProvider client={queryClient}>
      <Harness onClose={onClose} />
    </QueryClientProvider>
  );
  return onClose;
};

const csvFile = () => new File(["external_id,title\nA1,Casa\n"], "casas.csv", { type: "text/csv" });

describe("CsvImportModal", () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    post.mockReset();
    get.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("muestra la guía y el link a la plantilla", () => {
    renderModal();
    expect(screen.getByRole("dialog", { name: /importar propiedades desde csv/i })).toBeInTheDocument();
    expect(screen.getByText(/descargá la plantilla/i)).toBeInTheDocument();
    expect(screen.getByText("external_id")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /descargar plantilla/i })).toHaveAttribute(
      "href",
      "http://api.test/api/v1/properties/import/template"
    );
  });

  it("se cierra con la X y con Escape", () => {
    const onClose = renderModal();
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("muestra el error del backend (encabezados inválidos)", async () => {
    post.mockRejectedValue(Object.assign(new Error("invalid"), { status: 422, errors: { file: ["Faltan columnas obligatorias en el CSV: city"] } }));
    renderModal();

    fireEvent.change(screen.getByLabelText("Archivo CSV"), { target: { files: [csvFile()] } });
    fireEvent.click(screen.getByRole("button", { name: "Importar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Faltan columnas obligatorias en el CSV: city");
  });

  it("sube el archivo, muestra 'Importando…' mientras procesa y luego el resumen", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    post.mockResolvedValue({ data: queued });
    get.mockResolvedValueOnce({ data: queued }).mockResolvedValue({ data: done });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    renderModal();

    expect(screen.getByRole("button", { name: "Importar" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Archivo CSV"), { target: { files: [csvFile()] } });
    expect(screen.getByText("casas.csv")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Importar" }));

    expect(await screen.findByText(/importando…/i)).toBeInTheDocument();
    expect(post).toHaveBeenCalledWith("/properties/import", expect.any(FormData));
    expect(post.mock.calls[0][1].get("file").name).toBe("casas.csv");

    await act(async () => {
      vi.advanceTimersByTime(3100);
    });

    expect(await screen.findByText(/importación terminada/i)).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith("/properties/imports/7");
    expect(screen.getByText("Creadas como borrador").nextSibling).toHaveTextContent("2");
    expect(screen.getByText(/filas que no se importaron/i)).toBeInTheDocument();
    expect(screen.getByText("El campo operación seleccionado es inválido.")).toBeInTheDocument();
    expect(screen.getByText("Foto 2: no es una imagen.")).toBeInTheDocument();

    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ["me_properties"] }));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["publication_quota"] });
  });
});
