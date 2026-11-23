import { useState, useEffect } from "react";
import { usePropertyFormRefs } from "./usePropertyFormRefs";
import {
  INITIAL_STATE,
  mapInitialToForm,
  findClosestLocation,
  buildPropertyPayload,
  buildImageOps,
  validateFloorPlanFile,
} from "../features/property/propertyForm.helpers";
import { buildVideoOps } from "../features/property/videoUpload.helpers";
import { UBICACIONES_NOA } from "../data/ubicacionesNOA"; // 👈 Importamos el archivo estático

// Plano (opcional): elegir/validar el archivo y quitarlo. Quitar el que ya estaba cargado
// marca `floor_plan_removed` para que el backend lo borre (spec properties/floor_plan).
const useFloorPlanField = (setFormData) => {
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const file = e.target.files?.[0] || null;
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!file) return;
    const problem = validateFloorPlanFile(file);
    setError(problem || "");
    if (problem) return;
    setFormData((prev) => ({ ...prev, floor_plan: file, floor_plan_removed: false }));
  };

  const clear = () => {
    setError("");
    setFormData((prev) => ({
      ...prev,
      floor_plan: null,
      floor_plan_removed: prev.floor_plan_removed || Boolean(prev.floor_plan?.existingUrl),
    }));
  };

  return { error, handleChange, clear };
};

export const usePropertyForm = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState({
    ...INITIAL_STATE,
    infocoins: 0,
  });
  
  const floorPlan = useFloorPlanField(setFormData);

  const { locations, propertyTypes, availableFeatures, loadingRefs } = usePropertyFormRefs();
  
  const [formError, setFormError] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...mapInitialToForm(initialData),
        infocoins: 0,
      });
    }
  }, [initialData]);

  // Cuando se edita, precargamos provincia y departamento
  useEffect(() => {
    if (!initialData) return;
    
    // Si vienen directo en la data, los usamos
    if (initialData.province) setSelectedProvince(initialData.province);
    if (initialData.department) setSelectedDepartment(initialData.department);
    
    // Fallback por si vienen desde locationDetails
    if (!initialData.province && locations.length > 0) {
        const locId = initialData.locationDetails?.id || initialData.location_id;
        const loc = locId && locations.find((l) => l.id == locId);
        if (loc) {
          setSelectedProvince(loc.province);
          setSelectedDepartment(loc.department);
        }
    }
  }, [initialData, locations]);

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
    // NO borramos la dirección ni las coordenadas
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
    // NO borramos la dirección ni las coordenadas
  };

  // 👇 El mapa SOLO actualiza latitud y longitud
  const handleMapLocationChange = ({ latitude, longitude }) => {
    setFormData((prev) => ({ ...prev, latitude, longitude }));
    
    if (latitude == null || longitude == null || locations.length === 0) return;
    const scoped = locations.filter(
      (l) =>
        (!selectedProvince || l.province === selectedProvince) &&
        (!selectedDepartment || l.department === selectedDepartment),
    );
    const closest = findClosestLocation(latitude, longitude, scoped.length > 0 ? scoped : locations);
    
    if (closest) {
        setFormData((prev) => ({ ...prev, location_id: closest.id }));
    }
  };

  const handleImagesChange = (images) => {
    const first = images[0];
    const firstUrl = !first ? "" : first instanceof File ? "" : typeof first === "string" ? first : first.url || "";
    setFormData((prev) => ({ ...prev, imageUrl: firstUrl, gallery: images }));
  };

  const handleVideosChange = (videos) => setFormData((prev) => ({ ...prev, videos }));

  const handleCertDocChange = (e) => {
    setFormData((prev) => ({ ...prev, certification_document: e.target.files?.[0] || null }));
  };

  const clearCertDoc = () => setFormData((prev) => ({ ...prev, certification_document: null }));

  const setPublicationType = (type) => setFormData((prev) => ({ ...prev, publication_type: type }));
  
  const setInfocoins = (value) => setFormData((prev) => ({ ...prev, infocoins: value }));

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
    if (!formData.address) return setFormError("Debes escribir la dirección."); // Validación extra
    if (isTempRent && !formData.certification_document) {
      return setFormError("Para Alquiler Temporario es obligatorio adjuntar un comprobante de servicio que acredite el domicilio.");
    }
    setFormError("");
    
    const fd = buildPropertyPayload(formData, selectedProvince, selectedDepartment);
    
    fd.infocoins_amount = formData.infocoins || 0;

    const { imageFiles, ops } = buildImageOps(formData.gallery, initialData);
    onSubmit(fd, imageFiles, ops, buildVideoOps(formData.videos, initialData));
  };

  // 👇 Usamos las provincias estáticas
  const provinces = Object.keys(UBICACIONES_NOA).sort();
  
  // 👇 Los departamentos dependen de la provincia elegida
  const departments = selectedProvince ? UBICACIONES_NOA[selectedProvince] : [];
  
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
    handleVideosChange,
    handleCertDocChange,
    clearCertDoc,
    floorPlanError: floorPlan.error,
    handleFloorPlanChange: floorPlan.handleChange,
    clearFloorPlan: floorPlan.clear,
    setPublicationType,
    setInfocoins,
    handleFeatureToggle,
    handleSubmit,
  };
};
