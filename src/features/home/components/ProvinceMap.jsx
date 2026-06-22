import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import ProvinceBoundaries from "./ProvinceBoundaries";

/* ---------- Íconos personalizados ---------- */

const defaultIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = new L.DivIcon({
  className: "",
  html: `<div style="
    width: 32px; height: 32px;
    background: #2563eb;
    border: 4px solid white;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(37,99,235,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  "><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
});

/* ---------- Auto Fit Bounds ---------- */

function FitBounds({ cities }) {
  const map = useMap();

  useEffect(() => {
    if (!cities || cities.length === 0) return;
    const bounds = L.latLngBounds(
      cities.map((c) => [c.lat, c.lng])
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
  }, [cities, map]);

  return null;
}

/* ---------- ProvinceMap ---------- */

export default function ProvinceMap({ cities, selectedCity, onCityClick }) {
  // Centro por defecto (Tucumán + Santiago del Estero)
  const defaultCenter = [-27.3, -64.8];

  if (!cities || cities.length === 0) return null;

  return (
    <div className="relative w-full h-[350px] md:h-[420px] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
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

        <FitBounds cities={cities} />
        <ProvinceBoundaries />

        {cities.map((city) => {
          const isSelected = selectedCity === city.name;
          return (
            <Marker
              key={city.name || city.id}
              position={[city.lat, city.lng]}
              icon={isSelected ? selectedIcon : defaultIcon}
            >
              <Popup>
                <div className="text-center min-w-[120px]">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <strong className="text-sm text-slate-900">{city.name}</strong>
                  </div>
                  {city.province && (
                    <p className="text-[11px] text-slate-500">{city.province}</p>
                  )}
                  {city.description && (
                    <p className="text-[10px] text-blue-600 font-semibold mt-1">{city.description}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => onCityClick(city.name)}
                    className="mt-2 w-full text-[11px] font-bold text-white bg-blue-600 rounded-lg py-1.5 hover:bg-blue-700 transition-colors"
                  >
                    Ver propiedades
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
