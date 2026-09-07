import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, ShieldCheck, Shield, Users, Map, ArrowRight, BarChart3, Loader2, X, Check, Home, Building, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../../../common/components/Layout";
import PropertyCard from "../../../common/components/PropertyCard";
import { useProperties } from "../../../hooks/useProperties";
import HomeHero from "../components/HomeHero";
import FeaturedProperties from "../components/FeaturedProperties";
import HomeBenefits from "../components/HomeBenefits";
import HomeCTA from "../components/HomeCTA";

export default function HomePage() {
  const { data: properties, loading, error } = useProperties();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // — Estado del formulario
  const [operation, setOperation] = useState("Comprar");
  const [locationTags, setLocationTags] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [propertyTypes, setPropertyTypes] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rooms, setRooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [step, setStep] = useState(1); // 1 → operación, 2 → ubicación
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const [noticiaModalOpen, setNoticiaModalOpen] = useState(false);
  const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null);


  // — Gate de ubicación → solo pregunta ubicación UNA VEZ
  const { status: gateStatus, province: userProvince, error: gateError, checkProvince, reset: resetGate } = useUserProvince();
  const [gateOpen, setGateOpen] = useState(false);
  const [locationVerified, setLocationVerified] = useState(() =>
    sessionStorage.getItem("infocasa_location_verified") === "true"
  );

  // Cuando el gate se resuelve "allowed", recordamos y navegamos o ejecutamos la búsqueda
  useEffect(() => {
    if (gateStatus === "allowed" && gateOpen) {
      setGateOpen(false);
      setLocationVerified(true);
      sessionStorage.setItem("infocasa_location_verified", "true");
      
      if (inputValue.trim()) {
        const queryParams = new URLSearchParams();
        queryParams.set("operation", mapOperationToApi(operation));
        queryParams.set("location", inputValue.trim());
        if (propertyTypes) queryParams.set("type", propertyTypes);
        if (maxPrice) queryParams.set("maxPrice", maxPrice);
        navigate(`/search?${queryParams.toString()}`);
      } else {
        navigate(`/explore/${operation}`);
      }
      
      resetGate();
    }
  }, [gateStatus, operation, inputValue, propertyTypes, maxPrice, gateOpen]);
  

  useEffect(() => {
    if (noticiaSeleccionada) {
      const timer = setTimeout(() => {
        setNoticiaModalOpen(true);
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [noticiaSeleccionada]);
  // ==========================================

  const handleGateAccept = () => {
    checkProvince();
  };


  const handleGateClose = () => {
    setGateOpen(false);
    if (gateStatus !== "allowed") {
      setOperation("");
    }
    resetGate();
  };

  const featured = properties.slice(0, 6);

  // — Manejo de tags de ubicación
  const addLocationTag = (value) => {
    const trimmed = value.trim();
    if (trimmed && !locationTags.includes(trimmed)) {
      setLocationTags([...locationTags, trimmed]);
    }
    setInputValue("");
  };

  // — Geoapify Autocomplete
  const { suggestions, loading: geoLoading, setQuery, clearSuggestions } = useGeoapifyAutocomplete();
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const removeLocationTag = (tag) => {
    setLocationTags(locationTags.filter((t) => t !== tag));
  };

  const selectSuggestion = (suggestion) => {
    setInputValue(suggestion.city || suggestion.state || suggestion.value);
    setShowSuggestions(false);
    setFocusedIdx(-1);
    clearSuggestions();
  };

  const handleTagKeyDown = (e) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIdx((prev) => Math.min(prev + 1, suggestions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIdx((prev) => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === "Enter" && focusedIdx >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[focusedIdx]);
        return;
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
        setFocusedIdx(-1);
        return;
      }
    }
  };

  // — Submit
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Si la ubicación del usuario no está verificada, abrir el gate modal primero
    if (!locationVerified) {
      setGateOpen(true);
      return;
    }

    const queryParams = new URLSearchParams();
    queryParams.set("operation", mapOperationToApi(operation));

    if (inputValue.trim()) {
      queryParams.set("location", inputValue.trim());
      if (propertyTypes) {
        queryParams.set("type", propertyTypes);
      }
      if (maxPrice) {
        queryParams.set("maxPrice", maxPrice);
      }
      navigate(`/search?${queryParams.toString()}`);
    } else {
      // Si no especificó ubicación, vamos a la exploración de provincia (ExplorePage)
      navigate(`/explore/${operation}`);
    }
  };

  // — Exploración en el mapa / Gate de ubicación
  const handleMapExplore = () => {
    if (locationVerified) {
      navigate(`/explore/${operation || "Comprar"}`);
    } else {
      setGateOpen(true);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col">
        <HomeHero />
        <FeaturedProperties properties={properties} loading={loading} error={error} />
        <HomeNews />
        <HomeBenefits />
        <HomeCTA />
      </div>
    </Layout>
  );
}
