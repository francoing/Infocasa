import React, { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";

// Resuelve la URL de preview para los 3 tipos de item de la galería:
// File nuevo, objeto existente { id, url } o string suelto (compat).
const previewSrc = (img) => {
  if (img instanceof File) return URL.createObjectURL(img);
  if (typeof img === "string") return img;
  return img?.url || "";
};

export default function ImageUploader({ images = [], onChange, maxImages = 10 }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const processFiles = (files) => {
    const newImages = [];

    for (const file of files) {
      if (images.length + newImages.length >= maxImages) break;
      if (!file.type.startsWith("image/")) continue;

      newImages.push(file);
    }

    onChange([...images, ...newImages]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  // Reordenar por drag & drop dentro de la grilla de previews.
  // La 1ª posición es la portada (el backend marca is_cover a la primera).
  const handleTileDrop = (targetIndex) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const next = [...images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setDragIndex(null);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-10 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${isDragging ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-400 bg-slate-50'}`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />

        {uploading ? (
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        ) : (
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-4">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
        )}

        <p className="text-lg font-bold text-slate-900">
          {uploading ? 'Procesando imágenes...' : 'Arrastrá tus fotos aquí'}
        </p>
        <p className="text-slate-500 text-sm mt-1">O hacé clic para buscar en tu equipo</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">JPG, PNG hasta 5MB</p>
      </div>

      {/* Preview Grid — arrastrá para reordenar; la 1ª es la portada */}
      {images.length > 0 && (
        <>
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">
            Arrastrá para reordenar · la primera es la portada
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img, index) => (
              <div
                key={img instanceof File ? `file-${index}` : (img?.id ?? `url-${index}`)}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleTileDrop(index)}
                className={`relative group aspect-square rounded-2xl overflow-hidden border shadow-sm cursor-move transition-opacity ${dragIndex === index ? 'border-blue-500 opacity-50' : 'border-slate-100'}`}
              >
                <img src={previewSrc(img)} alt={`Preview ${index}`} className="w-full h-full object-cover pointer-events-none" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-blue-600 text-[8px] text-white font-black uppercase px-2 py-1 rounded-md tracking-tighter shadow-lg">
                    Principal
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
