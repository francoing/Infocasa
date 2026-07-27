import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGeoapifyAutocomplete } from "./useGeoapifyPlaces";
import { useUserProvince } from "./useUserProvince";
import { usePropertyFormRefs } from "./usePropertyFormRefs";

// Etiqueta de la UI → enum de operación del backend (sale|rent|temporary_rent).
const mapOperationToApi = (op) => {
  if (op === "Alquilar") return "rent";
  if (op === "Temporario") return "temporary_rent";
  return "sale"; // Comprar / Vender
};

// Emite propertyTypeId (id real del tipo), la misma clave que lee el panel de
// filtros (readFilters) → el tipo elegido en el home queda seleccionado allá.
const buildSearchUrl = ({ operation, inputValue, propertyTypeId, maxPrice }) => {
  const params = new URLSearchParams();
  params.set("operation", mapOperationToApi(operation));
  params.set("location", inputValue.trim());
  if (propertyTypeId) params.set("propertyTypeId", propertyTypeId);
  if (maxPrice) params.set("maxPrice", maxPrice);
  return `/search?${params.toString()}`;
};

/**
 * Lógica del buscador del Home: estado del formulario, autocompletado Geoapify,
 * gate de ubicación (se pregunta una sola vez) y navegación a /search o /explore.
 */
export const useHomeSearch = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [operation, setOperation] = useState("Comprar");
  const [inputValue, setInputValue] = useState("");
  const [propertyTypeId, setPropertyTypeId] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Tipos reales (id + nombre) para que el select del home use los mismos ids
  // que el panel de filtros.
  const { propertyTypes: propertyTypeOptions } = usePropertyFormRefs();

  const { status: gateStatus, province: userProvince, error: gateError, checkProvince, reset: resetGate } = useUserProvince();
  const [gateOpen, setGateOpen] = useState(false);
  // Acción disparada tras pasar el gate: "list" (listado /search) o "map" (/explore).
  const [pendingAction, setPendingAction] = useState("list");
  const [locationVerified, setLocationVerified] = useState(
    () => sessionStorage.getItem("infocasa_location_verified") === "true"
  );

  const runAction = (action) => {
    if (action === "map") navigate(`/explore/${operation || "Comprar"}`);
    else navigate(buildSearchUrl({ operation, inputValue, propertyTypeId, maxPrice }));
  };

  // Cuando el gate se resuelve "allowed", recordamos y ejecutamos la acción pendiente.
  useEffect(() => {
    if (gateStatus === "allowed" && gateOpen) {
      setGateOpen(false);
      setLocationVerified(true);
      sessionStorage.setItem("infocasa_location_verified", "true");
      runAction(pendingAction);
      resetGate();
    }
  }, [gateStatus, operation, inputValue, propertyTypeId, maxPrice, gateOpen, pendingAction]);

  const { suggestions, loading: geoLoading, setQuery, clearSuggestions } = useGeoapifyAutocomplete();
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const selectSuggestion = (suggestion) => {
    setInputValue(suggestion.city || suggestion.state || suggestion.value);
    setShowSuggestions(false);
    setFocusedIdx(-1);
    clearSuggestions();
  };

  const handleTagKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIdx((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && focusedIdx >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[focusedIdx]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setFocusedIdx(-1);
    }
  };

  // Dispara una acción ("list" | "map"); si falta verificar ubicación, abre el
  // gate y la deja pendiente para ejecutarla al resolverse.
  const trigger = (action) => {
    if (!locationVerified) {
      setPendingAction(action);
      setGateOpen(true);
      return;
    }
    runAction(action);
  };

  // Submit / Enter y botón "Listado de propiedades": van al listado /search.
  const handleSearch = (e) => {
    e.preventDefault();
    trigger("list");
  };

  // Botón "Buscar en Mapa": va al explorador de mapa /explore.
  const handleMapExplore = () => trigger("map");

  const handleGateAccept = () => checkProvince();

  const handleGateClose = () => {
    setGateOpen(false);
    if (gateStatus !== "allowed") setOperation("");
    resetGate();
  };

  return {
    inputRef,
    operation, setOperation,
    inputValue, setInputValue,
    propertyTypeId, setPropertyTypeId, propertyTypeOptions,
    maxPrice, setMaxPrice,
    suggestions, geoLoading, setQuery,
    focusedIdx, setFocusedIdx,
    showSuggestions, setShowSuggestions,
    selectSuggestion, handleTagKeyDown,
    handleSearch, handleMapExplore,
    gate: { open: gateOpen, status: gateStatus, province: userProvince, error: gateError, onAccept: handleGateAccept, onClose: handleGateClose },
  };
};
