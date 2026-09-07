import React from 'react';
import icono from '../../assets/img/Icono.png';

/**
 * Preload oficial de Infocasa: isotipo de marca con latido (`animate-heartbeat`).
 * Es la ÚNICA fuente de verdad para los estados de carga de página/sección — no usar
 * spinners genéricos (`Loader2`) para preloads de contenido.
 *
 * - Full-screen (default): pantalla de carga completa (rutas protegidas, carga de página).
 * - `inline`: para cargar una sección dentro de un layout existente. Usar `className`
 *   para fijar el alto/estilo del contenedor (ej: "py-20", "h-[420px] bg-slate-50 …").
 *
 * Los spinners chicos dentro de botones o inputs (submit, autocomplete) NO son preloads
 * y siguen usando `Loader2`.
 */
const Loader = ({ inline = false, className = '', label = 'Cargando...' }) => {
  const sizeClass = inline ? 'w-16 h-16' : 'w-20 h-20';
  const icon = (
    <img
      src={icono}
      alt={label}
      className={`${sizeClass} object-contain animate-heartbeat`}
    />
  );

  if (inline) {
    return <div className={`flex items-center justify-center ${className}`}>{icon}</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">{icon}</div>
  );
};

export default Loader;
