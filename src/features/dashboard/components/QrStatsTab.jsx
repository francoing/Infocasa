import React from "react";
import { Loader2, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function QrStatsTab({ stats, loadingStats, propertyTitle, propertyId }) {
  const handleExportStatsPDF = () => {
    if (!stats) return;
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text(`Estadísticas Punto InfoCasa`, 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Propiedad: ${propertyTitle}`, 14, 30);
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

      doc.save(`Estadisticas_QR_${propertyId}.pdf`);
    } catch (error) {
      console.error("Error al exportar estadísticas:", error);
      alert("Hubo un error al generar el PDF de estadísticas.");
    }
  };

  if (loadingStats) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-center text-slate-500 py-10">No se pudieron cargar las estadísticas.</p>;
  }

  return (
    <div className="w-full space-y-4 pt-4">
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
    </div>
  );
}
