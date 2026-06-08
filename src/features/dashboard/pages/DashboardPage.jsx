import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Home, MessageSquare, Plus, Edit, Trash2, ExternalLink, Loader2, MapPin, Calendar, TrendingDown, Percent, ChevronDown, ChevronUp, Eye, Heart, Crown, Check } from "lucide-react";
import Layout from "@/common/components/Layout";
import PlanStatusCard from "@/common/components/PlanStatusCard";
import CheckoutModal from "@/features/dashboard/components/CheckoutModal";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function DashboardPage() {
  const {
    user,
    isAdmin,
    properties,
    leads,
    adminUsers,
    adminProperties,
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
    updateLeadStatus,
    handleAssignPlan,
    updateUserStatus,
    deleteUser
  } = useDashboardData();

  const [activeTab, setActiveTab] = useState("properties");
  const [expandedId, setExpandedId] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanPicker, setShowPlanPicker] = useState(false);

  const openCheckout = (plan) => {
    setSelectedPlan(plan);
    setShowPlanPicker(false);
    setShowCheckout(true);
  };

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
            {userPlan ? (
              <PlanStatusCard 
                plan={userPlan} 
                usage={properties.length} 
                limit={userPlan.details.limit} 
                onUpgrade={() => setShowPlanPicker(true)}
              />
            ) : (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tu Plan Actual</h4>
                <div className="text-lg font-black text-red-500 uppercase">Sin Plan Activo</div>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">Necesitas un plan de publicación activo para poder cargar inmuebles y recibir consultas.</p>
                <button 
                  onClick={() => setShowPlanPicker(true)} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-xs active:scale-95"
                >
                  Activar Plan ahora
                </button>
              </div>
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
        <div className="flex flex-wrap gap-8 border-b border-slate-200 mb-8">
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
          {isAdmin && (
            <>
              <button 
                onClick={() => setActiveTab("admin_users")}
                className={`pb-4 font-bold transition-all relative ${activeTab === "admin_users" ? "text-amber-600" : "text-slate-400 hover:text-amber-600"}`}
              >
                Gestión de Usuarios
                {activeTab === "admin_users" && <span className="absolute bottom-0 left-0 w-full h-1 bg-amber-600 rounded-t-full"></span>}
              </button>
              <button 
                onClick={() => setActiveTab("admin_properties")}
                className={`pb-4 font-bold transition-all relative ${activeTab === "admin_properties" ? "text-amber-600" : "text-slate-400 hover:text-amber-600"}`}
              >
                Moderación Propiedades
                {activeTab === "admin_properties" && <span className="absolute bottom-0 left-0 w-full h-1 bg-amber-600 rounded-t-full"></span>}
              </button>
            </>
          )}
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
                          <div className="flex items-center gap-4 mt-2">
                            <p className="font-black text-slate-900">USD {prop.price.toLocaleString()}</p>
                            <div className="flex items-center gap-3 ml-2 border-l border-slate-200 pl-4">
                              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg" title="Visitas">
                                <Eye className="w-3.5 h-3.5 text-blue-500" /> {prop.viewsCount || 0}
                              </span>
                              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg" title="Favoritos">
                                <Heart className="w-3.5 h-3.5 text-red-500" /> {prop.favoritesCount || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                          <Link 
                            to={`/property/${prop.id}`}
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
            ) : activeTab === "admin_users" && isAdmin ? (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest">
                          <th className="p-4">Usuario</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Rol / Plan</th>
                          <th className="p-4">Estado</th>
                          <th className="p-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {adminUsers.length > 0 ? adminUsers.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs overflow-hidden">
                                  {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : u.name?.charAt(0)}
                                </div>
                                <span className="font-bold text-slate-900 text-sm">{u.name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-slate-600">{u.email}</td>
                            <td className="p-4">
                              <p className="text-xs font-black uppercase text-slate-700">{u.role || 'User'}</p>
                              {u.subscription?.plan && (
                                <p className="text-[10px] text-blue-600 font-bold uppercase">{u.subscription.plan.name}</p>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${u.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {u.active ? 'Activo' : 'Bloqueado'}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button 
                                onClick={() => updateUserStatus(u.id, !u.active)}
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${u.active ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                              >
                                {u.active ? 'Bloquear' : 'Activar'}
                              </button>
                              {user.id !== u.id && (
                                <button 
                                  onClick={() => { if(window.confirm('¿Borrar este usuario permanentemente?')) deleteUser(u.id); }}
                                  className="text-xs font-bold px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                                >
                                  Eliminar
                                </button>
                              )}
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="5" className="p-8 text-center text-slate-500">No hay usuarios.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : activeTab === "admin_properties" && isAdmin ? (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest">
                          <th className="p-4">Propiedad</th>
                          <th className="p-4">Publicador</th>
                          <th className="p-4">Precio</th>
                          <th className="p-4">Estado</th>
                          <th className="p-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {adminProperties.length > 0 ? adminProperties.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img src={p.imageUrl} className="w-12 h-10 rounded-lg object-cover" />
                                <div>
                                  <Link to={`/property/${p.id}`} className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors line-clamp-1">{p.title}</Link>
                                  <p className="text-[10px] text-slate-500 font-medium truncate w-32">{p.location}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-xs font-bold text-slate-700">{p.owner?.name || 'Desconocido'}</td>
                            <td className="p-4 text-sm font-black text-slate-900">USD {p.price.toLocaleString()}</td>
                            <td className="p-4">
                              <span className="text-[10px] px-2 py-1 rounded-full font-bold uppercase bg-blue-100 text-blue-700">
                                {p.status}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <Link 
                                to={`/property/${p.id}`}
                                className="inline-block text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all"
                              >
                                Ver
                              </Link>
                              <button 
                                onClick={() => { if(window.confirm('¿Dar de baja esta propiedad?')) deleteProperty(p.id); }}
                                className="text-xs font-bold px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="5" className="p-8 text-center text-slate-500">No hay propiedades publicadas.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {leads.length > 0 ? (
                  leads.map(lead => (
                    <div key={lead.id} className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-all space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{lead.name}</h4>
                          <p className="text-xs text-blue-600 font-semibold">{lead.email}</p>
                          {lead.phone && <p className="text-xs text-slate-500 font-semibold mt-1">Celular: {lead.phone}</p>}
                          {lead.property && (
                            <p className="text-xs text-slate-400 font-bold mt-1.5 uppercase tracking-wider">
                              Inmueble: <Link to={`/property/${lead.property.id}`} className="text-blue-600 hover:underline">{lead.property.title}</Link>
                            </p>
                          )}
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                          lead.statusRaw === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          lead.statusRaw === 'contacted' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          lead.statusRaw === 'closed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          {lead.status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm italic bg-slate-50/50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                        "{lead.message}"
                      </p>
                      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Recibido: {new Date(lead.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado:</span>
                            <select 
                              value={lead.statusRaw || 'pending'} 
                              onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                              className="text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-blue-600 cursor-pointer"
                            >
                              <option value="pending">Pendiente</option>
                              <option value="contacted">Contactado</option>
                              <option value="closed">Cerrado</option>
                            </select>
                          </div>
                          <a 
                            href={`mailto:${lead.email}?subject=Consulta sobre: ${lead.property?.title || ''}`}
                            className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-600/10"
                          >
                            Responder
                          </a>
                        </div>
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

      {showPlanPicker && plansList.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowPlanPicker(false); }}>
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Elegí tu Plan</h3>
            <p className="text-slate-500 font-medium mb-8">Seleccioná el plan que mejor se adapte a tus necesidades.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plansList.map(plan => {
                const isCurrent = userPlan?.planId === plan.id;
                return (
                  <div key={plan.id} className={`p-6 rounded-2xl border-2 transition-all flex flex-col ${isCurrent ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-blue-200 bg-white'}`}>
                    <h4 className="text-lg font-black text-slate-900 uppercase mb-1">{plan.name}</h4>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-2xl font-black text-slate-900">${plan.price}</span>
                      <span className="text-xs text-slate-400 font-bold">/ año</span>
                    </div>
                    <ul className="space-y-2 mb-6 flex-1">
                      {plan.features?.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Check className="w-3 h-3 text-green-500 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      disabled={isCurrent}
                      onClick={() => openCheckout(plan)}
                      className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${
                        isCurrent
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {isCurrent ? 'Plan Actual' : 'Seleccionar'}
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setShowPlanPicker(false)}
              className="mt-6 w-full py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showCheckout && selectedPlan && (
        <CheckoutModal 
          plan={selectedPlan}
          onConfirm={(planId) => handleAssignPlan(planId)}
          onCancel={() => setShowCheckout(false)}
        />
      )}
    </Layout>
  );
}
