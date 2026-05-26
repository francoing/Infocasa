import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Home, MessageSquare, Plus, Edit, Trash2, ExternalLink, Loader2, MapPin, Calendar, TrendingDown, Percent, ChevronDown, ChevronUp } from "lucide-react";
import Layout from "@/common/components/Layout";
import PlanStatusCard from "@/common/components/PlanStatusCard";
import CheckoutModal from "@/features/dashboard/components/CheckoutModal";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function DashboardPage() {
  const {
    user,
    properties,
    leads,
    userPlan,
    plansList,
    loading,
    showCheckout,
    setShowCheckout,
    reductionPercent,
    setReductionPercent,
    reductionCustom,
    setReductionCustom,
    reducingId,
    handleReducePrice,
    deleteProperty,
    handleAssignPlan
  } = useDashboardData();

  const [activeTab, setActiveTab] = useState("properties");
  const [expandedId, setExpandedId] = useState(null);

  const handleDeletePropertyConfirm = (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta propiedad?")) {
      deleteProperty(id);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Panel de Control</h1>
            <p className="text-slate-500">Bienvenido, {user?.name}. Gestiona tus publicaciones y contactos.</p>
          </div>
          <Link 
            to="/dashboard/properties/create" 
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-5 h-5" /> Nueva Propiedad
          </Link>
        </div>

        {/* Plan Status and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          <div className="lg:col-span-4">
            {userPlan && (
              <PlanStatusCard 
                plan={userPlan} 
                usage={properties.length} 
                limit={userPlan.details.limit} 
                onUpgrade={() => setShowCheckout(true)}
              />
            )}
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Home className="w-6 h-6" />
                </div>
                <span className="text-slate-500 font-medium">Propiedades Totales</span>
              </div>
              <div className="text-3xl font-bold text-slate-900">{properties.length}</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="text-slate-500 font-medium">Consultas Recibidas</span>
              </div>
              <div className="text-3xl font-bold text-slate-900">{leads.length}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-slate-200 mb-8">
          <button 
            onClick={() => setActiveTab("properties")}
            className={`pb-4 font-bold transition-all relative ${activeTab === "properties" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            Mis Propiedades
            {activeTab === "properties" && <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></span>}
          </button>
          <button 
            onClick={() => setActiveTab("leads")}
            className={`pb-4 font-bold transition-all relative ${activeTab === "leads" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            Consultas Recibidas
            {activeTab === "leads" && <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></span>}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : (
          <div>
            {activeTab === "properties" ? (
              <div className="grid grid-cols-1 gap-4">
                {properties.length > 0 ? (
                  properties.map(prop => (
                    <div key={prop.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="p-4 flex flex-col md:flex-row items-center gap-6">
                        <div className="w-full md:w-32 h-24 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={prop.imageUrl} alt={prop.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-lg truncate">{prop.title}</h3>
                            {prop.priceHistory?.length > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-600 rounded-full uppercase whitespace-nowrap">
                                Precio reducido
                              </span>
                            )}
                          </div>
                          <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                            <MapPin className="w-4 h-4 text-slate-400" /> {prop.location}
                          </p>
                          <p className="font-black text-slate-900 mt-2">USD {prop.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                          <Link 
                            to={`/properties/${prop.id}`}
                            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Ver publicación"
                            target="_blank"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </Link>
                          <Link 
                            to={`/dashboard/properties/edit/${prop.id}`}
                            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button 
                            onClick={() => handleDeletePropertyConfirm(prop.id)}
                            className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setExpandedId(expandedId === prop.id ? null : prop.id)}
                            className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                            title="Ajustar Precio"
                          >
                            {expandedId === prop.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {expandedId === prop.id && (
                        <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex flex-col md:flex-row justify-between gap-6">
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900 text-sm mb-1">Ajustar Precio (Reducción Directa)</h4>
                            <p className="text-slate-500 text-xs">Aplica una reducción porcentual al valor de venta y registra un badge visual de descuento en la publicación.</p>
                            {prop.priceHistory?.length > 0 && (
                              <div className="mt-3 space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historial de rebajas:</p>
                                {prop.priceHistory.map((h, i) => (
                                  <p key={i} className="text-xs font-semibold text-green-600">
                                    Rebaja del {h.percentage}% (USD {h.oldPrice.toLocaleString()} → USD {h.newPrice.toLocaleString()}) el {new Date(h.date).toLocaleDateString()}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descuento</span>
                              <div className="flex gap-2">
                                {[5, 10, 15].map(pct => (
                                  <button
                                    key={pct}
                                    onClick={() => setReductionPercent(pct)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${reductionPercent === pct && !reductionCustom[prop.id] ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                  >
                                    {pct}%
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Otro % / Aplicar</span>
                              <div className="flex items-center gap-2">
                                <div className="relative w-28">
                                  <input 
                                    type="number"
                                    placeholder="% personalizado"
                                    value={reductionCustom[prop.id] || ""}
                                    onChange={(e) => setReductionCustom(prev => ({ ...prev, [prop.id]: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-600 outline-none text-xs font-bold"
                                  />
                                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                </div>
                                <button
                                  onClick={() => handleReducePrice(prop)}
                                  disabled={reducingId === prop.id || (!reductionCustom[prop.id] && !reductionPercent)}
                                  className="px-5 py-2 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-1"
                                >
                                  {reducingId === prop.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingDown className="w-3 h-3" />}
                                  Aplicar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-500">No tienes propiedades publicadas todavía.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {leads.length > 0 ? (
                  leads.map(lead => (
                    <div key={lead.id} className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-slate-900">{lead.name}</h4>
                          <p className="text-sm text-blue-600">{lead.email}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 bg-green-50 text-green-600 rounded-full uppercase tracking-wider">
                          {lead.status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm italic">"{lead.message}"</p>
                      <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-medium">Recibido: {new Date(lead.createdAt).toLocaleDateString()}</span>
                        <button className="text-xs font-bold text-blue-600 hover:underline">Responder</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-500">No has recibido consultas todavía.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showCheckout && (
        <CheckoutModal 
          plan={plansList.find(p => p.id === 'premium') || plansList[1]}
          onConfirm={(planId) => handleAssignPlan(planId)}
          onCancel={() => setShowCheckout(false)}
        />
      )}
    </Layout>
  );
}
