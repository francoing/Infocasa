import { useState, useEffect } from "react";
import { usePropertyFormRefs } from "./usePropertyFormRefs";
import {
  INITIAL_STATE,
  mapInitialToForm,
  findClosestLocation,
  buildPropertyPayload,
  buildImageOps,
} from "../features/property/propertyForm.helpers";

/**
 * Controlador del formulario de propiedad: estado, cascada provincia→departamento→ubicación,
 * handlers y armado del payload. La transformación pesada vive en propertyForm.helpers
 * para mantener este hook fino. Los datos de referencia vienen de usePropertyFormRefs.
 */
export const usePropertyForm = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const { locations, propertyTypes, zones, availableFeatures, loadingRefs } = usePropertyFormRefs();
  const [formError, setFormError] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // Poblar el form al editar.
  useEffect(() => {
    if (initialData) setFormData(mapInitialToForm(initialData));
  }, [initialData]);

  // Al cargar locations con initialData → derivar provincia/departamento.
  useEffect(() => {
    if (!initialData || locations.length === 0) return;
    const locId = initialData.locationDetails?.id || initialData.location_id;
    const loc = locId && locations.find((l) => l.id == locId);
    if (loc) {
      setSelectedProvince(loc.province);
      setSelectedDepartment(loc.department);
    }
  }, [initialData, locations]);

  // Si la ubicación elegida ya no cabe en provincia/departamento → resetear.
  // (La zona es un campo independiente; NO filtra ubicaciones.)
  useEffect(() => {
    if (locations.length === 0 || !formData.location_id) return;
    const stillExists = locations.some((l) => {
      if (selectedProvince && l.province !== selectedProvince) return false;
      if (selectedDepartment && l.department !== selectedDepartment) return false;
      return l.id == formData.location_id;
    });
    if (!stillExists) setFormData((prev) => ({ ...prev, location_id: "" }));
  }, [selectedProvince, selectedDepartment, formData.location_id, locations]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
    setSelectedDepartment("");
    setFormData((prev) => ({ ...prev, location_id: "" }));
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
    setFormData((prev) => ({ ...prev, location_id: "" }));
  };

  const handleMapLocationChange = ({ latitude, longitude, address }) => {
    setFormData((prev) => ({ ...prev, latitude, longitude, ...(address != null ? { address } : {}) }));
    if (latitude == null || longitude == null || locations.length === 0) return;
    // Respetar provincia/departamento ya elegidos: buscar la ubicación más cercana dentro de ese ámbito.
    const scoped = locations.filter(
      (l) =>
        (!selectedProvince || l.province === selectedProvince) &&
        (!selectedDepartment || l.department === selectedDepartment),
    );
    const closest = findClosestLocation(latitude, longitude, scoped.length > 0 ? scoped : locations);
    if (!closest) return;
    // Solo autocompletar los selects que el usuario aún no fijó (no pisar su elección).
    if (!selectedProvince) setSelectedProvince(closest.province);
    if (!selectedDepartment) setSelectedDepartment(closest.department);
    setFormData((prev) => ({ ...prev, location_id: closest.id }));
  };

  const handleImagesChange = (images) => {
    const first = images[0];
    const firstUrl = !first ? "" : first instanceof File ? "" : typeof first === "string" ? first : first.url || "";
    setFormData((prev) => ({ ...prev, imageUrl: firstUrl, gallery: images }));
  };

  const handleCertDocChange = (e) => {
    setFormData((prev) => ({ ...prev, certification_document: e.target.files?.[0] || null }));
  };

  const clearCertDoc = () => setFormData((prev) => ({ ...prev, certification_document: null }));

  const setPublicationType = (type) => setFormData((prev) => ({ ...prev, publication_type: type }));

  const handleFeatureToggle = (featureName) => {
    setFormData((prev) => {
      const exists = prev.features.includes(featureName);
      const features = exists ? prev.features.filter((n) => n !== featureName) : [...prev.features, featureName];
      return { ...prev, features };
    });
  };

  const isTempRent = formData.status === "temporary_rent";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProvince) return setFormError("Debes seleccionar una provincia.");
    if (!selectedDepartment) return setFormError("Debes seleccionar un departamento.");
    if (isTempRent && !formData.certification_document) {
      return setFormError("Para Alquiler Temporario es obligatorio adjuntar un comprobante de servicio que acredite el domicilio.");
    }
    setFormError("");
    const fd = buildPropertyPayload(formData, selectedProvince, selectedDepartment);
    const { imageFiles, ops } = buildImageOps(formData.gallery, initialData);
    onSubmit(fd, imageFiles, ops);
  };

  // Cascada derivada provincia → departamento → ubicación.
  const provinces = [...new Set(locations.map((l) => l.province))].sort();
  const departments = [...new Set(
    locations.filter((l) => !selectedProvince || l.province === selectedProvince).map((l) => l.department),
  )].sort();
  const filteredLocations = locations.filter((l) => {
    if (selectedProvince && l.province !== selectedProvince) return false;
    if (selectedDepartment && l.department !== selectedDepartment) return false;
    return true;
  });

  return {
    formData,
    setFormData,
    formError,
    isTempRent,
    loadingRefs,
    propertyTypes,
    zones,
    availableFeatures,
    selectedProvince,
    selectedDepartment,
    provinces,
    departments,
    filteredLocations,
    handleChange,
    handleProvinceChange,
    handleDepartmentChange,
    handleMapLocationChange,
    handleImagesChange,
    handleCertDocChange,
    clearCertDoc,
    setPublicationType,
    handleFeatureToggle,
    handleSubmit,
  };
};
