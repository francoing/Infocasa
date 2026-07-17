import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";          // extiende L con markerClusterGroup
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { MapPin, Bed, Bath, Maximize } from "lucide-react";
import ProvinceBoundaries from "./ProvinceBoundaries";

/* ================================================================
   ÍCONO ROJO PERSONALIZADO — reemplaza el pin default de Leaflet
   ================================================================ */

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

const markerIcon = createRedIcon(32);

/* ================================================================
   CLUSTER — estilos para los grupos de marcadores
   ================================================================ */

const clusterIcon = L.divIcon({
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

/* ================================================================
   COMPONENTE DE CLUSTERING — wrapper para MarkerClusterGroup
   ================================================================ */

function MarkerCluster({ markers }) {
  const map = useMap();
  const clusterRef = useRef(null);
  const [ready, setReady] = useState(false);

  // Inicializar el cluster group una sola vez
  useEffect(() => {
    if (!map || clusterRef.current) return;

    const mcg = L.markerClusterGroup({
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        const el = clusterIcon.options.html.replace(
          "</div>",
          `${count > 99 ? "99+" : count}</div>`
        );
        return L.divIcon({
          className: "",
          html: el,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });
      },
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 14,
    });

    clusterRef.current = mcg;
    map.addLayer(mcg);
    setReady(true);

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
        clusterRef.current = null;
      }
    };
  }, [map]);

  // Actualizar markers cuando cambien (y el cluster ya esté listo)
  useEffect(() => {
    if (!ready || !clusterRef.current) return;

    const mcg = clusterRef.current;
    mcg.clearLayers();

    const leafletMarkers = markers
      .filter((m) => m.position)
      .map((m) => {
        const lMarker = L.marker(m.position, { icon: markerIcon });
        if (m.popup) {
          lMarker.bindPopup(m.popup, {
            className: "custom-popup",
            closeButton: false,
            maxWidth: 240,
            minWidth: 200,
          });
        }
        return lMarker;
      });

    if (leafletMarkers.length > 0) {
      mcg.addLayers(leafletMarkers);
    }
  }, [markers, ready]);

  return null;
}

/* ================================================================
   AUTO FIT BOUNDS
   ================================================================ */

function FitBounds({ items }) {
  const map = useMap();

  useEffect(() => {
    if (!items || items.length === 0) return;
    const bounds = L.latLngBounds(items.map((item) => [item.lat, item.lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  }, [items, map]);

  return null;
}

/* ================================================================
   FORMATOS
   ================================================================ */

const formatPrice = (price, currency) => {
  const symbol = currency === "USD" ? "U$D" : "$";
  return `${symbol} ${Number(price).toLocaleString("es-AR")}`;
};

/* ================================================================
   PROVINCE MAP
   ================================================================ */

export default function ProvinceMap({ properties, onPropertyClick }) {
  const defaultCenter = [-27.3, -64.8];

  // Handler global para el onclick del popup (Leaflet no admite React events en HTML string).
  // Va al tope: nunca después de un return condicional (rules-of-hooks).
  useEffect(() => {
    window.__mapPropertyClick = onPropertyClick;
    return () => { delete window.__mapPropertyClick; };
  }, [onPropertyClick]);

  if (!properties || properties.length === 0) return null;

  const markers = properties.filter(
    (p) => p.latitude != null && p.longitude != null
  );

  if (markers.length === 0) return null;

  // Preparar markers para el cluster
  const clusterMarkers = markers.map((property) => {
    const thumb = property.images?.[0]?.url || property.imageUrl || null;

    const popupHtml = /*html*/`
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
          <button type="button" onclick="window.__mapPropertyClick && window.__mapPropertyClick(${property.id})" class="custom-popup-btn">
            Ver detalle
          </button>
        </div>
      </div>
    `;

    return {
      position: [property.latitude, property.longitude],
      popup: popupHtml,
    };
  });

  return (
    <div className="relative w-full h-[350px] md:h-[420px] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      {/* Estilos inline para popup y cluster — scoped a este mapa */}
      <style>{`
        /* Popup container */
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
        .custom-popup .leaflet-popup-tip {
          box-shadow: none !important;
        }
        .custom-popup-inner {
          display: flex;
          flex-direction: column;
        }
        .custom-popup-img {
          width: 100%;
          height: 110px;
          overflow: hidden;
        }
        .custom-popup-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .custom-popup-body {
          padding: 12px;
        }
        .custom-popup-title {
          font-size: 12px;
          font-weight: 900;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          line-height: 1.3;
          margin: 0 0 4px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .custom-popup-price {
          font-size: 14px;
          font-weight: 900;
          color: #ff0019;
          margin: 0 0 8px 0;
        }
        .custom-popup-details {
          display: flex;
          gap: 10px;
          font-size: 10px;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .custom-popup-details span {
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .custom-popup-location {
          font-size: 10px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 3px;
          margin-bottom: 8px;
        }
        .custom-popup-btn {
          display: block;
          width: 100%;
          padding: 6px 0;
          background: #ff0019;
          color: white;
          font-size: 11px;
          font-weight: 700;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .custom-popup-btn:hover {
          background: #cc0014;
        }
        /* Clusters */
        .marker-cluster-small,
        .marker-cluster-medium,
        .marker-cluster-large {
          background: transparent !important;
        }
        .marker-cluster-small div,
        .marker-cluster-medium div,
        .marker-cluster-large div {
          background: transparent !important;
        }
      `}</style>

      <MapContainer
        center={defaultCenter}
        zoom={8}
        scrollWheelZoom={true}
        dragging={true}
        zoomControl={false}
        doubleClickZoom={true}
        touchZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <FitBounds items={markers.map((p) => ({ lat: p.latitude, lng: p.longitude }))} />
        <ProvinceBoundaries />
        <MarkerCluster markers={clusterMarkers} />
      </MapContainer>
    </div>
  );
}
