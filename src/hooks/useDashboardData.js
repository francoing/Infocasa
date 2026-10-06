import { useState } from "react";
import { useAuth } from "./useAuth";
import { getRoles } from "./dashboardData.helpers";
import { useDashboardQueries } from "./useDashboardQueries";
import { useDashboardMutations } from "./useDashboardMutations";

/**
 * Orquestador del dashboard: compone roles + estado de UI + lecturas (useDashboardQueries)
 * + escrituras (useDashboardMutations) en la API plana que consume DashboardPage.
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

  const queries = useDashboardQueries(user, roles, {
    filterStatus, filterDateFrom, filterDateTo, propSearch, propStatus, propOperation,
  });

  const mutations = useDashboardMutations({
    reductionCustom, reductionPercent, setReductionCustom, setReducingId, setShowCheckout,
  });

  return {
    user,
    ...roles,
    ...queries,
    ...mutations,
    showCheckout, setShowCheckout,
    reductionPercent, setReductionPercent,
    reductionCustom, setReductionCustom,
    reducingId,
    filterStatus, setFilterStatus,
    filterDateFrom, setFilterDateFrom,
    filterDateTo, setFilterDateTo,
    propSearch, setPropSearch,
    propStatus, setPropStatus,
    propOperation, setPropOperation,
  };
};
