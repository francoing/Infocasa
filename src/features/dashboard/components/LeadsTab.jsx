import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Loader2, Send } from "lucide-react";
import LeadFilters from "./LeadFilters";
import { leadStatusBadge } from "./leadStatus";

const fmtDate = (d) => new Date(d).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" });
const fmtDateTime = (d) => new Date(d).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });

function ReplyForm({ lead, replyBody, setReplyBody, onSendReply, isReplying, onCancel }) {
  return (
    <div className="space-y-3 pt-3 border-t border-slate-100">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Responder a {lead.name}</label>
        <textarea
          rows={3}
          value={replyBody}
          onChange={(e) => setReplyBody(e.target.value)}
          placeholder="Escribe tu respuesta aquí. Se le enviará automáticamente un correo electrónico con tu mensaje."
          className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-sm resize-none font-medium text-slate-700 bg-white"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-xs transition-all active:scale-95">
          Cancelar
        </button>
        <button
          onClick={() => onSendReply(lead.id)}
          disabled={!replyBody.trim() || isReplying}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 active:scale-95"
        >
          {isReplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Enviar por Correo
        </button>
      </div>
    </div>
  );
}

function LeadCard({ lead, replyingLeadId, setReplyingLeadId, replyBody, setReplyBody, onSendReply, isReplying, onUpdateLeadStatus }) {
  const isReplyingHere = replyingLeadId === lead.id;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-all space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h4 className="font-bold text-slate-900 text-base">{lead.name}</h4>
          <p className="text-xs text-blue-600 font-semibold">{lead.email}</p>
          {lead.phone && <p className="text-xs text-slate-500 font-semibold mt-1">Celular: {lead.phone}</p>}
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
      <p className="text-slate-600 text-sm italic bg-slate-50/50 p-4 rounded-xl border border-slate-100 leading-relaxed">"{lead.message}"</p>

      {lead.replies && lead.replies.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Historial de respuestas</h5>
          <div className="space-y-2.5">
            {lead.replies.map((reply) => (
              <div key={reply.id} className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 text-xs">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-slate-700">{reply.user?.name || "Propietario"}</span>
                  <span className="text-slate-400 text-[10px] font-medium">{fmtDateTime(reply.created_at)}</span>
                </div>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{reply.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isReplyingHere && (
        <ReplyForm
          lead={lead}
          replyBody={replyBody}
          setReplyBody={setReplyBody}
          onSendReply={onSendReply}
          isReplying={isReplying}
          onCancel={() => { setReplyingLeadId(null); setReplyBody(""); }}
        />
      )}

      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          Recibido: {fmtDate(lead.createdAt)}
        </span>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado:</span>
            <select
              value={lead.statusRaw || "pending"}
              onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value)}
              className="text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="pending">Pendiente</option>
              <option value="contacted">Contactado</option>
              <option value="closed">Cerrado</option>
            </select>
          </div>
          {!isReplyingHere && (
            <button
              onClick={() => { setReplyingLeadId(lead.id); setReplyBody(""); }}
              className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-600/10 active:scale-95"
            >
              Responder
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Tab de consultas recibidas (rol vendedor): filtros + tarjetas con respuesta inline. */
export default function LeadsTab({ leads, filterStatus, setFilterStatus, filterDateFrom, setFilterDateFrom, filterDateTo, setFilterDateTo, ...cardProps }) {
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

      {leads.length > 0 ? (
        leads.map((lead) => <LeadCard key={lead.id} lead={lead} {...cardProps} />)
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-500">No se encontraron consultas con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
}
