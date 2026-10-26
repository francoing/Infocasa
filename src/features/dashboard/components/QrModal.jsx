import React, { useState, useEffect } from "react";
import { X, Download, Printer, Loader2, BarChart3, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useQrStats } from "../../../hooks/useQrStats";
import { buildPuntoInfocasaCanvas } from "./qr.helpers";

export default function QrModal({ property, onClose }) {
  const [activeTab, setActiveTab] = useState("design");
  
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(true);

  const { mutate: fetchStats, data: stats, isPending: loadingStats } = useQrStats();

  useEffect(() => {
    const generatePreview = async () => {
      try {
        setIsGeneratingPreview(true);
        const canvas = await buildPuntoInfocasaCanvas(property.id);
        setPreviewImage(canvas.toDataURL("image/jpeg", 0.95));
      } catch (error) {
        console.error("Error al generar vista previa:", error);
      } finally {
        setIsGeneratingPreview(false);
      }
    };

    generatePreview();
  }, [property.id]);

  useEffect(() => {
    if (activeTab === "stats" && !stats) {
      fetchStats(property.id);
    }
  }, [activeTab, property.id, stats, fetchStats]);

  const handleDownloadPDF = async () => {
    try {
      setIsLoading(true);
      const canvas = await buildPuntoInfocasaCanvas(property.id);
      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
      pdf.save(`punto-infocasa-${property.id}.pdf`);
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      alert("Hubo un error al generar el PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = async () => {
    try {
      setIsLoading(true);
      const canvas = await buildPuntoInfocasaCanvas(property.id);
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.95);

      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Punto Infocasa</title>
            <style>
              body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: white; }
              img { max-width: 100%; max-height: 100vh; object-fit: contain; }
              @media print { body { margin: 0; padding: 0; } img { max-width: 100%; max-height: 100vh; object-fit: contain; } }
            </style>
          </head>
          <body>
            <img src="${imageDataUrl}" alt="Punto Infocasa" />
          </body>
        </html>
      `);
      iframeDoc.close();

      const img = iframeDoc.querySelector("img");
      if (img) {
        img.onload = () => {
          setTimeout(() => {
            iframe.contentWindow.print();
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 1000);
          }, 500);
        };
      }
    } catch (error) {
      console.error("Error al imprimir:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportStatsPDF = () => {
    if (!stats) return;
    try {
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text(`Estadísticas Punto InfoCasa`, 14, 22);

      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Propiedad: ${property.title}`, 14, 30);
      doc.text(`Total de escaneos: ${stats.total_scans}`, 14, 36);
      doc.text(`Fecha del reporte: ${new Date().toLocaleString()}`, 14, 42);

      const tableData = stats.history.map((scan) => [
        new Date(scan.created_at).toLocaleDateString(),
        new Date(scan.created_at).toLocaleTimeString(),
        scan.ip_address || "Desconocida",
        scan.user_agent ? scan.user_agent.substring(0, 30) + "..." : "Desconocido",
      ]);

      autoTable(doc, {
        startY: 50,
        head: [["Fecha", "Hora", "IP", "Dispositivo"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [255, 0, 25] },
        styles: { fontSize: 9 },
      });

      doc.save(`Estadisticas_QR_${property.id}.pdf`);
    } catch (error) {
      console.error("Error al exportar estadísticas:", error);
      alert("Hubo un error al generar el PDF de estadísticas.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h3 className="text-xl font-black text-slate-900">Punto Infocasa</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-slate-100">
          <button
            onClick={() => setActiveTab("design")}
            className={`py-4 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "design" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Printer className="w-4 h-4" /> Diseño del Cartel
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`py-4 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "stats" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Estadísticas
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 flex flex-col items-center overflow-y-auto w-full">
          {activeTab === "design" && (
            <>
              <div className="relative w-full max-w-md">
                {isGeneratingPreview ? (
                  <div className="w-full aspect-[2480/3508] bg-slate-100 rounded-lg flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                  </div>
                ) : previewImage ? (
                  <img src={previewImage} alt="Punto Infocasa" className="w-full h-auto rounded-lg shadow-sm" />
                ) : (
                  <div className="w-full aspect-[2480/3508] bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                    Error al generar la vista previa
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-6 w-full max-w-md">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isLoading || isGeneratingPreview}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Descargar PDF
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
            </>
          )}

          {activeTab === "stats" && (
            <div className="w-full space-y-4 pt-4">
              {loadingStats ? (
                <div className="py-20 flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : stats ? (
                <>
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total de Escaneos</p>
                      <p className="text-3xl font-black text-slate-900">{stats.total_scans}</p>
                    </div>
                    <button
                      onClick={handleExportStatsPDF}
                      className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition shadow-lg shadow-red-600/20"
                    >
                      <FileText className="w-4 h-4" /> Exportar PDF
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="px-4 py-3 font-bold">Fecha</th>
                          <th className="px-4 py-3 font-bold">Hora</th>
                          <th className="px-4 py-3 font-bold">IP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stats.history.map((scan) => (
                          <tr key={scan.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-700">{new Date(scan.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-slate-700">{new Date(scan.created_at).toLocaleTimeString()}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{scan.ip_address || "-"}</td>
                          </tr>
                        ))}
                        {stats.history.length === 0 && (
                          <tr>
                            <td colSpan="3" className="px-4 py-8 text-center text-slate-500">
                              Aún no hay escaneos registrados.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-center text-slate-500 py-10">No se pudieron cargar las estadísticas.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
