import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";
import Layout from "@/common/components/Layout";
import CheckoutModal from "@/features/dashboard/components/CheckoutModal";
import { useDashboardData } from "@/hooks/useDashboardData";
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

export default function DashboardPage() {
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

  const [activeTab, setActiveTab] = useState("properties");

  useEffect(() => {
    setActiveTab(isBuyer ? "favorites" : "properties");
  }, [isBuyer]);

  const [expandedId, setExpandedId] = useState(null);
  const [replyingLeadId, setReplyingLeadId] = useState(null);
  const [replyBody, setReplyBody] = useState("");

  const [localSearch, setLocalSearch] = useState("");
  const [localStatus, setLocalStatus] = useState("");
  const [localOperation, setLocalOperation] = useState("");

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanPicker, setShowPlanPicker] = useState(false);

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

  const renderTab = () => {
    switch (activeTab) {
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
        return (
          <PropertiesTab
            properties={properties}
            filters={{
              localSearch, setLocalSearch, localStatus, setLocalStatus, localOperation, setLocalOperation,
              propSearch, propStatus, propOperation,
              onApply: applyPropertyFilters, onClear: clearPropertyFilters,
            }}
            rowProps={{
              expandedId, onToggleExpand: toggleExpand, onDelete: confirmDeleteProperty,
              reductionPercent, setReductionPercent, reductionCustom, setReductionCustom, reducingId, onReducePrice: handleReducePrice,
            }}
          />
        );
      case "admin_users":
        return isAdmin ? (
          <AdminUsersTab adminUsers={adminUsers} currentUserId={user.id} onUpdateUserStatus={updateUserStatus} onDeleteUser={confirmDeleteUser} />
        ) : null;
      case "admin_properties":
        return isAdmin ? <AdminPropertiesTab adminProperties={adminProperties} onDeleteProperty={confirmModerateProperty} /> : null;
      case "certifications":
        return isAdmin ? (
          <CertificationsTab items={pendingCertifications} onModerate={moderateCertification} disabled={isModerating} />
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
    <Layout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Panel de Control</h1>
            <p className="text-slate-500">
              {isBuyer
                ? `Bienvenido, ${user?.name}. Consulta tus favoritos y consultas.`
                : `Bienvenido, ${user?.name}. Gestiona tus publicaciones y contactos.`}
            </p>
          </div>
          {/* El admin no publica propiedades ni gestiona planes. */}
          {!isBuyer && !isAdmin && (
            userPlan ? (
              <Link
                to="/dashboard/properties/create"
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <Plus className="w-5 h-5" /> Nueva Propiedad
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-slate-200 text-slate-400 cursor-not-allowed select-none shadow-sm">
                <Plus className="w-5 h-5" /> Nueva Propiedad
              </span>
            )
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
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : (
          <div>{renderTab()}</div>
        )}
      </div>

      {showPlanPicker && plansList.length > 0 && (
        <PlanPickerModal plans={plansList} userPlan={userPlan} onChoose={openCheckout} onClose={() => setShowPlanPicker(false)} />
      )}

      {showCheckout && selectedPlan && (
        <CheckoutModal plan={selectedPlan} onConfirm={() => handleAssignPlan(selectedPlan)} onCancel={() => setShowCheckout(false)} />
      )}
    </Layout>
  );
}
