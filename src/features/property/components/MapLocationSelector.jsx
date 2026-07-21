import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, Loader2, MapPin } from 'lucide-react';
import { useGeoapifyAutocomplete } from '../../../hooks/useGeoapifyPlaces';
import { geocodeStructured } from '../../../hooks/geocodeAddress';
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

export default function MapLocationSelector({ latitude, longitude, address = '', province = '', department = '', onChange }) {
  const [input, setInput] = useState(address);
  const [open, setOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const { suggestions, loading, error, setQuery, clearSuggestions } = useGeoapifyAutocomplete();

  // Al editar, la dirección guardada llega async: reflejarla en el buscador del mapa.
  useEffect(() => {
    if (address) setInput(address);
  }, [address]);

  const position = latitude && longitude ? [latitude, longitude] : null;
  const center = position || DEFAULT_CENTER;

  const handleMapClick = (latlng) => {
    onChange({
      latitude: Number(latlng.lat.toFixed(6)),
      longitude: Number(latlng.lng.toFixed(6))
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setOpen(true);
    // Sesga las sugerencias por provincia/departamento seleccionados.
    setQuery([value, department, province].filter(Boolean).join(', '));
  };

  const handleSelect = async (s) => {
    setInput(s.formatted);
    setOpen(false);
    clearSuggestions();
    // El autocomplete devuelve el punto del TRAMO de calle; para fijar la altura exacta
    // reconsultamos estructurado con la calle canónica + número. Si no hay dato, usamos su punto.
    let coords = { latitude: Number(s.lat.toFixed(6)), longitude: Number(s.lon.toFixed(6)) };
    if (s.housenumber && s.street) {
      setResolving(true);
      try {
        const precise = await geocodeStructured(s.housenumber, s.street, s.city || department, s.state || province);
        if (precise) coords = precise;
      } catch { /* usa el punto del tramo */ }
      finally { setResolving(false); }
    }
    onChange({ ...coords, address: s.formatted });
  };

  return (
    <div className="w-full space-y-3">
      {/* autocomplete de dirección */}
      <div className="relative">
        <input
          type="text"
          placeholder="Escribí la dirección (ej: Av. Aconquija 1200)"
          className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all outline-none font-semibold text-slate-700 placeholder-slate-400"
          value={input}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        <Search className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
        {(loading || resolving) && <Loader2 className="absolute right-4 top-4 w-4 h-4 text-blue-500 animate-spin" />}

        {open && suggestions.length > 0 && (
          <ul className="absolute z-[1000] mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li key={`${s.lat}-${s.lon}-${i}`}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(s)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-blue-50/60 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700 leading-snug">{s.formatted}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p className="text-xs font-bold text-red-500 ml-1">{error}</p>
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
