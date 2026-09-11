import React, { useState, useEffect } from "react";
import { X, Download, Printer, Loader2 } from "lucide-react";
import QRCode from "qrcode";

// Genera la imagen del "Punto Infocasa" en alta resolución (2480 x 3508) con el QR
// de la propiedad embebido en la esquina inferior derecha. A nivel de módulo porque
// no depende del estado del componente (solo del id de la propiedad).
function buildPuntoInfocasaCanvas(propertyId) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const width = 2480;
    const height = 3508;
    canvas.width = width;
    canvas.height = height;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/img/punto-infocasa-base.jpg';

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);

      const qrSize = 450;
      const x = width - qrSize;
      const y = height - qrSize;
      const shortUrl = `${window.location.origin}/property/${propertyId}`;

      QRCode.toCanvas(
        document.createElement('canvas'),
        shortUrl,
        {
          width: qrSize,
          margin: 0,
          errorCorrectionLevel: 'L',
          color: { dark: '#000000', light: '#ffffff' },
        },
        (error, qrCanvas) => {
          if (error) {
            console.error('Error al generar QR:', error);
            reject(error);
            return;
          }
          ctx.drawImage(qrCanvas, x, y, qrSize, qrSize);
          resolve(canvas);
        }
      );
    };

    img.onerror = () => reject(new Error('No se pudo cargar la imagen base'));
  });
}

export default function QrModal({ property, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(true);

  // Generar la vista previa al abrir el modal
  useEffect(() => {
    const generatePreview = async () => {
      try {
        setIsGeneratingPreview(true);
        const canvas = await buildPuntoInfocasaCanvas(property.id);
        setPreviewImage(canvas.toDataURL('image/jpeg', 0.95));
      } catch (error) {
        console.error('Error al generar vista previa:', error);
      } finally {
        setIsGeneratingPreview(false);
      }
    };
    
    generatePreview();
  }, [property.id]);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const canvas = await buildPuntoInfocasaCanvas(property.id);
      
      const link = document.createElement('a');
      link.download = `punto-infocasa-${property.id}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } catch (error) {
      console.error('Error al descargar:', error);
      alert('Hubo un error al generar la imagen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = async () => {
  try {
    setIsLoading(true);
    const canvas = await generateHighResImage();
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    
    // Crear un iframe oculto para la impresión
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Punto Infocasa</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: white;
            }
            img {
              max-width: 100%;
              max-height: 100vh;
              object-fit: contain;
            }
            @media print {
              body { margin: 0; padding: 0; }
              img { 
                max-width: 100%; 
                max-height: 100vh; 
                object-fit: contain;
              }
            }
          </style>
        </head>
        <body>
          <img src="${imageDataUrl}" alt="Punto Infocasa" />
        </body>
      </html>
    `);
    iframeDoc.close();
    
    // Esperar a que la imagen se cargue
    const img = iframeDoc.querySelector('img');
    if (img) {
      img.onload = () => {
        // Imprimir después de que la imagen se cargue
        setTimeout(() => {
          iframe.contentWindow.print();
          // Remover el iframe después de imprimir
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, 500);
      };
      img.onerror = () => {
        document.body.removeChild(iframe);
        alert('Error al cargar la imagen para imprimir.');
      };
    } else {
      document.body.removeChild(iframe);
      alert('Error al preparar la impresión.');
    }
  } catch (error) {
    console.error('Error al imprimir:', error);
    alert('Hubo un error al imprimir.');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h3 className="text-xl font-black text-slate-900">Punto Infocasa</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Contenido - Vista previa de la imagen final */}
        <div className="p-4 flex flex-col items-center">
          <div className="relative w-full max-w-md">
            {isGeneratingPreview ? (
              <div className="w-full aspect-[2480/3508] bg-slate-100 rounded-lg flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              </div>
            ) : previewImage ? (
              <img
                src={previewImage}
                alt="Punto Infocasa"
                className="w-full h-auto rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-full aspect-[2480/3508] bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                Error al generar la vista previa
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-4 mt-6 w-full max-w-md">
            <button
              onClick={handleDownload}
              disabled={isLoading || isGeneratingPreview}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Descargar JPG
            </button>
            <button
              onClick={handlePrint}
              disabled={isLoading || isGeneratingPreview}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}