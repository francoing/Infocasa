import React from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Map, ExternalLink } from 'lucide-react';
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

export default function PropertyMap({ latitude, longitude, showExactAddress, title }) {
  if (!latitude || !longitude) return null;
  
  const position = [latitude, longitude];
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <a 
      href={googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block w-full h-full group overflow-hidden cursor-pointer"
      title="Abrir ubicación en Google Maps"
    >
      <MapContainer 
        center={position} 
        zoom={14} 
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        className="w-full h-full z-0 transition-transform duration-[750ms] group-hover:scale-105"
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
              color: '#2563eb', // blue-600
              fillColor: '#3b82f6', // blue-500
              fillOpacity: 0.2,
              weight: 2
            }}
          />
        )}
      </MapContainer>
      
      {/* Overlay premium */}
      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-300 z-10 flex items-center justify-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md text-slate-900 px-5 py-3 rounded-2xl shadow-xl font-bold flex items-center gap-2.5 border border-slate-200/50 transform translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-[350ms] ease-out">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Map className="w-4 h-4" />
          </div>
          <span className="text-xs uppercase tracking-wider font-black">Ver en Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </a>
  );
}

