import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api } from "@/api/api";
import {
  useGuideCategories,
  useGuideListing,
  useGuideSearch,
  useRegisterGuideView,
  useSendGuideInquiry,
} from "@/hooks/useGuideDirectory";
import { useMyGuideAdvertiser, useSaveGuideAdvertiser } from "@/hooks/useGuideAdvertiser";
import { useGuideListingActions, useMyGuideListings, useSaveGuideListing } from "@/hooks/useGuideListings";
import { useMarkGuideInquiryRead, useMyGuideInquiries } from "@/hooks/useGuideInquiries";
import { useGuideAdminTaxonomy, useGuideModeration } from "@/hooks/useGuideAdmin";
import { advertiserToForm, listingToForm } from "@/hooks/guide.payloads";

vi.mock("@/api/api", () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

let client;
const wrapper = ({ children }) => React.createElement(QueryClientProvider, { client }, children);

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});

describe("capa pública", () => {
  it("categorías desde /guide/categories", async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: 1, slug: "empresas", name: "Empresas", trades: [] }] });
    const { result } = renderHook(() => useGuideCategories(), { wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(api.get).toHaveBeenCalledWith("/guide/categories");
  });

  it("búsqueda paginada con filtros y per_page", async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: 1, slug: "a", title: "A" }], meta: { current_page: 1, last_page: 2, total: 13 } });
    const { result } = renderHook(() => useGuideSearch({ trade: "plomeros" }), { wrapper });
    await waitFor(() => expect(result.current.data?.items).toHaveLength(1));
    expect(api.get).toHaveBeenCalledWith("/guide/listings", { params: { per_page: 12, trade: "plomeros" } });
    expect(result.current.data.meta.total).toBe(13);
  });

  it("ficha 404 no reintenta y expone error", async () => {
    api.get.mockRejectedValue(Object.assign(new Error("No encontrado"), { status: 404 }));
    const { result } = renderHook(() => useGuideListing("no-existe"), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  it("registra la visita una sola vez por sesión", () => {
    api.post.mockResolvedValue({ views_count: 1 });
    const { rerender } = renderHook(({ slug }) => useRegisterGuideView(slug), { wrapper, initialProps: { slug: "ficha" } });
    rerender({ slug: "ficha" });
    renderHook(() => useRegisterGuideView("ficha"), { wrapper });
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith("/guide/listings/ficha/view", {});
  });

  it("consulta va a /inquiries de la publicación", async () => {
    api.post.mockResolvedValueOnce({ message: "ok" });
    const { result } = renderHook(() => useSendGuideInquiry("ficha"), { wrapper });
    await act(() => result.current.mutateAsync({ name: "Ana", type: "budget" }));
    expect(api.post).toHaveBeenCalledWith("/guide/listings/ficha/inquiries", { name: "Ana", type: "budget" });
  });
});

describe("panel del anunciante", () => {
  it("sin perfil devuelve null (no es error)", async () => {
    api.get.mockResolvedValueOnce({ data: null });
    const { result } = renderHook(() => useMyGuideAdvertiser(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it("alta del perfil por POST con términos; edición por PUT", async () => {
    api.post.mockResolvedValueOnce({ data: { id: 1, name: "Pérez" }, message: "creado" });
    const { result } = renderHook(() => useSaveGuideAdvertiser({ hasProfile: false }), { wrapper });
    const res = await act(() => result.current.save({ ...advertiserToForm(null), name: "Pérez", tradeIds: [1], acceptTerms: true }));
    expect(api.post).toHaveBeenCalledWith("/guide/me/advertiser", expect.objectContaining({ name: "Pérez", accept_terms: true }));
    expect(res.advertiser.name).toBe("Pérez");

    api.put.mockResolvedValueOnce({ data: { id: 1, name: "Pérez Hnos" } });
    const edit = renderHook(() => useSaveGuideAdvertiser({ hasProfile: true }), { wrapper });
    await act(() => edit.result.current.save({ ...advertiserToForm(null), name: "Pérez Hnos" }));
    expect(api.put).toHaveBeenCalledWith("/guide/me/advertiser", expect.not.objectContaining({ accept_terms: expect.anything() }));
  });

  it("mis publicaciones", async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: 1, title: "A", status: "draft" }] });
    const { result } = renderHook(() => useMyGuideListings(), { wrapper });
    await waitFor(() => expect(result.current.data?.[0].status).toBe("draft"));
    expect(api.get).toHaveBeenCalledWith("/guide/me/listings");
  });

  it("alta de publicación y después sube las fotos nuevas en tandas de 3", async () => {
    api.post
      .mockResolvedValueOnce({ data: { id: 5, title: "A" }, message: "enviada" })
      .mockResolvedValueOnce({ data: { id: 5, photos: [] } })
      .mockResolvedValueOnce({ data: { id: 5, photos: [{ id: 1, url: "u" }] } });
    const spy = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useSaveGuideListing(undefined), { wrapper });
    const files = [1, 2, 3, 4].map((n) => new File(["x"], `${n}.jpg`, { type: "image/jpeg" }));
    const res = await act(() => result.current.save({ form: { ...listingToForm(null), tradeId: "2", title: "A" }, newFiles: files }));

    expect(api.post).toHaveBeenNthCalledWith(1, "/guide/me/listings", expect.objectContaining({ trade_id: 2, as_draft: false }));
    expect(api.post).toHaveBeenNthCalledWith(2, "/guide/me/listings/5/photos", expect.any(FormData));
    expect(api.post).toHaveBeenNthCalledWith(3, "/guide/me/listings/5/photos", expect.any(FormData));
    expect(res.listing.photos).toHaveLength(1);
    expect(res.message).toBe("enviada");
    expect(spy).toHaveBeenCalledWith({ queryKey: ["guide_my_listings"] });
  });

  it("edición usa PUT", async () => {
    api.put.mockResolvedValueOnce({ data: { id: 5 } });
    const { result } = renderHook(() => useSaveGuideListing(5), { wrapper });
    await act(() => result.current.save({ form: listingToForm(null), asDraft: true }));
    expect(api.put).toHaveBeenCalledWith("/guide/me/listings/5", expect.objectContaining({ as_draft: true }));
  });

  it("acciones de fila: pausar, duplicar, borrar", async () => {
    api.patch.mockResolvedValue({});
    api.post.mockResolvedValue({});
    api.delete.mockResolvedValue(null);
    const { result } = renderHook(() => useGuideListingActions(), { wrapper });
    await act(() => result.current.toggle(3));
    await act(() => result.current.duplicate(3));
    await act(() => result.current.remove(3));
    expect(api.patch).toHaveBeenCalledWith("/guide/me/listings/3/toggle-status");
    expect(api.post).toHaveBeenCalledWith("/guide/me/listings/3/duplicate", {});
    expect(api.delete).toHaveBeenCalledWith("/guide/me/listings/3");
  });

  it("consultas: listado paginado y marcar leída", async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: 1, type: "info" }], meta: { total: 1 } });
    const { result } = renderHook(() => useMyGuideInquiries({ unread: 1 }), { wrapper });
    await waitFor(() => expect(result.current.data?.items).toHaveLength(1));
    expect(api.get).toHaveBeenCalledWith("/guide/me/inquiries", { params: { per_page: 20, unread: 1 } });

    api.patch.mockResolvedValueOnce({});
    const mark = renderHook(() => useMarkGuideInquiryRead(), { wrapper });
    act(() => mark.result.current.markRead(1));
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith("/guide/me/inquiries/1/read"));
  });
});

