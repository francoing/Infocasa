import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, FileSpreadsheet, Plus, PlusCircle } from "lucide-react";

/**
 * Botón "Publicar propiedad" del panel: abre un menú con "Crear publicación" (el
 * formulario de siempre) e "Importar desde CSV". Se cierra con click afuera, Escape
 * (devuelve el foco al botón) o al elegir una opción. Flechas ↑/↓ mueven el foco.
 */
export default function PublishPropertyMenu({ onImportCsv }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (!open) return;
    itemRefs.current[0]?.focus();
    const onPointer = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const moveFocus = (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = itemRefs.current.filter(Boolean);
    const index = items.indexOf(document.activeElement);
    const next = e.key === "ArrowDown" ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  const handleImport = () => {
    setOpen(false);
    onImportCsv();
  };

  const itemClass =
    "w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-bold text-slate-700 hover:bg-slate-100 focus:bg-slate-100 focus:outline-none transition-colors";

  return (
    <div ref={wrapperRef} className="relative w-full md:w-auto">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="publish-property-menu"
        onClick={() => setOpen((v) => !v)}
        className="w-full md:w-auto justify-center bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
      >
        <Plus className="w-5 h-5" /> Publicar propiedad
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          id="publish-property-menu"
          role="menu"
          aria-label="Publicar propiedad"
          onKeyDown={moveFocus}
          className="absolute right-0 z-30 mt-2 w-full md:w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2"
        >
          <Link
            ref={(el) => (itemRefs.current[0] = el)}
            to="/dashboard/properties/create"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            <PlusCircle className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
            <span>
              Crear publicación
              <span className="block text-xs font-medium text-slate-500">Cargá una propiedad con el formulario.</span>
            </span>
          </Link>
          <button
            ref={(el) => (itemRefs.current[1] = el)}
            type="button"
            role="menuitem"
            onClick={handleImport}
            className={itemClass}
          >
            <FileSpreadsheet className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
            <span>
              Importar desde CSV
              <span className="block text-xs font-medium text-slate-500">Subí varias propiedades de una vez.</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
