import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";          // extiende L con markerClusterGroup
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import ProvinceBoundaries from "./ProvinceBoundaries";
import { markerIcon, approxIcon, clusterIcon, buildPopupHtml, POPUP_STYLES } from "./provinceMap.helpers";

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

// Encuadre del mapa: si viene `focus` (zona buscada en el autocomplete del home) hace
// zoom a su bbox/centro; si no, ajusta a todos los markers. El focus tiene prioridad
// para que el mapa quede en la búsqueda y no en todo el país.
function MapView({ items, focus }) {
  const map = useMap();

  useEffect(() => {
    if (focus && Array.isArray(focus.bbox) && focus.bbox.length === 4) {
      const [minLon, minLat, maxLon, maxLat] = focus.bbox;
      map.fitBounds([[minLat, minLon], [maxLat, maxLon]], { padding: [40, 40], maxZoom: 14 });
    } else if (focus && focus.lat != null && focus.lng != null) {
      map.setView([focus.lat, focus.lng], 13);
    } else if (items && items.length > 0) {
      map.fitBounds(L.latLngBounds(items.map((i) => [i.lat, i.lng])), { padding: [50, 50], maxZoom: 12 });
    }
  }, [items, focus, map]);

  return null;
}

// Ubicaciones aproximadas: se dibujan como ÁREA (círculo ámbar) con un pin en el centro,
// fuera del cluster (el cluster es solo para direcciones exactas). Cada una abre el mismo popup.
function ApproxAreas({ areas }) {
  const map = useMap();
  const groupRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!map || groupRef.current) return;
    const group = L.featureGroup();
    groupRef.current = group;
    map.addLayer(group);
    setReady(true);
    return () => {
      if (groupRef.current) {
        map.removeLayer(groupRef.current);
        groupRef.current = null;
      }
    };
  }, [map]);

  useEffect(() => {
    if (!ready || !groupRef.current) return;
    const group = groupRef.current;
    group.clearLayers();

    const popupOpts = { className: "custom-popup", closeButton: false, maxWidth: 240, minWidth: 200 };
    areas
      .filter((a) => a.position)
      .forEach((a) => {
        const circle = L.circle(a.position, {
          radius: 700, color: "#f59e0b", weight: 2, fillColor: "#f59e0b", fillOpacity: 0.12,
        });
        const marker = L.marker(a.position, { icon: approxIcon });
        if (a.popup) {
          circle.bindPopup(a.popup, popupOpts);
          marker.bindPopup(a.popup, popupOpts);
        }
        group.addLayer(circle);
        group.addLayer(marker);
      });
  }, [areas, ready]);

  return null;
}

// Province map
export default function ProvinceMap({ properties, focus = null, onPropertyClick }) {
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

  // Direcciones EXACTAS → pin clusterizado. Ubicaciones APROXIMADAS (coordinates.exact
  // === false) → área (círculo) fuera del cluster. Ver /properties/map + buildMapMarker.
  const toMarker = (property) => ({
    position: [property.latitude, property.longitude],
    popup: buildPopupHtml(property, property.coordinatesExact !== false),
  });
  const exactMarkers = markers.filter((p) => p.coordinatesExact !== false).map(toMarker);
  const approxAreas = markers.filter((p) => p.coordinatesExact === false).map(toMarker);

  return (
    <div className="relative w-full h-[350px] md:h-[420px] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <style>{POPUP_STYLES}</style>

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

        <MapView items={markers.map((p) => ({ lat: p.latitude, lng: p.longitude }))} focus={focus} />
        <ProvinceBoundaries />
        <MarkerCluster markers={exactMarkers} />
        <ApproxAreas areas={approxAreas} />
      </MapContainer>
    </div>
  );
}
