import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Map, ExternalLink, Plus, Minus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Configuración de ícono personalizado para Leaflet
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function ZoomControls() {
  const map = useMap();

  return (
    <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-1.5">
      <button
        onClick={(e) => { e.stopPropagation(); map.zoomIn(); }}
        className="w-10 h-10 bg-white rounded-xl shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all active:scale-90"
        title="Acercar"
      >
        <Plus className="w-5 h-5" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); map.zoomOut(); }}
        className="w-10 h-10 bg-white rounded-xl shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all active:scale-90"
        title="Alejar"
      >
        <Minus className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function PropertyMap({ latitude, longitude, showExactAddress, title }) {
  if (!latitude || !longitude) return null;
  
  const position = [latitude, longitude];
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  const [hovering, setHovering] = useState(false);

  return (
    <div
      className="relative block w-full h-full overflow-hidden rounded-3xl"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <MapContainer
        center={position}
        zoom={14}
        scrollWheelZoom={true}
        dragging={true}
        zoomControl={false}
        doubleClickZoom={true}
        touchZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showExactAddress ? (
          <Marker position={position} icon={customIcon}>
            <Popup>
              <span className="font-bold text-slate-800">{title}</span>
            </Popup>
          </Marker>
        ) : (
          <Circle
            center={position}
            radius={500}
            pathOptions={{
              color: '#2563eb',
              fillColor: '#3b82f6',
              fillOpacity: 0.2,
              weight: 2
            }}
          />
        )}

        <ZoomControls />
      </MapContainer>

      {/* Google Maps link */}
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md text-slate-900 px-4 py-2.5 rounded-xl shadow-lg border border-slate-200/50 font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-white hover:shadow-xl transition-all ${
          hovering ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        <Map className="w-4 h-4 text-blue-600" />
        Google Maps
        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
      </a>
    </div>
  );
}

