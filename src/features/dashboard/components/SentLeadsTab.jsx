import React from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import LeadFilters from "./LeadFilters";
import { leadStatusBadge } from "./leadStatus";

const fmtDate = (d) => new Date(d).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" });
const fmtDateTime = (d) => new Date(d).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });

function SentLeadCard({ lead }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-all space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h4 className="font-bold text-slate-900 text-base">
            Consulta enviada a: <span className="text-blue-600">{lead.publisher?.name || "Vendedor/Inmobiliaria"}</span>
          </h4>
          {lead.property && (
            <p className="text-xs text-slate-400 font-bold mt-1.5 uppercase tracking-wider">
              Inmueble: <Link to={`/property/${lead.property.id}`} className="text-blue-600 hover:underline">{lead.property.title}</Link>
            </p>
          )}
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${leadStatusBadge(lead.statusRaw)}`}>
          {lead.status}
        </span>
      </div>
      <div className="space-y-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tu Mensaje</span>
        <p className="text-slate-600 text-sm italic bg-slate-50/50 p-4 rounded-xl border border-slate-100 leading-relaxed">"{lead.message}"</p>
      </div>

      {lead.replies && lead.replies.length > 0 ? (
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Respuestas recibidas</h5>
          <div className="space-y-2.5">
            {lead.replies.map((reply) => (
              <div key={reply.id} className="bg-blue-50/30 p-3.5 rounded-xl border border-blue-100/50 text-xs">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-blue-800">{reply.user?.name || "Vendedor/Inmobiliaria"}</span>
                  <span className="text-slate-400 text-[10px] font-medium">{fmtDateTime(reply.created_at)}</span>
                </div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{reply.body}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 font-semibold italic">
          Aún no hay respuestas de la inmobiliaria o vendedor para esta consulta.
        </div>
      )}

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          Enviado el: {fmtDate(lead.createdAt)}
        </span>
      </div>
    </div>
  );
}

/** Tab de consultas enviadas (rol comprador). */
export default function SentLeadsTab({ sentLeads, filterStatus, setFilterStatus, filterDateFrom, setFilterDateFrom, filterDateTo, setFilterDateTo }) {
  return (
    <div className="space-y-6">
      <LeadFilters
        status={filterStatus}
        setStatus={setFilterStatus}
        from={filterDateFrom}
        setFrom={setFilterDateFrom}
        to={filterDateTo}
        setTo={setFilterDateTo}
      />

      {sentLeads && sentLeads.length > 0 ? (
        sentLeads.map((lead) => <SentLeadCard key={lead.id} lead={lead} />)
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-500">No has enviado ninguna consulta con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
}
