// Helpers puros del formulario de propiedad: estado inicial, mapeo de initialData,
// construcción del payload multipart y operaciones de imágenes. Fuera del componente/hook
// para mantenerlos finos (la lógica de transformación no infla su complejidad).

export const INITIAL_STATE = {
  title: "",
  description: "",
  price: "",
  price_currency: "USD",
  location_id: "",
  property_type_id: "",
  zone_id: "",
  status: "venta", // operation
  bedrooms: "",
  bathrooms: "",
  rooms: "",
  area: "",
  area_covered: "",
  imageUrl: "",
  gallery: [],
  featured: false,
  latitude: null,
  longitude: null,
  showExactAddress: true,
  publication_type: "basic",
  address: "",
  expenses_amount: "",
  expenses_currency: "ARS",
  parking_spaces: "",
  construction_year: "",
  condition: "good",
  disposition: "",
  orientation: "",
  pets_allowed: false,
  professional_use: false,
  features: [],
  certification_document: null,
};

const STATUS_BY_OPERATION = {
  temporary_rent: "temporary_rent",
  rent: "alquiler",
  development: "desarrollo",
};

const OPERATION_BY_STATUS = {
  alquiler: "rent",
  temporary_rent: "temporary_rent",
  desarrollo: "development",
};

const toNum = (v) => (v !== null && v !== undefined ? Number(v) : null);

/** Ubicación más cercana (distancia euclídea) a unas coordenadas dentro de la lista. */
export const findClosestLocation = (lat, lng, locs) => {
  let closest = null;
  let minDist = Infinity;
  for (const loc of locs) {
    const dlat = lat - parseFloat(loc.latitude);
    const dlng = lng - parseFloat(loc.longitude);
    const dist = dlat * dlat + dlng * dlng;
    if (dist < minDist) {
      minDist = dist;
      closest = loc;
    }
  }
  return closest;
};

/** Mapea la propiedad existente (initialData) al shape del formulario. */
export const mapInitialToForm = (initialData) => ({
  ...INITIAL_STATE,
  title: initialData.title || "",
  description: initialData.description || "",
  price: initialData.price || "",
  price_currency: initialData.priceCurrency || "USD",
  location_id: initialData.locationDetails?.id || initialData.location_id || "",
  property_type_id: initialData.typeId || initialData.property_type_id || "",
  zone_id: initialData.zoneId || initialData.zone?.id || initialData.zone_id || "",
  status: STATUS_BY_OPERATION[initialData.operationRaw] || "venta",
  bedrooms: initialData.bedrooms ?? "",
  bathrooms: initialData.bathrooms ?? "",
  rooms: initialData.rooms ?? "",
  area: initialData.areaTotal ?? "",
  area_covered: initialData.areaCovered ?? "",
  imageUrl: initialData.imageUrl || "",
  // Imágenes existentes: preservar { id, url } para poder borrar/reordenar (spec property/image_management).
  gallery: initialData.images?.map((img) => ({ id: img.id, url: img.url, is_cover: img.is_cover })) || [],
  featured: !!initialData.featured,
  latitude: toNum(initialData.locationDetails?.latitude ?? initialData.latitude),
  longitude: toNum(initialData.locationDetails?.longitude ?? initialData.longitude),
  showExactAddress: initialData.showExactAddress !== undefined ? !!initialData.showExactAddress : true,
  address: initialData.address || "",
  expenses_amount: initialData.expenses?.amount ?? "",
  expenses_currency: initialData.expenses?.currency || "ARS",
  parking_spaces: initialData.parkingSpaces ?? initialData.parking_spaces ?? "",
  construction_year: initialData.constructionYear ?? initialData.construction_year ?? "",
  condition: initialData.condition || "good",
  disposition: initialData.disposition || "",
  orientation: initialData.orientation || "",
  pets_allowed: !!(initialData.petsAllowed ?? initialData.pets_allowed),
  professional_use: !!(initialData.professionalUse ?? initialData.professional_use),
  features: initialData.features?.map((f) => f.name) || [],
  certification_document: initialData.certificationDocumentUrl
    ? { existingUrl: initialData.certificationDocumentUrl, name: "Comprobante ya cargado" }
    : null,
});

// Agrega al FormData solo si el valor está seteado (no vacío/null/undefined).
const appendIfSet = (fd, key, val, fn = (v) => v) => {
  if (val !== "" && val !== null && val !== undefined) fd.append(key, fn(val));
};

/** Construye el multipart/form-data que espera el backend a partir del estado del form. */
export const buildPropertyPayload = (formData, selectedProvince, selectedDepartment) => {
  const fd = new FormData();
  fd.append("title", formData.title);
  fd.append("description", formData.description);
  fd.append("price_amount", Number(formData.price));
  fd.append("price_currency", formData.price_currency || "USD");
  fd.append("location_id", Number(formData.location_id));
  fd.append("province", selectedProvince || "");
  fd.append("department", selectedDepartment || "");
  fd.append("property_type_id", Number(formData.property_type_id));
  fd.append("zone_id", Number(formData.zone_id));
  fd.append("operation", OPERATION_BY_STATUS[formData.status] || "sale");

  appendIfSet(fd, "bedrooms", formData.bedrooms, Number);
  appendIfSet(fd, "bathrooms", formData.bathrooms, Number);
  appendIfSet(fd, "rooms", formData.rooms, Number);
  appendIfSet(fd, "area_total", formData.area, Number);
  appendIfSet(fd, "area_covered", formData.area_covered, Number);
  appendIfSet(fd, "latitude", formData.latitude, Number);
  appendIfSet(fd, "longitude", formData.longitude, Number);
  fd.append("show_exact_address", formData.showExactAddress ? "1" : "0");
  appendIfSet(fd, "address", formData.address);
  if (formData.expenses_amount !== "") {
    fd.append("expenses_amount", Number(formData.expenses_amount));
    fd.append("expenses_currency", formData.expenses_currency);
  }
  fd.append("parking_spaces", formData.parking_spaces !== "" ? Number(formData.parking_spaces) : 0);
  appendIfSet(fd, "construction_year", formData.construction_year, Number);
  fd.append("condition", formData.condition || "good");
  appendIfSet(fd, "disposition", formData.disposition);
  appendIfSet(fd, "orientation", formData.orientation);
  fd.append("pets_allowed", formData.pets_allowed ? "1" : "0");
  fd.append("professional_use", formData.professional_use ? "1" : "0");
  fd.append("status", "published");
  fd.append("publication_type", formData.publication_type);
  formData.features.forEach((f) => fd.append("features[]", f));
  if (formData.certification_document instanceof File) {
    fd.append("certification_document", formData.certification_document);
  }
  return fd;
};

/**
 * Deriva las operaciones de imágenes al enviar (ver spec property/image_management):
 * archivos nuevos, ids borrados, orden de display y si algo cambió.
 */
export const buildImageOps = (gallery, initialData) => {
  const imageFiles = gallery.filter((item) => item instanceof File);
  const initialIds = (initialData?.images || []).map((img) => img.id);
  const survivingIds = gallery.filter((item) => !(item instanceof File) && item?.id != null).map((item) => item.id);
  const deletedImageIds = initialIds.filter((id) => !survivingIds.includes(id));
  const order = gallery.map((item) => (item instanceof File ? { type: "new" } : { type: "existing", id: item.id }));
  const orderChanged = JSON.stringify(survivingIds) !== JSON.stringify(initialIds.filter((id) => survivingIds.includes(id)));
  const changed = deletedImageIds.length > 0 || imageFiles.length > 0 || orderChanged;
  return { imageFiles, ops: { deletedImageIds, order, changed } };
};
