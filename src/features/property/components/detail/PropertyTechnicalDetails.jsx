import React from "react";
import { CheckCircle2 } from "lucide-react";

// Traducción de valores del backend → etiqueta legible. Lookup maps en lugar de
// cadenas de ternarios anidados: complejidad cero y un solo lugar por dominio.
const CONDITION_LABELS = {
  good: "Excelente / Bueno",
  new: "A Estrenar",
  under_construction: "En Construcción",
  to_refurbish: "A Refaccionar",
};
const DISPOSITION_LABELS = {
  front: "Frente",
  back: "Contrafrente",
  lateral: "Lateral",
  internal: "Interno",
};
const ORIENTATION_LABELS = {
  north: "Norte",
  south: "Sur",
  east: "Este",
  west: "Oeste",
};

// Helpers de módulo: mantienen las cadenas de condición fuera de la complejidad de los componentes.
const computeHasTech = (p) =>
  !!(
    p.constructionYear ||
    p.expenses?.amount > 0 ||
    p.parkingSpaces > 0 ||
    p.condition ||
    p.disposition ||
    p.orientation ||
    p.petsAllowed ||
    p.professionalUse
  );

const Field = ({ label, value, capitalize = false }) => (
  <div className="flex flex-col">
    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</span>
    <span className={`text-slate-800 ${capitalize ? "capitalize" : ""}`}>{value}</span>
  </div>
);

/** Ficha técnica (datos duros de la propiedad). */
function TechnicalSheet({ property, spanFull }) {
  return (
    <div className={`bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-4 ${spanFull ? "md:col-span-2" : ""}`}>
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Ficha Técnica</h3>
      <div className={`grid gap-x-6 gap-y-4 text-sm font-semibold ${spanFull ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-2"}`}>
        {property.expenses?.amount > 0 && (
          <Field
            label="Expensas"
            value={`${property.expenses.currency === "USD" ? "USD" : "$"} ${Number(property.expenses.amount).toLocaleString()}`}
          />
        )}
        {property.parkingSpaces > 0 && <Field label="Cocheras" value={property.parkingSpaces} />}
        {property.constructionYear && <Field label="Año de construcción" value={property.constructionYear} />}
        {property.condition && <Field label="Estado" value={CONDITION_LABELS[property.condition] || property.condition} />}
        {property.disposition && (
          <Field label="Disposición" value={DISPOSITION_LABELS[property.disposition] || property.disposition} capitalize />
        )}
        {property.orientation && (
          <Field label="Orientación" value={ORIENTATION_LABELS[property.orientation] || property.orientation} capitalize />
        )}
        <Field label="Acepta Mascotas" value={property.petsAllowed ? "Sí" : "No"} />
        <Field label="Apto Profesional" value={property.professionalUse ? "Sí" : "No"} />
      </div>
    </div>
  );
}

/** Lista de servicios y amenities. */
function AmenitiesList({ features, spanFull }) {
  return (
    <div className={`bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-4 ${spanFull ? "md:col-span-2" : ""}`}>
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Servicios y Amenities</h3>
      <div className={`grid gap-4 ${spanFull ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-2"}`}>
        {features.map((feat, idx) => {
          const name = typeof feat === "string" ? feat : feat?.name || "";
          if (!name) return null;
          const label = name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          return (
            <div key={idx} className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Ficha técnica + servicios/amenities. Devuelve null si no hay nada que mostrar. */
export default function PropertyTechnicalDetails({ property }) {
  const hasTech = computeHasTech(property);
  const hasFeatures = !!(property.features && property.features.length > 0);

  if (!hasTech && !hasFeatures) return null;

  return (
    <div className="space-y-6 border-t border-slate-100 pt-10">
      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Detalles y Comodidades</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {hasTech && <TechnicalSheet property={property} spanFull={!hasFeatures} />}
        {hasFeatures && <AmenitiesList features={property.features} spanFull={!hasTech} />}
      </div>
    </div>
  );
}
