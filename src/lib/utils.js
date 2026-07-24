import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Máscara de CUIT argentino para visualización: `XX-XXXXXXXX-X` (cap 11 dígitos).
 * Recibe cualquier string; devuelve solo el formato. En estado/BD se guardan solo
 * los dígitos (sin guiones) — usar `value.replace(/\D/g, "")` al enviar.
 */
export function formatCuit(value) {
  const d = String(value ?? "").replace(/\D/g, "").slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 10) return `${d.slice(0, 2)}-${d.slice(2)}`
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`
}
