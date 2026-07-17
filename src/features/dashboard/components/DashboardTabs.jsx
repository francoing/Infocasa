import React from "react";

const TabButton = ({ id, activeTab, setActiveTab, children, accent = "blue" }) => {
  const isActive = activeTab === id;
  const activeText = accent === "amber" ? "text-amber-600" : "text-blue-600";
  const hover = accent === "amber" ? "hover:text-amber-600" : "hover:text-slate-600";
  const bar = accent === "amber" ? "bg-amber-600" : "bg-blue-600";
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`pb-4 font-bold transition-all relative ${isActive ? activeText : `text-slate-400 ${hover}`}`}
    >
      {children}
      {isActive && <span className={`absolute bottom-0 left-0 w-full h-1 ${bar} rounded-t-full`}></span>}
    </button>
  );
};

/** Barra de tabs del dashboard, según rol (buyer / seller / admin). */
export default function DashboardTabs({ isBuyer, isAdmin, activeTab, setActiveTab }) {
  const tabProps = { activeTab, setActiveTab };

  return (
    <div className="flex flex-wrap gap-8 border-b border-slate-200 mb-8">
      {isBuyer ? (
        <>
          <TabButton id="favorites" {...tabProps}>Mis Favoritos</TabButton>
          <TabButton id="sent_leads" {...tabProps}>Mis Consultas</TabButton>
        </>
      ) : (
        <>
          <TabButton id="properties" {...tabProps}>Mis Propiedades</TabButton>
          <TabButton id="leads" {...tabProps}>Consultas Recibidas</TabButton>
          {isAdmin && (
            <>
              <TabButton id="admin_users" accent="amber" {...tabProps}>Gestión de Usuarios</TabButton>
              <TabButton id="admin_properties" accent="amber" {...tabProps}>Moderación Propiedades</TabButton>
            </>
          )}
        </>
      )}
    </div>
  );
}
