import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Maximize, Heart, Calendar, Car, Crown, Star, Coins, Video } from "lucide-react";
import { setPropertyFavorite } from "../../hooks/useFavorites";
import PropertyMediaModal, { readyVideos } from "./PropertyMediaModal";
import { useToast } from "../../hooks/useToast";

// --- Helpers puros ---
const CONDITION_LABELS = { new: 'A Estrenar', under_construction: 'En Pozo', to_refurbish: 'A Refaccionar' };
const conditionBadge = (condition) =>
  condition && condition !== 'good' ? CONDITION_LABELS[condition] || null : null;

const symbol = (currency) => (currency === 'USD' ? 'USD' : '$');

const locationText = (property) => {
  if (property.address) return property.address;
  if (typeof property.location === 'string') return property.location;
  return [property.location?.neighborhood, property.location?.city].filter(Boolean).join(', ');
};

// Misma regla que la ficha pública (PropertyVideos): solo cuentan los videos ya comprimidos.
const hasVideo = (property) => readyVideos(property).length > 0;

const hasFloorPlan = (property) => Boolean(property.floorPlanUrl);

// Foto de perfil de quien publica (dueño directo o inmobiliaria). null si no tiene.
// `avatar_url` es la URL completa; `avatar` es solo la ruta relativa en storage y no sirve como src.
const sellerAvatar = (property) => property.owner?.avatar_url || null;

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' });
}

// --- Sub-componentes ---

// Ícono de plano (planta con paredes), al estilo de los portales de referencia.
function FloorPlanIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 3h18v18H3z" />
      <path d="M3 12h7v5" />
      <path d="M14 3v6h7" />
      <path d="M14 21v-6" />
    </svg>
  );
}

// Botón de medio de la tarjeta: abre el pop-up sin navegar a la ficha (la tarjeta es un <Link>).
function MediaButton({ label, onClick, children }) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={handleClick}
      className="pointer-events-auto w-9 h-9 rounded-lg bg-white/95 text-slate-700 flex items-center justify-center shadow-md hover:bg-white hover:text-blue-600 transition-colors"
    >
      {children}
    </button>
  );
}

// Franja inferior de la foto: botones de plano y video + condición a la izquierda, avatar de quien publica a la derecha.
// Cada botón aparece solo si la propiedad tiene ese medio.
function MediaBottomBar({ property, onOpenMedia }) {
  const condLabel = conditionBadge(property.condition);
  const avatar = sellerAvatar(property);
  const video = hasVideo(property);
  const floorPlan = hasFloorPlan(property);

  if (!condLabel && !avatar && !video && !floorPlan) return null;

  return (
    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 pointer-events-none">
      <div className="flex items-center gap-2">
        {floorPlan && (
          <MediaButton label="Ver plano" onClick={() => onOpenMedia('floorPlan')}>
            <FloorPlanIcon className="w-4 h-4" />
          </MediaButton>
        )}
        {video && (
          <MediaButton label="Ver video" onClick={() => onOpenMedia('video')}>
            <Video className="w-4 h-4" />
          </MediaButton>
        )}
        {condLabel && (
          <div className="bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
            {condLabel}
          </div>
        )}
      </div>
      {avatar && (
        <img
          src={avatar}
          alt={`Foto de ${property.owner?.name || 'quien publica'}`}
          className="w-10 h-10 rounded-full border-2 border-white bg-white object-cover shadow-md"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      )}
    </div>
  );
}

function CardMedia({ property, isFavorited, loading, onFavorite, onOpenMedia }) {
  const isPremium = property.publicationType === 'premium';
  const isFeatured = property.publicationType === 'featured';

  return (
    <div className="aspect-video relative overflow-hidden flex-shrink-0">
      <img
        src={property.imageUrl}
        alt={property.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      
      {/* Etiqueta de Publicación Súper Destacada */}
      {isPremium && (
        <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg shadow-red-600/40 flex items-center gap-1.5 border border-red-500">
          <Crown className="w-4 h-4 text-yellow-300" /> Súper Destacada
        </div>
      )}
      {isFeatured && !isPremium && (
        <div className="absolute top-4 left-4 bg-amber-400 text-white px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5" /> Destacada
        </div>
      )}
      
      <MediaBottomBar property={property} onOpenMedia={onOpenMedia} />

      <button
        onClick={onFavorite}
        disabled={loading}
        className={`absolute top-4 right-4 p-2 rounded-full transition-colors z-20 backdrop-blur-sm bg-white/90 ${
          isFavorited ? "text-rose-500 hover:bg-rose-100" : "text-blue-600 hover:bg-white"
        }`}
      >
        <Heart className={`w-4 h-4 ${isFavorited ? "fill-rose-500" : ""}`} />
      </button>
    </div>
  );
}

function CardPrice({ property }) {
  const hasExpenses = property.expenses?.amount && Number(property.expenses.amount) > 0;
  return (
    <div className="flex justify-between items-baseline mb-2">
      <div className="text-blue-600 font-extrabold text-2xl tracking-tight">
        {symbol(property.priceCurrency)} {property.price.toLocaleString()}
        {property.operationRaw === 'rent' && <span className="text-xs font-bold text-slate-500">/mes</span>}
      </div>
      {hasExpenses && (
        <span className="text-[10px] font-black text-slate-500 bg-slate-100 border border-slate-200/50 px-2 py-1 rounded-lg">
          + {symbol(property.expenses.currency)}{Number(property.expenses.amount).toLocaleString()} exp
        </span>
      )}
    </div>
  );
}

function CardTags({ property }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-4">
      {property.owner && (
        <div className="text-[9px] font-black text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
          <span className="uppercase tracking-wider">Inmob: {property.owner.name}</span>
        </div>
      )}
      {property.petsAllowed && (
        <span className="text-[9px] font-black uppercase tracking-wider text-green-700 bg-green-50 border border-green-100 px-2 py-1 rounded-lg">
          Mascotas OK
        </span>
      )}
      {property.professionalUse && (
        <span className="text-[9px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-100 px-2 py-1 rounded-lg">
          Apto Prof.
        </span>
      )}
    </div>
  );
}

