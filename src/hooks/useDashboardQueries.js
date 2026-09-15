import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "../api/api";
import { readPaginated } from "../lib/pagination";
import { usePlans } from "./usePlans";
import { mapProperty, getPropertiesByUser } from "./useProperties";
import { mapLead, buildLeadParams, isDashboardLoading } from "./dashboardData.helpers";

/** Sólo se manda `page` a partir de la 2ª (la 1ª es el default del backend). */
const pageParam = (page) => (page > 1 ? { page } : {});

/**
 * Todas las lecturas (queries) del dashboard, habilitadas según rol.
 *
 * Los listados vienen **paginados por el backend** (paginador de Laravel): la página
 * viaja en la query key y en el request, y se devuelve la `meta` de cada listado para
 * el paginador y los contadores. Ver `specs/dashboard/listing_pagination/spec.md`.
 *
 * Capa de datos: ver .ai/context/architecture.md.
 */
export const useDashboardQueries = (user, { isAdmin, isBuyer }, filters, pages) => {
  const { usePlansQuery, useUserPlanQuery } = usePlans();
  const enabledSeller = !!user && !isBuyer;
  const { filterStatus, filterDateFrom, filterDateTo, propSearch, propStatus, propOperation } = filters;
  const {
    propertiesPage, leadsPage, favoritesPage, sentLeadsPage, adminUsersPage, adminPropertiesPage,
  } = pages;

  const plansQuery = usePlansQuery({ enabled: enabledSeller });
  const userPlanQuery = useUserPlanQuery({ enabled: enabledSeller });

  const propertiesQuery = useQuery({
    queryKey: ["me_properties", propSearch, propStatus, propOperation, propertiesPage],
    queryFn: () =>
      getPropertiesByUser(user?.id, {
        search: propSearch, status: propStatus, operation: propOperation, page: propertiesPage,
      }),
    enabled: enabledSeller,
    placeholderData: keepPreviousData,
  });

  const leadsQuery = useQuery({
    queryKey: ["leads", filterStatus, filterDateFrom, filterDateTo, leadsPage],
    queryFn: async () => {
      const res = await api.get("/leads", {
        params: { ...buildLeadParams(filterStatus, filterDateFrom, filterDateTo), ...pageParam(leadsPage) },
      });
      return readPaginated(res, mapLead);
    },
    enabled: enabledSeller,
    placeholderData: keepPreviousData,
  });

  const favoritesQuery = useQuery({
    queryKey: ["me_favorites", favoritesPage],
    queryFn: async () => {
      const res = await api.get("/me/favorites", { params: pageParam(favoritesPage) });
      return readPaginated(res, mapProperty);
    },
    enabled: !!user && isBuyer,
    placeholderData: keepPreviousData,
  });

  const sentLeadsQuery = useQuery({
    queryKey: ["sent_leads", filterStatus, filterDateFrom, filterDateTo, sentLeadsPage],
    queryFn: async () => {
      const res = await api.get("/leads/sent", {
        params: { ...buildLeadParams(filterStatus, filterDateFrom, filterDateTo), ...pageParam(sentLeadsPage) },
      });
      return readPaginated(res, mapLead);
    },
    enabled: !!user && isBuyer,
    placeholderData: keepPreviousData,
  });

  const adminUsersQuery = useQuery({
    queryKey: ["admin_users", adminUsersPage],
    queryFn: async () => {
      const res = await api.get("/users", { params: pageParam(adminUsersPage) });
      return readPaginated(res);
    },
    enabled: isAdmin,
    placeholderData: keepPreviousData,
  });

  const adminPropertiesQuery = useQuery({
    queryKey: ["admin_properties", adminPropertiesPage],
    queryFn: async () => {
      const res = await api.get("/admin/properties", { params: pageParam(adminPropertiesPage) });
      return readPaginated(res, mapProperty);
    },
    enabled: isAdmin,
    placeholderData: keepPreviousData,
  });

  const loading = isDashboardLoading(isBuyer, {
    favorites: favoritesQuery.isLoading,
    sentLeads: sentLeadsQuery.isLoading,
    properties: propertiesQuery.isLoading,
    leads: leadsQuery.isLoading,
    userPlan: userPlanQuery.isLoading,
    plans: plansQuery.isLoading,
    adminUsers: adminUsersQuery.isLoading,
    adminProperties: adminPropertiesQuery.isLoading,
  });

  const adminProperties = adminPropertiesQuery.data?.items || [];

  return {
    favorites: favoritesQuery.data?.items || [],
    favoritesMeta: favoritesQuery.data?.meta || null,
    sentLeads: sentLeadsQuery.data?.items || [],
    sentLeadsMeta: sentLeadsQuery.data?.meta || null,
    properties: propertiesQuery.data?.items || [],
    propertiesMeta: propertiesQuery.data?.meta || null,
    leads: leadsQuery.data?.items || [],
    leadsMeta: leadsQuery.data?.meta || null,
    adminUsers: adminUsersQuery.data?.items || [],
    adminUsersMeta: adminUsersQuery.data?.meta || null,
    adminProperties,
    adminPropertiesMeta: adminPropertiesQuery.data?.meta || null,
    // Cola de certificaciones (alquiler temporario) esperando revisión del admin.
    // OJO: se filtra sobre la PÁGINA actual de admin/properties — ver "Fuera de alcance"
    // en specs/dashboard/listing_pagination/spec.md (necesita filtro server-side).
    pendingCertifications: adminProperties.filter((p) => p.certificationStatus === "pending"),
    userPlan: userPlanQuery.data || null,
    plansList: plansQuery.data || [],
    loading,
  };
};