describe("admin", () => {
  it("moderar con motivo y suspender anunciante", async () => {
    api.patch.mockResolvedValue({});
    const { result } = renderHook(() => useGuideModeration(), { wrapper });
    await act(() => result.current.moderate({ id: 4, action: "reject", reason: "Fotos" }));
    await act(() => result.current.setAdvertiserStatus({ id: 2, status: "suspended" }));
    expect(api.patch).toHaveBeenCalledWith("/guide/admin/listings/4/moderate", { action: "reject", reason: "Fotos" });
    expect(api.patch).toHaveBeenCalledWith("/guide/admin/advertisers/2/status", { status: "suspended" });
  });

  it("ABM: crea con POST y edita con PUT", async () => {
    api.get.mockResolvedValue({ data: [] });
    api.post.mockResolvedValue({});
    api.put.mockResolvedValue({});
    const { result } = renderHook(() => useGuideAdminTaxonomy(), { wrapper });
    await act(() => result.current.saveCategory({ name: "Nueva" }));
    await act(() => result.current.saveTrade({ id: 8, active: false }));
    expect(api.post).toHaveBeenCalledWith("/guide/admin/categories", { name: "Nueva" });
    expect(api.put).toHaveBeenCalledWith("/guide/admin/trades/8", { active: false });
  });
});
