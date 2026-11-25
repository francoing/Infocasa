import React from "react";
import { cn } from "@/lib/utils";

/** Primitivos de formulario de la Guía (mismo estilo que el resto del panel). */

export const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600";

function Field({ label, error, hint, children, className, required }) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && !error && <span className="text-xs text-slate-400">{hint}</span>}
      {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}

export function TextInput({ label, error, hint, required, className, ...props }) {
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className}>
      <input {...props} className={cn(inputClass, error && "border-red-400")} />
    </Field>
  );
}

export function TextArea({ label, error, hint, required, className, rows = 4, ...props }) {
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className}>
      <textarea rows={rows} {...props} className={cn(inputClass, "resize-y", error && "border-red-400")} />
    </Field>
  );
}

export function Select({ label, error, required, className, options = [], placeholder, ...props }) {
  return (
    <Field label={label} error={error} required={required} className={className}>
      <select {...props} className={cn(inputClass, error && "border-red-400")}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Checkbox({ label, checked, onChange, className }) {
  return (
    <label className={cn("inline-flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer", className)}>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
      />
      {label}
    </label>
  );
}

/** Provincias donde opera el portal (mismas del buscador de propiedades). */
export const GUIDE_PROVINCES = [
  { value: "Tucumán", label: "Tucumán" },
  { value: "Santiago del Estero", label: "Santiago del Estero" },
];
