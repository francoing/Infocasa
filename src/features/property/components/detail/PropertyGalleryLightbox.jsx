import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

/** Lightbox fullscreen de la galería. El padre lo envuelve en <AnimatePresence> según showGallery. */
export default function PropertyGalleryLightbox({ images, activeImage, setActiveImage, onClose }) {
  const prev = () => setActiveImage((activeImage - 1 + images.length) % images.length);
  const next = () => setActiveImage((activeImage + 1) % images.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-6"
    >
      <div className="flex justify-between items-center text-white">
        <span className="text-sm font-bold uppercase tracking-wider">{activeImage + 1} / {images.length}</span>
        <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="relative flex items-center justify-center flex-1 max-w-5xl mx-auto w-full group">
        <button
          onClick={prev}
          aria-label="Imagen anterior"
          className="absolute left-2 sm:left-4 p-3 sm:p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <motion.img
          key={activeImage}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          src={images[activeImage]}
          alt="Property View"
          className="max-h-[70vh] max-w-full object-contain rounded-3xl"
        />

        <button
          onClick={next}
          aria-label="Imagen siguiente"
          className="absolute right-2 sm:right-4 p-3 sm:p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="flex justify-center gap-2 overflow-x-auto py-4">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setActiveImage(index)}
            className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === index ? "border-blue-500 scale-105" : "border-transparent opacity-50 hover:opacity-100"}`}
          >
            <img src={img} className="w-full h-full object-cover" alt="Thumbnail" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
