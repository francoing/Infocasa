import { describe, it, expect } from "vitest";
import {
  coverageText,
  guideStatusMeta,
  mapGuideAdvertiser,
  mapGuideCategory,
  mapGuideInquiry,
  mapGuideListing,
  socialUrl,
  videoEmbedUrl,
  whatsappDigits,
} from "@/hooks/guide.mappers";
import {
  advertiserToForm,
  buildListingPreview,
  firstErrors,
  listingToForm,
  toAdvertiserPayload,
  toListingPayload,
} from "@/hooks/guide.payloads";

const apiListing = {
  id: 7,
  slug: "electricista-24-hs",
  title: "Electricista 24 hs",
  description: "Instalaciones y urgencias",
  status: "published",
  category: { id: 2, slug: "oficios-y-servicios", name: "Oficios y servicios" },
  trade: { id: 9, slug: "electricistas", name: "Electricistas" },
  advertiser: { id: 3, slug: "perez", name: "Pérez", type: "trade_provider", social: { instagram: "@perez", x: "" } },
  photos: [{ id: 1, url: "https://cdn/a.webp", order_index: 0 }],
  cover_url: "https://cdn/a.webp",
  contact: { phone: "381555", whatsapp: "549381555", email: "a@b.com", website: null, social: {} },
  location: { province: "Tucumán", city: "Yerba Buena", latitude: -26.8 },
  coverage: { type: "cities", cities: ["Tafí Viejo"] },
  home_service: true,
  schedule: { mon: "9 a 18" },
  views_count: 12,
  own_contact: { phone: null, whatsapp: "549381555", email: null, website: null, social: {} },
};

describe("mapGuideListing / mapGuideAdvertiser", () => {
  it("mapea el contrato a camelCase con defaults", () => {
    const l = mapGuideListing(apiListing);
    expect(l).toMatchObject({
      id: 7,
      slug: "electricista-24-hs",
      coverUrl: "https://cdn/a.webp",
      province: "Tucumán",
      city: "Yerba Buena",
      neighborhood: "",
      latitude: -26.8,
      longitude: null,
      coverageCities: ["Tafí Viejo"],
      homeService: true,
      hasStore: false,
      viewsCount: 12,
      inquiriesCount: 0,
      rejectionReason: null,
    });
    expect(l.contact).toEqual({ phone: "381555", whatsapp: "549381555", email: "a@b.com", website: "", social: {} });
    expect(l.photos).toEqual([{ id: 1, url: "https://cdn/a.webp", orderIndex: 0 }]);
    expect(l.advertiser.typeLabel).toBe("Prestador de oficios");
    expect(l.advertiser.social).toEqual({ instagram: "@perez" }); // redes vacías fuera
  });

  it("null/undefined devuelve null", () => {
    expect(mapGuideListing(null)).toBeNull();
    expect(mapGuideAdvertiser(undefined)).toBeNull();
  });

  it("cuenta publicaciones del perfil público si no viene listings_count", () => {
    const a = mapGuideAdvertiser({ id: 1, name: "X", listings: [apiListing, apiListing] });
    expect(a.listingsCount).toBe(2);
    expect(a.listings[0].slug).toBe("electricista-24-hs");
  });

  it("categorías con rubros y conteos", () => {
    const c = mapGuideCategory({ id: 1, slug: "empresas", name: "Empresas", listings_count: 3, trades: [{ id: 5, name: "Constructoras", category_id: 1 }] });
    expect(c.trades[0]).toMatchObject({ id: 5, categoryId: 1, active: true, listingsCount: 0 });
    expect(c.listingsCount).toBe(3);
  });

  it("consultas: tipo legible y leída", () => {
    expect(mapGuideInquiry({ id: 1, type: "budget", read_at: null })).toMatchObject({ typeLabel: "Presupuesto", isRead: false });
    expect(mapGuideInquiry({ id: 2, type: "raro", read_at: "2026-01-01" })).toMatchObject({ typeLabel: "Otro", isRead: true });
  });
});

