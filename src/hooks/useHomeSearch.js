import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGeoapifyAutocomplete } from "./useGeoapifyPlaces";
import { useUserProvince } from "./useUserProvince";

// Etiqueta de la UI → enum de operación del backend (sale|rent|temporary_rent).
const mapOperationToApi = (op) => {
  if (op === "Alquilar") return "rent";
  if (op === "Temporario") return "temporary_rent";
  return "sale"; // Comprar / Vender
};

const buildSearchUrl = ({ operation, inputValue, propertyTypes, maxPrice }) => {
  const params = new URLSearchParams();
  params.set("operation", mapOperationToApi(operation));
  params.set("location", inputValue.trim());
  if (propertyTypes) params.set("type", propertyTypes);
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
  const [propertyTypes, setPropertyTypes] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const { status: gateStatus, province: userProvince, error: gateError, checkProvince, reset: resetGate } = useUserProvince();
  const [gateOpen, setGateOpen] = useState(false);
  const [locationVerified, setLocationVerified] = useState(
    () => sessionStorage.getItem("infocasa_location_verified") === "true"
  );

  const goToResults = () => {
    if (inputValue.trim()) navigate(buildSearchUrl({ operation, inputValue, propertyTypes, maxPrice }));
    else navigate(`/explore/${operation}`);
  };

  // Cuando el gate se resuelve "allowed", recordamos y ejecutamos la búsqueda pendiente.
  useEffect(() => {
    if (gateStatus === "allowed" && gateOpen) {
      setGateOpen(false);
      setLocationVerified(true);
      sessionStorage.setItem("infocasa_location_verified", "true");
      goToResults();
      resetGate();
    }
  }, [gateStatus, operation, inputValue, propertyTypes, maxPrice, gateOpen]);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (!locationVerified) {
      setGateOpen(true);
      return;
    }
    goToResults();
  };

  const handleMapExplore = () => {
    if (locationVerified) navigate(`/explore/${operation || "Comprar"}`);
    else setGateOpen(true);
  };

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
    propertyTypes, setPropertyTypes,
    maxPrice, setMaxPrice,
    suggestions, geoLoading, setQuery,
    focusedIdx, setFocusedIdx,
    showSuggestions, setShowSuggestions,
    selectSuggestion, handleTagKeyDown,
    handleSearch, handleMapExplore,
    gate: { open: gateOpen, status: gateStatus, province: userProvince, error: gateError, onAccept: handleGateAccept, onClose: handleGateClose },
  };
};
