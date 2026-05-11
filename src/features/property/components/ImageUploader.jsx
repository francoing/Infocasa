import React, { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

export default function ImageUploader({ images = [], onChange, maxImages = 10 }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const processFiles = async (files) => {
    setUploading(true);
    const newImages = [];

    for (const file of files) {
      if (images.length + newImages.length >= maxImages) break;
      if (!file.type.startsWith("image/")) continue;

      // Convertir a Base64 para persistencia en el mock (db.json)
      const base64 = await convertToBase64(file);
      newImages.push(base64);
    }

    onChange([...images, ...newImages]);
    setUploading(false);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
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

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img, index) => (
            <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
              <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
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
      )}
    </div>
  );
}
