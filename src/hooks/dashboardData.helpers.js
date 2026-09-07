import { mapProperty } from "./useProperties";

/** Deriva los roles del usuario (admin / publisher / buyer) desde roles[] o role. */
export const getRoles = (user) => {
  const isAdmin = user?.roles?.some((r) => r.name === "admin") || user?.role === "admin" || false;
  const isPublisher =
    user?.roles?.some((r) => r.name === "owner" || r.name === "agent") ||
    user?.role === "owner" || user?.role === "agent" || false;
  return { isAdmin, isPublisher, isBuyer: !isAdmin && !isPublisher };
};

const LEAD_STATUS_LABEL = { pending: "Pendiente", contacted: "Contactado", closed: "Cerrado" };

/** Normaliza un lead del backend al shape que consume el dashboard. */
export const mapLead = (l) => ({
  id: l.id,
  name: l.name,
  email: l.email,
  phone: l.phone,
  message: l.message,
  status: LEAD_STATUS_LABEL[l.status] || "Cerrado",
  statusRaw: l.status,
  createdAt: l.created_at,
  property: mapProperty(l.property),
  replies: l.replies || [],
});

/** ¿El dashboard está cargando? Combina los loading de las queries según rol. */
export const isDashboardLoading = (isBuyer, q) =>
  (isBuyer && (q.favorites || q.sentLeads)) ||
  (!isBuyer && (q.properties || q.leads || q.userPlan || q.plans)) ||
  q.adminUsers ||
  q.adminProperties;

/** Arma los query params de filtro de leads (estado + rango de fechas). */
export const buildLeadParams = (status, from, to) => {
  const params = {};
  if (status) params.status = status;
  if (from) params.date_from = from;
  if (to) params.date_to = to;
  return params;
};