function Feature({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
      <Icon className="w-3.5 h-3.5 text-slate-400" /> <span>{children}</span>
    </div>
  );
}

function CardFeatures({ property }) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100 text-slate-600 text-xs font-black">
      {property.bedrooms > 0 && <Feature icon={Bed}>{property.bedrooms} Dorm.</Feature>}
      {property.bathrooms > 0 && <Feature icon={Bath}>{property.bathrooms} Baño{property.bathrooms > 1 && 's'}</Feature>}
      {property.parkingSpaces > 0 && <Feature icon={Car}>{property.parkingSpaces} Coch.</Feature>}
      {property.area > 0 && <Feature icon={Maximize}>{property.area.toLocaleString()} m²</Feature>}
    </div>
  );
}

// 👇 NUEVO COMPONENTE: Operación y Contador de Monedas
function CardFooter({ property }) {
  const isPremium = property.publicationType === 'premium';
  
  return (
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
      <div className="flex items-center gap-2">
        {/* Etiqueta de Operación (Venta, Alquiler, etc.) */}
        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg">
          {property.operation}
        </span>
      </div>
      
      {/* Contador de InfoMonedas (Solo si es Súper Destacada y tiene monedas) */}
      {isPremium && property.infocoinsCount > 0 && (
        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 text-amber-600 px-3 py-1.5 rounded-lg shadow-sm">
          <Coins className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span className="text-[11px] font-black">{property.infocoinsCount} InfoMonedas</span>
        </div>
      )}
    </div>
  );
}

export default function PropertyCard({ property }) {
  const toast = useToast();
  const [isFavorited, setIsFavorited] = useState(property?.isFavorited || false);
  const [loading, setLoading] = useState(false);
  const [openMedia, setOpenMedia] = useState(null); // 'video' | 'floorPlan' | null

  if (!property) return null;

  const isPremium = property.publicationType === 'premium';
  const isFeatured = property.publicationType === 'featured';

  const borderClass = isPremium
    ? "border-2 border-red-500 shadow-[0_0_25px_rgba(255,0,25,0.25)] transform hover:-translate-y-2 hover:shadow-[0_0_35px_rgba(255,0,25,0.4)] z-10 bg-white"
    : isFeatured
      ? "border-2 border-amber-400 shadow-md shadow-amber-400/20 transform hover:-translate-y-1 bg-white"
      : "border border-slate-200 transform hover:-translate-y-1 bg-white";

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    try {
      setLoading(true);
      const next = !isFavorited;
      await setPropertyFavorite(property.id, next);
      setIsFavorited(next);
      toast[next ? "success" : "info"](next ? "Agregado a favoritos" : "Eliminado de favoritos");
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("Debes iniciar sesión para guardar favoritos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Link
      to={`/property/${property.id}`}
      className={`rounded-xl overflow-hidden transition-all duration-300 group flex flex-col h-full ${borderClass}`}
    >
      <CardMedia
        property={property}
        isFavorited={isFavorited}
        loading={loading}
        onFavorite={handleFavoriteClick}
        onOpenMedia={setOpenMedia}
      />
      <div className="p-6 flex flex-col justify-between flex-1 relative overflow-hidden">
        
        {/* Un toque de luz roja muy sutil en la esquina */}
        {isPremium && (
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/5 blur-2xl rounded-full pointer-events-none"></div>
        )}

        <div className="relative z-10">
          <CardPrice property={property} />
          <h3 className="font-bold text-slate-900 text-lg mb-1.5 truncate group-hover:text-red-600 transition-colors">
            {property.title}
          </h3>
          <p className="text-slate-500 text-sm flex items-center gap-1 mb-2">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="truncate">{locationText(property)}</span>
          </p>
          <CardTags property={property} />
        </div>
        
        <div className="relative z-10 mt-auto">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Publicado {formatDate(property.publishedAt || property.createdAt)}</span>
          </div>
          <CardFeatures property={property} />
          
          {/* 👇 NUEVO: El footer con la operación y las InfoMonedas */}
          <CardFooter property={property} />
        </div>
      </div>
    </Link>
    {/* Fuera del <Link>: los clics dentro del pop-up no navegan a la ficha. */}
    {openMedia && <PropertyMediaModal type={openMedia} property={property} onClose={() => setOpenMedia(null)} />}
    </>
  );
}
