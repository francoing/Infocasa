import React from "react";

export default function Logo({ className = "", size = "text-2xl" }) {
  // Mapeamos tamaños de texto a alturas aproximadas para el imagotipo
  const heightClass = size.includes("text-3xl")
    ? "h-12"
    : size.includes("text-xl")
    ? "h-8"
    : "h-10";

  return (
    <img
      src="/img/imagotipo-horizontal.png"
      alt="Infocasa"
      className={`object-contain ${heightClass} ${className}`}
      style={{ filter: "none" }}
      onError={(e) => {
        // Fallback visual para detectar si la imagen no carga
        console.error("No se pudo cargar el logo:", e.currentTarget.src);
        e.currentTarget.style.outline = "2px dashed #ff0019";
      }}
    />
  );
}