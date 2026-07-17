import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";
import { usePlans } from "./usePlans";
import { mapProperty, getPropertiesByUser } from "./useProperties";
import { mapLead, buildLeadParams, isDashboardLoading } from "./dashboardData.helpers";

/**
 * Todas las lecturas (queries) del dashboard, habilitadas según rol.
 * Capa de datos: ver .ai/context/architecture.md.
 */
export const useDashboardQueries = (user, { isAdmin, isBuyer }, filters) => {
  const { usePlansQuery, useUserPlanQuery } = usePlans();
  const enabledSeller = !!user && !isBuyer;
  const { filterStatus, filterDateFrom, filterDateTo, propSearch, propStatus, propOperation } = filters;

  const plansQuery = usePlansQuery({ enabled: enabledSeller });
  const userPlanQuery = useUserPlanQuery({ enabled: enabledSeller });

  const propertiesQuery = useQuery({
    queryKey: ["me_properties", propSearch, propStatus, propOperation],
    queryFn: () => getPropertiesByUser(user?.id, { search: propSearch, status: propStatus, operation: propOperation }),
    enabled: enabledSeller,
  });

  const leadsQuery = useQuery({
    queryKey: ["leads", filterStatus, filterDateFrom, filterDateTo],
    queryFn: async () => {
      const res = await api.get("/leads", { params: buildLeadParams(filterStatus, filterDateFrom, filterDateTo) });
      return res.data || [];
    },
    select: (data) => data.map(mapLead),
    enabled: enabledSeller,
  });

  const favoritesQuery = useQuery({
    queryKey: ["me_favorites"],
    queryFn: async () => {
      const res = await api.get("/me/favorites");
      return res.data?.map((p) => mapProperty(p)) || [];
    },
    enabled: !!user && isBuyer,
  });

  const sentLeadsQuery = useQuery({
    queryKey: ["sent_leads", filterStatus, filterDateFrom, filterDateTo],
    queryFn: async () => {
      const res = await api.get("/leads/sent", { params: buildLeadParams(filterStatus, filterDateFrom, filterDateTo) });
      return res.data || [];
    },
    select: (data) => data.map(mapLead),
    enabled: !!user && isBuyer,
  });

  const adminUsersQuery = useQuery({
    queryKey: ["admin_users"],
    queryFn: async () => {
      const res = await api.get("/users");
      return res.data || [];
    },
    enabled: isAdmin,
  });

  const adminPropertiesQuery = useQuery({
    queryKey: ["admin_properties"],
    queryFn: async () => {
      const res = await api.get("/admin/properties");
      return res.data?.map((p) => mapProperty(p)) || [];
    },
    enabled: isAdmin,
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

  return {
    favorites: favoritesQuery.data || [],
    sentLeads: sentLeadsQuery.data || [],
    properties: propertiesQuery.data || [],
    leads: leadsQuery.data || [],
    adminUsers: adminUsersQuery.data || [],
    adminProperties: adminPropertiesQuery.data || [],
    userPlan: userPlanQuery.data || null,
    plansList: plansQuery.data || [],
    loading,
  };
};