describe("helpers de presentación", () => {
  it("estado → etiqueta", () => {
    expect(guideStatusMeta("pending_approval")).toEqual({ label: "En revisión", tone: "amber" });
    expect(guideStatusMeta("desconocido").label).toBe("desconocido");
  });

  it("cobertura", () => {
    expect(coverageText({ coverageType: "province", province: "Tucumán" })).toBe("Toda la provincia de Tucumán");
    expect(coverageText({ coverageType: "cities", city: "Lules", coverageCities: ["Lules", "Famaillá"] })).toBe("Lules, Famaillá");
  });

  it("WhatsApp, redes y video", () => {
    expect(whatsappDigits("+54 9 381 555-1234")).toBe("5493815551234");
    expect(whatsappDigits("123")).toBeNull();
    expect(socialUrl("instagram", "@perez")).toBe("https://instagram.com/perez");
    expect(socialUrl("facebook", "https://fb.com/x")).toBe("https://fb.com/x");
    expect(socialUrl("instagram", "")).toBeNull();
    expect(videoEmbedUrl("https://www.youtube.com/watch?v=abc123XYZ")).toBe("https://www.youtube.com/embed/abc123XYZ");
    expect(videoEmbedUrl("https://youtu.be/abc123XYZ")).toBe("https://www.youtube.com/embed/abc123XYZ");
    expect(videoEmbedUrl("https://vimeo.com/76979871")).toBe("https://player.vimeo.com/video/76979871");
    expect(videoEmbedUrl("https://example.com/v.mp4")).toBeNull();
  });
});

describe("payloads", () => {
  it("perfil: alta con términos, vacíos a null y rubros numéricos", () => {
    const form = { ...advertiserToForm(null), name: " Pérez ", tradeIds: ["3", 4], acceptTerms: true, social: { instagram: "@p", tiktok: " " } };
    const payload = toAdvertiserPayload(form, { creating: true });
    expect(payload).toMatchObject({ type: "trade_provider", name: "Pérez", cuit: null, phone: null, trade_ids: [3, 4], accept_terms: true, social: { instagram: "@p" } });
    expect(toAdvertiserPayload(form)).not.toHaveProperty("accept_terms");
  });

  it("publicación: cobertura por localidades separadas por coma y horarios por día", () => {
    const form = { ...listingToForm(null), tradeId: "9", title: " Título ", description: "Desc", coverageCities: "Lules, , Tafí Viejo ", schedule: { mon: " 9 a 18 " } };
    const payload = toListingPayload(form, { asDraft: true });
    expect(payload).toMatchObject({ trade_id: 9, title: "Título", coverage_type: "cities", coverage_cities: ["Lules", "Tafí Viejo"], as_draft: true, video_url: null });
    expect(payload.schedule).toMatchObject({ mon: "9 a 18", tue: null, sun: null });
  });

  it("publicación: con provincia entera no manda localidades", () => {
    const payload = toListingPayload({ ...listingToForm(null), coverageType: "province", coverageCities: "Lules" });
    expect(payload.coverage_type).toBe("province");
    expect(payload.coverage_cities).toEqual([]);
  });

  it("listingToForm usa el contacto propio (sin herencia) para editar", () => {
    const form = listingToForm(mapGuideListing(apiListing));
    expect(form).toMatchObject({ tradeId: "9", whatsapp: "549381555", phone: "", coverageCities: "Tafí Viejo", homeService: true });
  });

  it("vista previa: contacto heredado del perfil y rubro desde el catálogo", () => {
    const categories = [mapGuideCategory({ id: 2, slug: "oficios", name: "Oficios", trades: [{ id: 9, slug: "electricistas", name: "Electricistas", category_id: 2 }] })];
    const advertiser = mapGuideAdvertiser({ id: 3, name: "Pérez", phone: "381111", whatsapp: "549381111" });
    const preview = buildListingPreview({ ...listingToForm(null), tradeId: "9", whatsapp: "549999999" }, { advertiser, categories, photos: [{ url: "blob:1" }] });
    expect(preview.trade.name).toBe("Electricistas");
    expect(preview.category.name).toBe("Oficios");
    expect(preview.contact.phone).toBe("381111"); // heredado
    expect(preview.contact.whatsapp).toBe("549999999"); // propio
    expect(preview.coverUrl).toBe("blob:1");
    expect(preview.title).toBe("Título de tu publicación");
  });

  it("firstErrors toma el primer mensaje de cada campo", () => {
    expect(firstErrors({ title: ["Obligatorio", "Otro"], cuit: "Inválido" })).toEqual({ title: "Obligatorio", cuit: "Inválido" });
    expect(firstErrors(undefined)).toEqual({});
  });
});
