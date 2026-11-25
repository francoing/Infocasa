import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import GuideListingCard from "@/features/guide/components/GuideListingCard";
import GuideContactButtons from "@/features/guide/components/GuideContactButtons";
import GuideInquiryForm from "@/features/guide/components/GuideInquiryForm";
import GuideStatusBadge from "@/features/guide/components/GuideStatusBadge";
import GuideMyListings from "@/features/guide/components/GuideMyListings";
import GuidePublishCta from "@/features/guide/components/GuidePublishCta";
import { mapGuideListing } from "@/hooks/guide.mappers";

const mutateAsync = vi.fn();
vi.mock("@/hooks/useGuideDirectory", () => ({
  useSendGuideInquiry: () => ({ mutateAsync, isPending: false }),
}));
const actions = { toggle: vi.fn(), duplicate: vi.fn(), remove: vi.fn(), isBusy: false };
vi.mock("@/hooks/useGuideListings", () => ({ useGuideListingActions: () => actions }));
vi.mock("@/hooks/useToast", () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }) }));

const listing = mapGuideListing({
  id: 7,
  slug: "electricista-24-hs",
  title: "Electricista 24 hs",
  description: "Urgencias",
  status: "published",
  trade: { id: 9, slug: "electricistas", name: "Electricistas" },
  advertiser: { id: 3, slug: "perez", name: "Pérez Electricidad" },
  location: { province: "Tucumán", city: "Yerba Buena" },
  coverage: { type: "province" },
  home_service: true,
  contact: { whatsapp: "5493815551234", phone: "381 555-1234", email: "a@b.com" },
});

beforeEach(() => {
  vi.clearAllMocks();
  window.dataLayer = [];
});

describe("GuideListingCard", () => {
  it("muestra datos clave y lleva a la ficha", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<GuideListingCard listing={listing} />} />
          <Route path="/guia/publicacion/:slug" element={<p>Ficha</p>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Electricistas")).toBeInTheDocument();
    expect(screen.getByText("Pérez Electricidad")).toBeInTheDocument();
    expect(screen.getByText(/A domicilio/)).toBeInTheDocument();
    expect(screen.getByText(/Toda la provincia de Tucumán/)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Electricista 24 hs"));
    expect(screen.getByText("Ficha")).toBeInTheDocument();
  });
});

describe("GuideContactButtons", () => {
  it("WhatsApp del anunciante empuja ic_whatsapp con sección guía", () => {
    render(
      <MemoryRouter initialEntries={["/guia/publicacion/electricista-24-hs"]}>
        <GuideContactButtons contact={listing.contact} title={listing.title} trackingParams={{ section: "guia", guide_listing_id: 7 }} />
      </MemoryRouter>
    );
    const wa = screen.getByText("WhatsApp").closest("a");
    expect(wa.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/5493815551234\?text=/);
    fireEvent.click(wa);
    expect(window.dataLayer.at(-1)).toMatchObject({ event: "ic_whatsapp", section: "guia", guide_listing_id: "7" });
    expect(screen.getByText("Llamar").closest("a").getAttribute("href")).toBe("tel:3815551234");
    expect(screen.getByText("Email").closest("a").getAttribute("href")).toBe("mailto:a@b.com");
    expect(screen.queryByText("Sitio web")).not.toBeInTheDocument();
  });

  it("sin WhatsApp no muestra el botón", () => {
    render(
      <MemoryRouter>
        <GuideContactButtons contact={{ phone: "381" }} title="X" />
      </MemoryRouter>
    );
    expect(screen.queryByText("WhatsApp")).not.toBeInTheDocument();
    expect(screen.getByText("Compartir")).toBeInTheDocument();
  });
});

describe("GuideInquiryForm", () => {
  it("precarga el usuario, envía como presupuesto y muestra la confirmación", async () => {
    mutateAsync.mockResolvedValueOnce({ message: "Tu consulta se envió." });
    render(<GuideInquiryForm slug="ficha" user={{ name: "Ana", email: "ana@x.com" }} defaultType="budget" />);
    expect(screen.getByDisplayValue("Ana")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Contá qué trabajo/), { target: { value: "Cambiar el tablero de casa" } });
    fireEvent.click(screen.getByRole("button", { name: /Pedir presupuesto/ }));
    await waitFor(() => expect(screen.getByText("Tu consulta se envió.")).toBeInTheDocument());
    expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ name: "Ana", type: "budget", message: "Cambiar el tablero de casa", phone: null }));
  });

  it("muestra los errores de validación del backend por campo", async () => {
    mutateAsync.mockRejectedValueOnce(Object.assign(new Error("Datos inválidos"), { errors: { email: ["El correo no es válido."] } }));
    render(<GuideInquiryForm slug="ficha" user={null} />);
    fireEvent.click(screen.getByRole("button", { name: /Enviar consulta/ }));
    await waitFor(() => expect(screen.getByText("El correo no es válido.")).toBeInTheDocument());
  });
});

describe("GuideStatusBadge", () => {
  it("traduce el estado", () => {
    render(<GuideStatusBadge status="pending_approval" />);
    expect(screen.getByText("En revisión")).toBeInTheDocument();
  });
});

describe("GuideMyListings", () => {
  const rows = [
    { ...listing, id: 1, status: "published", title: "Publicada" },
    { ...listing, id: 2, status: "rejected", title: "Rechazada", rejectionReason: "Faltan fotos" },
    { ...listing, id: 3, status: "pending_approval", title: "Pendiente" },
  ];

  it("muestra motivo de rechazo y solo deja pausar las publicadas/pausadas", () => {
    actions.toggle.mockResolvedValue({});
    render(
      <MemoryRouter>
        <GuideMyListings listings={rows} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Motivo del rechazo: Faltan fotos/)).toBeInTheDocument();
    const pauseButtons = screen.getAllByRole("button", { name: /Pausar|Activar/ });
    expect(pauseButtons).toHaveLength(1);
    fireEvent.click(pauseButtons[0]);
    expect(actions.toggle).toHaveBeenCalledWith(1);
  });

  it("perfil suspendido: sin acciones", () => {
    render(
      <MemoryRouter>
        <GuideMyListings listings={rows} disabled />
      </MemoryRouter>
    );
    expect(screen.queryByText("Nueva publicación")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Duplicar/ })).not.toBeInTheDocument();
  });
});

describe("GuidePublishCta", () => {
  const renderCta = (user) =>
    render(
      <MemoryRouter initialEntries={["/guia"]}>
        <Routes>
          <Route path="/guia" element={<GuidePublishCta user={user} />} />
          <Route path="/register" element={<p>Registro</p>} />
          <Route path="/dashboard" element={<p>Panel</p>} />
        </Routes>
      </MemoryRouter>
    );

  it("sin sesión va al registro", () => {
    renderCta(null);
    fireEvent.click(screen.getByText(/Publicá gratis en la Guía/));
    expect(screen.getByText("Registro")).toBeInTheDocument();
  });

  it("con sesión va al panel de la Guía", () => {
    renderCta({ id: 1 });
    fireEvent.click(screen.getByText(/Publicá gratis en la Guía/));
    expect(screen.getByText("Panel")).toBeInTheDocument();
  });
});
