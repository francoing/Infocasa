// Badge de estado de lead. Lookup map en lugar del ternario anidado que estaba
// duplicado en las tabs de consultas enviadas y recibidas.
const LEAD_STATUS_BADGE = {
  pending: "bg-amber-50 text-amber-600 border-amber-100",
  contacted: "bg-blue-50 text-blue-600 border-blue-100",
  closed: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

export const leadStatusBadge = (statusRaw) =>
  LEAD_STATUS_BADGE[statusRaw] || "bg-slate-50 text-slate-500 border-slate-100";
