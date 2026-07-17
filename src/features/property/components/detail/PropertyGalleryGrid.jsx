import React from "react";
import { Image as ImageIcon, TrendingDown } from "lucide-react";

/** Grilla de portada (hasta 5 imágenes) + badge de rebaja. Abre el lightbox al hacer clic. */
export default function PropertyGalleryGrid({ images, hasPriceDrop, onOpen }) {
  const tiles = [1, 2, 3, 4]; // secundarias (la principal va aparte)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 h-[30rem] md:h-[35rem] rounded-[2.5rem] overflow-hidden shadow-md relative group">
      <div className="md:col-span-2 md:row-span-2 relative overflow-hidden h-full">
        <img
          src={images[0]}
          alt="Portada"
          className="w-full h-full object-cover hover:scale-105 transition-all duration-700 cursor-pointer"
          onClick={() => onOpen(0)}
        />
        {hasPriceDrop && (
          <div className="absolute top-6 left-6 bg-green-500 text-white font-black px-4 py-2 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-green-500/20">
            <TrendingDown className="w-4 h-4" /> Precio Reducido
          </div>
        )}
      </div>

      {tiles.map((i) => (
        <div key={i} className="hidden md:block relative overflow-hidden h-full">
          <img
            src={images[i] || images[0]}
            alt={`Vista ${i}`}
            className="w-full h-full object-cover hover:scale-105 transition-all duration-700 cursor-pointer"
            onClick={() => onOpen(i % images.length)}
          />
        </div>
      ))}

      <button
        onClick={() => onOpen(0)}
        className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md text-slate-900 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-white shadow-lg flex items-center gap-2 transition-all active:scale-95 border border-slate-200/50"
      >
        <ImageIcon className="w-4 h-4 text-slate-700" /> Ver {images.length} fotos
      </button>
    </div>
  );
}
