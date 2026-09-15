import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { getRoles } from "./dashboardData.helpers";
import { useDashboardQueries } from "./useDashboardQueries";
import { useDashboardMutations } from "./useDashboardMutations";

/**
 * Orquestador del dashboard: compone roles + estado de UI + lecturas (useDashboardQueries)
 * + escrituras (useDashboardMutations) en la API plana que consume DashboardPage.
 *
 * Paginación: una página por listado (estado de cliente efímero, no va a la URL ni a Zustand).
 * Cambiar un filtro vuelve a la página 1. Ver `specs/dashboard/listing_pagination/spec.md`.
 */
export const useDashboardData = () => {
  const { user } = useAuth();
  const roles = getRoles(user);

  // Estado de UI / filtros (vive acá; las mutations/queries lo reciben).
  const [showCheckout, setShowCheckout] = useState(false);
  const [reductionPercent, setReductionPercent] = useState(5);
  const [reductionCustom, setReductionCustom] = useState({});
  const [reducingId, setReducingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [propSearch, setPropSearch] = useState("");
  const [propStatus, setPropStatus] = useState("");
  const [propOperation, setPropOperation] = useState("");

  // Una página por listado — cada pestaña navega sin arrastrar a las demás.
  const [propertiesPage, setPropertiesPage] = useState(1);
  const [leadsPage, setLeadsPage] = useState(1);
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [sentLeadsPage, setSentLeadsPage] = useState(1);
  const [adminUsersPage, setAdminUsersPage] = useState(1);
  const [adminPropertiesPage, setAdminPropertiesPage] = useState(1);

  const queries = useDashboardQueries(user, roles, {
    filterStatus, filterDateFrom, filterDateTo, propSearch, propStatus, propOperation,
  }, {
    propertiesPage, leadsPage, favoritesPage, sentLeadsPage, adminUsersPage, adminPropertiesPage,
  });

  const mutations = useDashboardMutations({
    reductionCustom, reductionPercent, setReductionCustom, setReducingId, setShowCheckout,
  });

  // Si la página quedó fuera de rango (p.ej. se borró el último ítem de la última página),
  // el backend devuelve una lista vacía: se vuelve a la última página real.
  const { propertiesMeta, leadsMeta, favoritesMeta, sentLeadsMeta, adminUsersMeta, adminPropertiesMeta } = queries;
  useEffect(() => {
    const listados = [
      [propertiesMeta, setPropertiesPage],
      [leadsMeta, setLeadsPage],
      [favoritesMeta, setFavoritesPage],
      [sentLeadsMeta, setSentLeadsPage],
      [adminUsersMeta, setAdminUsersPage],
      [adminPropertiesMeta, setAdminPropertiesPage],
    ];
    for (const [meta, setPage] of listados) {
      if (meta && meta.currentPage > meta.lastPage) setPage(meta.lastPage || 1);
    }
  }, [propertiesMeta, leadsMeta, favoritesMeta, sentLeadsMeta, adminUsersMeta, adminPropertiesMeta]);

  // Filtrar siempre reinicia el listado afectado: quedarse en la página 5 tras filtrar
  // puede caer fuera de rango y mostrar un vacío engañoso.
  const withPropertiesReset = (setter) => (value) => { setter(value); setPropertiesPage(1); };
  const withLeadsReset = (setter) => (value) => { setter(value); setLeadsPage(1); setSentLeadsPage(1); };

  return {
    user,
    ...roles,
    ...queries,
    ...mutations,
    showCheckout, setShowCheckout,
    reductionPercent, setReductionPercent,
    reductionCustom, setReductionCustom,
    reducingId,
    filterStatus, setFilterStatus: withLeadsReset(setFilterStatus),
    filterDateFrom, setFilterDateFrom: withLeadsReset(setFilterDateFrom),
    filterDateTo, setFilterDateTo: withLeadsReset(setFilterDateTo),
    propSearch, setPropSearch: withPropertiesReset(setPropSearch),
    propStatus, setPropStatus: withPropertiesReset(setPropStatus),
    propOperation, setPropOperation: withPropertiesReset(setPropOperation),
    // Paginación por listado.
    propertiesPage, setPropertiesPage,
    leadsPage, setLeadsPage,
    favoritesPage, setFavoritesPage,
    sentLeadsPage, setSentLeadsPage,
    adminUsersPage, setAdminUsersPage,
    adminPropertiesPage, setAdminPropertiesPage,
  };
};
