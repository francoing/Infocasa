import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const DEFAULT_CENTER = [-34.6037, -58.3816]; // Buenos Aires

function LocationMarker({ position, onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    }
  });
  
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  );
}

export default function MapLocationSelector({ latitude, longitude, onChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const position = latitude && longitude ? [latitude, longitude] : null;
  const center = position || DEFAULT_CENTER;

  const handleMapClick = (latlng) => {
    onChange({
      latitude: Number(latlng.lat.toFixed(6)),
      longitude: Number(latlng.lng.toFixed(6))
    });
  };

  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const firstResult = data[0];
        const lat = parseFloat(firstResult.lat);
        const lon = parseFloat(firstResult.lon);
        onChange({
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lon.toFixed(6))
        });
      } else {
        setSearchError('No se encontró ninguna ubicación con ese nombre.');
      }
    } catch (error) {
      setSearchError('Error al conectar con el servicio de mapas.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* buscador premium */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Buscar dirección (ej: Av. Jujuy 3500, San Miguel de Tucumán)" 
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all outline-none font-semibold text-slate-700 placeholder-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e);
              }
            }}
          />
          <Search className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
        </div>
        <button 
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-70"
        >
          {searching ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : 'Buscar'}
        </button>
      </div>
      
      {searchError && (
        <p className="text-xs font-bold text-red-500 ml-1">{searchError}</p>
      )}

      <div className="w-full h-80 rounded-3xl overflow-hidden border border-slate-200 shadow-inner z-0 relative">
        <MapContainer 
          center={center} 
          zoom={14} 
          scrollWheelZoom={true} 
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onClick={handleMapClick} />
        </MapContainer>
      </div>
    </div>
  );
}
