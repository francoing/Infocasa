import React from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
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
  
  return (
    <MapContainer 
      center={position} 
      zoom={14} 
      scrollWheelZoom={false} 
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
            color: '#2563eb', // blue-600
            fillColor: '#3b82f6', // blue-500
            fillOpacity: 0.2,
            weight: 2
          }}
        />
      )}
    </MapContainer>
  );
}
