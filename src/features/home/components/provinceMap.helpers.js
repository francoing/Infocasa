import L from "leaflet";

// Helpers puros del mapa (ProvinceMap): íconos, popup y estilos. Separados para mantener
// ProvinceMap.jsx bajo el límite de líneas y aislar el HTML/CSS del comportamiento.

/* Ícono rojo personalizado — reemplaza el pin default de Leaflet (direcciones exactas). */
const createRedIcon = (size = 32) =>
  new L.DivIcon({
    className: "",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: #ff0019;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(255,0,25,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s;
    "><svg xmlns="http://www.w3.org/2000/svg" width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 8)],
  });

export const markerIcon = createRedIcon(32);

// Ícono para ubicaciones APROXIMADAS (coordinates.exact === false): pin ámbar semi-
// transparente, para distinguirlo del rojo de las direcciones exactas.
export const approxIcon = createRedIcon(28);
approxIcon.options.html = approxIcon.options.html
  .replace(/#ff0019/g, "#f59e0b")
  .replace("rgba(255,0,25,0.4)", "rgba(245,158,11,0.4)");

/* Ícono base del cluster (el conteo se inyecta en iconCreateFunction). */
export const clusterIcon = L.divIcon({
  className: "",
  html: `<div style="
    width: 44px; height: 44px;
    background: #ff0019;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 12px rgba(255,0,25,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    font: 700 13px/1 'Plus Jakarta Sans', sans-serif;
    color: white;
  "></div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

const formatPrice = (price, currency) => {
  const symbol = currency === "USD" ? "U$D" : "$";
  return `${symbol} ${Number(price).toLocaleString("es-AR")}`;
};

// Popup de una propiedad. `exact === false` agrega el aviso de ubicación aproximada
// (es la zona/barrio, no la dirección exacta).
export const buildPopupHtml = (property, exact) => {
  const thumb = property.images?.[0]?.url || property.imageUrl || null;
  const approxNote = exact
    ? ""
    : `<div class="custom-popup-approx"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> Ubicación aproximada (zona)</div>`;
  return /*html*/`
    <div class="custom-popup-inner">
      ${thumb ? `<div class="custom-popup-img"><img src="${thumb}" alt="${property.title}" /></div>` : ""}
      <div class="custom-popup-body">
        <p class="custom-popup-title">${property.title || ""}</p>
        <p class="custom-popup-price">${formatPrice(property.price, property.priceCurrency)}</p>
        <div class="custom-popup-details">
          ${property.bedrooms > 0 ? `<span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"/><path d="M21 7V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3"/><path d="M7 7V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v3"/></svg> ${property.bedrooms}</span>` : ""}
          ${property.bathrooms > 0 ? `<span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"/><path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"/><path d="M4 21l1-1.5"/><path d="M20 21l-1-1.5"/></svg> ${property.bathrooms}</span>` : ""}
          ${property.areaTotal > 0 ? `<span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg> ${property.areaTotal}m²</span>` : ""}
        </div>
        <div class="custom-popup-location">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          ${property.locationDetails?.city || ""}${property.locationDetails?.province ? `, ${property.locationDetails.province}` : ""}
        </div>
        ${approxNote}
        <button type="button" onclick="window.__mapPropertyClick && window.__mapPropertyClick(${property.id})" class="custom-popup-btn">
          Ver detalle
        </button>
      </div>
    </div>
  `;
};

// Estilos del popup y clusters — scoped por las clases custom-popup* / marker-cluster*.
export const POPUP_STYLES = `
  .custom-popup .leaflet-popup-content-wrapper {
    border-radius: 16px !important;
    padding: 0 !important;
    overflow: hidden !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.12) !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }
  .custom-popup .leaflet-popup-content {
    margin: 0 !important;
    padding: 0 !important;
    min-width: 200px;
    max-width: 240px;
  }
  .custom-popup .leaflet-popup-tip { box-shadow: none !important; }
  .custom-popup-inner { display: flex; flex-direction: column; }
  .custom-popup-img { width: 100%; height: 110px; overflow: hidden; }
  .custom-popup-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .custom-popup-body { padding: 12px; }
  .custom-popup-title {
    font-size: 12px; font-weight: 900; color: #0f172a; text-transform: uppercase;
    letter-spacing: -0.02em; line-height: 1.3; margin: 0 0 4px 0;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .custom-popup-price { font-size: 14px; font-weight: 900; color: #ff0019; margin: 0 0 8px 0; }
  .custom-popup-details {
    display: flex; gap: 10px; font-size: 10px; color: #64748b; font-weight: 600; margin-bottom: 4px;
  }
  .custom-popup-details span { display: flex; align-items: center; gap: 3px; }
  .custom-popup-location {
    font-size: 10px; color: #94a3b8; display: flex; align-items: center; gap: 3px; margin-bottom: 8px;
  }
  .custom-popup-btn {
    display: block; width: 100%; padding: 6px 0; background: #ff0019; color: white;
    font-size: 11px; font-weight: 700; border: none; border-radius: 8px; cursor: pointer; transition: background 0.15s;
  }
  .custom-popup-btn:hover { background: #cc0014; }
  .custom-popup-approx {
    display: flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700;
    color: #b45309; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px;
    padding: 4px 6px; margin-bottom: 8px;
  }
  .marker-cluster-small, .marker-cluster-medium, .marker-cluster-large { background: transparent !important; }
  .marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div { background: transparent !important; }
`;
