import React, { useState } from "react";
import { FileSearch } from "lucide-react";
import CertificationReviewModal from "./CertificationReviewModal";

/**
 * Celda de acciones de certificación en la tabla admin. Muestra "Revisar" solo para
 * propiedades con certificación pendiente; abre el modal para ver el documento y moderar.
 */
export default function CertificationCell({ property, onModerate, disabled }) {
  const [open, setOpen] = useState(false);

  if (property.certificationStatus !== "pending") return null;

  const moderate = (status) => {
    onModerate(property.id, status);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="p-3 text-amber-500 hover:text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all disabled:opacity-40"
        title="Revisar certificación pendiente"
      >
        <FileSearch className="w-5 h-5" />
      </button>
      {open && (
        <CertificationReviewModal
          property={property}
          onModerate={moderate}
          onClose={() => setOpen(false)}
          disabled={disabled}
        />
      )}
    </>
  );
}
