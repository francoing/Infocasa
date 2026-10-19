
import { useTogglePropertyStatus } from "@/hooks/usePropertyStatus";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Loader from "@/common/components/Loader";
import CheckoutModal from "@/features/dashboard/components/CheckoutModal";
import { useDashboardData } from "@/hooks/useDashboardData";
import { usePublicationQuota } from "@/hooks/usePublicationQuota";
import DashboardStats from "../components/DashboardStats";
import DashboardTabs from "../components/DashboardTabs";
import FavoritesTab from "../components/FavoritesTab";
import SentLeadsTab from "../components/SentLeadsTab";
import PropertiesTab from "../components/PropertiesTab";
import AdminUsersTab from "../components/AdminUsersTab";
import AdminPropertiesTab from "../components/AdminPropertiesTab";
import CertificationsTab from "../components/CertificationsTab";
import LeadsTab from "../components/LeadsTab";
import PlanPickerModal from "../components/PlanPickerModal";
import AssignInfocoinsModal from "@/features/infocoins/components/AssignInfocoinsModal";
import MySearchAlertsList from "@/features/searchAlerts/components/MySearchAlertsList";
import ReceivedSearchAlertsList from "@/features/searchAlerts/components/ReceivedSearchAlertsList";

export default function DashboardPage() {
  const queryClient = useQueryClient();

  const {
    user, isAdmin, isBuyer,
    favorites, sentLeads, removeFavorite,
    properties, leads, adminUsers, adminProperties, pendingCertifications,
    userPlan, plansList, loading,
    showCheckout, setShowCheckout,
    reductionPercent, setReductionPercent, reductionCustom, setReductionCustom, reducingId, handleReducePrice,
    deleteProperty, updateLeadStatus, replyToLead, isReplying, moderateCertification, isModerating,
    filterStatus, setFilterStatus, filterDateFrom, setFilterDateFrom, filterDateTo, setFilterDateTo,
    propSearch, setPropSearch, propStatus, setPropStatus, propOperation, setPropOperation,
    handleAssignPlan, updateUserStatus, deleteUser,
  } = useDashboardData();

  const { data: quota } = usePublicationQuota({ enabled: !isBuyer && !isAdmin });
  const noPropsLeft =
    !!quota?.properties &&
    quota.properties.available !== null &&
    quota.properties.available <= 0;

  const [activeTab, setActiveTab] = useState("properties");

  useEffect(() => {
    setActiveTab(isBuyer ? "search_alerts" : isAdmin ? "admin_properties" : "properties");
  }, [isBuyer, isAdmin]);

  const [expandedId, setExpandedId] = useState(null);
  const [replyingLeadId, setReplyingLeadId] = useState(null);
  const [replyBody, setReplyBody] = useState("");

  const [localSearch, setLocalSearch] = useState("");
  const [localStatus, setLocalStatus] = useState("");
  const [localOperation, setLocalOperation] = useState("");

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanPicker, setShowPlanPicker] = useState(false);

  const [assignTarget, setAssignTarget] = useState(null);

  const applyPropertyFilters = () => {
    setPropSearch(localSearch);
    setPropStatus(localStatus);
    setPropOperation(localOperation);
  };

  const clearPropertyFilters = () => {
    setLocalSearch("");
    setLocalStatus("");
    setLocalOperation("");
    setPropSearch("");
    setPropStatus("");
    setPropOperation("");
  };

  const handleSendReply = async (leadId) => {
    if (!replyBody.trim()) return;
    try {
      await replyToLead(leadId, replyBody);
      setReplyBody("");
      setReplyingLeadId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const openCheckout = (plan) => {
    setSelectedPlan(plan);
    setShowPlanPicker(false);
    setShowCheckout(true);
  };

  const confirmDeleteProperty = (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta propiedad?")) deleteProperty(id);
  };

  const confirmModerateProperty = (id) => {
    if (window.confirm("¿Dar de baja esta propiedad?")) deleteProperty(id);
  };

  const confirmDeleteUser = (id) => {
    if (window.confirm("¿Borrar este usuario permanentemente?")) deleteUser(id);
  };

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  const handleAssignInfocoinsSuccess = () => {
    setAssignTarget(null);
    queryClient.invalidateQueries({ queryKey: ["me_properties"] });
  };

  const { mutate: toggleStatus } = useTogglePropertyStatus();

  const handleToggleStatus = (propertyId) => {
    toggleStatus(propertyId, {
      onError: (err) => alert(err.message || "Error al cambiar el estado de la propiedad"),
    });
  };

  const renderTab = () => {
    switch (activeTab) {
      case "search_alerts":
        return <MySearchAlertsList />;
      case "received_alerts":
        return <ReceivedSearchAlertsList />;
      case "favorites":
        return <FavoritesTab favorites={favorites} onRemoveFavorite={removeFavorite} />;
      case "sent_leads":
        return (
          <SentLeadsTab
            sentLeads={sentLeads}
            filterStatus={filterStatus} setFilterStatus={setFilterStatus}
            filterDateFrom={filterDateFrom} setFilterDateFrom={setFilterDateFrom}
            filterDateTo={filterDateTo} setFilterDateTo={setFilterDateTo}
          />
        );
      case "properties":
        return isAdmin ? null : (
          <PropertiesTab
            properties={properties}
            filters={{
              localSearch, setLocalSearch, localStatus, setLocalStatus, localOperation, setLocalOperation,
              propSearch, propStatus, propOperation,
              onApply: applyPropertyFilters, onClear: clearPropertyFilters,
            }}
            rowProps={{
              expandedId, onToggleExpand: toggleExpand, onDelete: confirmDeleteProperty,
              onAssignInfocoins: (prop) => setAssignTarget(prop),
              onToggleStatus: handleToggleStatus, // 👈 NUEVO
              reductionPercent, setReductionPercent, reductionCustom, setReductionCustom, reducingId, onReducePrice: handleReducePrice,
            }}
          />
        );
      case "admin_users":
        return isAdmin ? (
          <AdminUsersTab
            adminUsers={adminUsers}
            currentUserId={user.id}
            onUpdateUserStatus={updateUserStatus}
            onDeleteUser={confirmDeleteUser}
          />
        ) : null;
      case "admin_properties":
        return isAdmin ? (
          <AdminPropertiesTab
            adminProperties={adminProperties}
            onDeleteProperty={confirmModerateProperty}
          />
        ) : null;
      case "certifications":
        return isAdmin ? (
          <CertificationsTab
            items={pendingCertifications}
            onModerate={moderateCertification}
            disabled={isModerating}
          />
        ) : null;
      case "leads":
        return (
          <LeadsTab
            leads={leads}
            filterStatus={filterStatus} setFilterStatus={setFilterStatus}
            filterDateFrom={filterDateFrom} setFilterDateFrom={setFilterDateFrom}
            filterDateTo={filterDateTo} setFilterDateTo={setFilterDateTo}
            replyingLeadId={replyingLeadId} setReplyingLeadId={setReplyingLeadId}
            replyBody={replyBody} setReplyBody={setReplyBody}
            onSendReply={handleSendReply} isReplying={isReplying}
            onUpdateLeadStatus={updateLeadStatus}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Panel de Control</h1>
            <p className="text-slate-500">
              {isBuyer
                ? `Bienvenido, ${user?.name}. Gestioná tus avisos y consultas.`
                : `Bienvenido, ${user?.name}. Gestiona tus publicaciones y contactos.`}
            </p>
          </div>

          {!isBuyer && !isAdmin && (
            userPlan && !noPropsLeft ? (
              <Link to="/dashboard/properties/create" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20">
                <Plus className="w-5 h-5" /> Nueva Propiedad
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-slate-200 text-slate-400 cursor-not-allowed select-none shadow-sm" title={noPropsLeft ? "Alcanzaste el límite de propiedades de tu plan" : "Necesitás un plan activo para publicar"}>
                <Plus className="w-5 h-5" /> Nueva Propiedad
              </span>
            )
          )}

          {isBuyer && (
            <Link to="/dashboard/search-alerts/create" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20">
              <Search className="w-5 h-5" /> Nuevo Aviso de Búsqueda
            </Link>
          )}
        </div>

        <DashboardStats
          isBuyer={isBuyer}
          isAdmin={isAdmin}
          favorites={favorites}
          sentLeads={sentLeads}
          userPlan={userPlan}
          properties={properties}
          leads={leads}
          planExpiresAt={quota?.expires_at}
          onUpgrade={() => setShowPlanPicker(true)}
        />

        <DashboardTabs
          isBuyer={isBuyer}
          isAdmin={isAdmin}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingCertCount={pendingCertifications.length}
        />

        {loading ? (
          <Loader inline className="py-20" />
        ) : (
          <div>{renderTab()}</div>
        )}
      </div>

      {showPlanPicker && plansList.length > 0 && (
        <PlanPickerModal
          plans={plansList}
          userPlan={userPlan}
          onChoose={openCheckout}
          onClose={() => setShowPlanPicker(false)}
        />
      )}

      {showCheckout && selectedPlan && (
        <CheckoutModal
          plan={selectedPlan}
          onConfirm={() => handleAssignPlan(selectedPlan)}
          onCancel={() => setShowCheckout(false)}
        />
      )}

      <AssignInfocoinsModal
        open={!!assignTarget}
        property={assignTarget}
        onClose={() => setAssignTarget(null)}
        onSuccess={handleAssignInfocoinsSuccess}
      />
    </>
  );
}
