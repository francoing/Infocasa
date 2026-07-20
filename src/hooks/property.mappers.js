// Mappers por grupo del shape de propiedad. Separados de mapProperty para que cada
// función quede bajo complejidad 20 (mapProperty tenía ~50 por los fallbacks por campo).

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6";
const OPERATION_LABEL = { sale: "Venta", rent: "Alquiler", development: "Desarrollo" };

const mapImageUrl = (item) => {
  if (item.images && item.images.length > 0) {
    const cover = item.images.find((img) => img.is_cover) || item.images[0];
    return cover.url;
  }
  return FALLBACK_IMAGE;
};

const mapLocationStr = (item) => {
  const loc = item.location;
  if (!loc) return "Ubicación no especificada";
  if (typeof loc === "string") return loc;
  const parts = [loc.neighborhood, loc.city, loc.province, loc.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Ubicación no especificada";
};

const mapCore = (item) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  price: parseFloat(item.price?.amount ?? item.price ?? 0),
  priceCurrency: item.price?.currency || item.currency || "USD",
  operation: OPERATION_LABEL[item.operation] || "Venta",
  operationRaw: item.operation,
});

const mapDimensions = (item) => ({
  rooms: item.dimensions?.rooms || 0,
  bedrooms: item.dimensions?.bedrooms || 0,
  bathrooms: item.dimensions?.bathrooms || 0,
  areaTotal: parseFloat(item.dimensions?.area_total || 0),
  areaCovered: parseFloat(item.dimensions?.area_covered || 0),
  area: parseFloat(item.dimensions?.area_total || 0),
});

const mapClassification = (item) => ({
  type: item.property_type?.name || "Departamento",
  typeId: item.property_type?.id,
  zoneId: item.zone_id || item.zone?.id || null,
  zone: item.zone || null,
  agency: item.agency,
  owner: item.owner,
});

const mapMedia = (item) => ({
  imageUrl: mapImageUrl(item),
  images: item.images || [],
  priceHistory: (item.price_history || []).map((h) => ({
    oldPrice: parseFloat(h.old_price),
    newPrice: parseFloat(h.new_price),
    percentage: parseFloat(h.percentage),
    date: h.changed_at,
  })),
});

const mapAttributes = (item) => ({
  showExactAddress: item.show_exact_address,
  latitude: item.coordinates?.latitude || item.location?.latitude || null,
  longitude: item.coordinates?.longitude || item.location?.longitude || null,
  address: item.address || "",
  expenses: item.expenses || { amount: null, currency: "ARS" },
  parkingSpaces: item.parking_spaces || 0,
  constructionYear: item.construction_year || null,
  condition: item.condition || "good",
  disposition: item.disposition || "",
  orientation: item.orientation || "",
  petsAllowed: !!item.pets_allowed,
  professionalUse: !!item.professional_use,
  features: item.features || [],
});

const mapMeta = (item) => ({
  favoritesCount: item.favorites_count || item.favoritesCount || item.favorites || 0,
  viewsCount: item.views_count || item.viewsCount || item.views || 0,
  isFavorited: item.is_favorited || false,
  status: item.status,
  createdAt: item.created_at,
  certificationStatus: item.certification_status || null,
  isCertified: !!item.is_certified,
  certificationDocumentUrl: item.certification_document_url || null,
});

/** Ensambla el shape de propiedad que consume la UI a partir del item crudo del backend. */
export const buildProperty = (item) => ({
  ...mapCore(item),
  ...mapDimensions(item),
  location: mapLocationStr(item),
  locationDetails: item.location,
  ...mapClassification(item),
  ...mapMedia(item),
  ...mapAttributes(item),
  ...mapMeta(item),
});
