import React, { useState } from "react";
import { Users, Home, Shield, Power, Trash2, CreditCard, ChevronRight, Loader2, Search, MessageSquare, Mail, Phone, Calendar, Star, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/common/components/Layout";
import PlanBadge from "@/common/components/PlanBadge";
import { useAdminData } from "@/hooks/useAdminData";

export default function AdminPage() {
  const {
    currentUser,
    plans,
    loading,
    selectedUser,
    setSelectedUser,
    userSearch,
    setUserSearch,
    propertySearch,
    setPropertySearch,
    leadSearch,
    setLeadSearch,
    filteredUsers,
    filteredProperties,
    filteredLeads,
    toggleUserStatus,
    handleAssignPlan,
    deleteProperty,
    toggleFeatured,
    usersCount,
    propertiesCount,
    leadsCount,
    subscriptionsCount
  } = useAdminData();

  const [activeTab, setActiveTab] = useState("users");

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
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Panel de Control</h1>
            <p className="text-slate-500 font-medium">Gestión integral de usuarios, propiedades y consultas.</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-2xl shadow-xl shadow-blue-600/20">
            <Shield className="w-5 h-5" />
            <span className="font-black text-sm uppercase tracking-widest">Modo SuperAdmin</span>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard icon={<Users />} count={usersCount} label="Usuarios" color="blue" />
          <StatCard icon={<Home />} count={propertiesCount} label="Propiedades" color="indigo" />
          <StatCard icon={<MessageSquare />} count={leadsCount} label="Consultas" color="green" />
          <StatCard icon={<CreditCard />} count={subscriptionsCount} label="Suscripciones" color="amber" />
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-slate-200 mb-8">
          <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")} label="Usuarios" />
          <TabButton active={activeTab === "properties"} onClick={() => setActiveTab("properties")} label="Propiedades" />
          <TabButton active={activeTab === "leads"} onClick={() => setActiveTab("leads")} label="Consultas" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className={selectedUser ? "lg:col-span-8" : "lg:col-span-12"}>
              
              {/* Search Bar */}
              <div className="mb-6 relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text"
                  placeholder={
                    activeTab === "users" ? "Buscar usuarios por nombre o email..." :
                    activeTab === "properties" ? "Buscar propiedades por título o ubicación..." :
                    "Buscar consultas por nombre, email o mensaje..."
                  }
                  value={activeTab === "users" ? userSearch : activeTab === "properties" ? propertySearch : leadSearch}
                  onChange={(e) => {
                    if (activeTab === "users") setUserSearch(e.target.value);
                    else if (activeTab === "properties") setPropertySearch(e.target.value);
                    else setLeadSearch(e.target.value);
                  }}
                  className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[2rem] shadow-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium"
                />
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                {activeTab === "users" ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200">
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Usuario</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Plan</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Estado</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-sm uppercase overflow-hidden border border-blue-200">
                                {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{u.name}</div>
                                <div className="text-xs font-medium text-slate-400">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <PlanBadge planName={u.currentPlan} />
                          </td>
                          <td className="px-8 py-5">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-tighter ${u.active ? 'text-green-600' : 'text-red-500'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-green-600' : 'bg-red-500'}`} />
                              {u.active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right space-x-2">
                            {u.role !== 'admin' && (
                              <button 
                                onClick={() => setSelectedUser(u)}
                                className="p-3 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-xl transition-all"
                                title="Cambiar Plan"
                              >
                                <CreditCard className="w-5 h-5" />
                              </button>
                            )}
                            {u.id !== currentUser?.id && (
                              <button 
                                onClick={() => toggleUserStatus(u.id, u.active)}
                                className={`p-3 rounded-xl transition-all ${u.active ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-green-600 hover:bg-green-50'}`}
                                title="Cambiar Estado"
                              >
                                <Power className="w-5 h-5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : activeTab === "properties" ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200">
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Propiedad</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ubicación</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Precio</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProperties.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-8 py-5">
                            <div className="font-bold text-slate-900">{p.title}</div>
                            <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">{p.status}</div>
                          </td>
                          <td className="px-8 py-5 text-sm font-bold text-slate-500">{p.location}</td>
                          <td className="px-8 py-5 text-sm font-black text-slate-900">USD {p.price.toLocaleString()}</td>
                          <td className="px-8 py-5 text-right flex justify-end gap-2">
                             <button 
                               onClick={() => toggleFeatured(p.id, p.featured)} 
                               className={`p-3 rounded-xl transition-all ${p.featured ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}
                               title={p.featured ? "Quitar destacado" : "Destacar"}
                             >
                               <Star className="w-5 h-5" fill={p.featured ? "currentColor" : "none"} />
                             </button>
                             <Link 
                               to={`/dashboard/properties/edit/${p.id}`} 
                               className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                               title="Editar propiedad"
                             >
                               <Edit className="w-5 h-5" />
                             </Link>
                             <button onClick={() => handleDeletePropertyConfirm(p.id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                               <Trash2 className="w-5 h-5" />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200">
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Interesado</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mensaje</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fecha</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLeads.map(l => (
                        <tr key={l.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-8 py-5">
                            <div className="font-bold text-slate-900">{l.name}</div>
                            <div className="flex flex-col gap-0.5 mt-1">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                <Mail className="w-3 h-3" /> {l.email}
                              </div>
                              {l.phone && (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                  <Phone className="w-3 h-3" /> {l.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="max-w-xs text-sm font-medium text-slate-600 line-clamp-2">
                              {l.message}
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(l.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                               <ChevronRight className="w-5 h-5" />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Plan Selector Sidebar */}
            {selectedUser && activeTab === "users" && (
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-blue-200 shadow-2xl shadow-blue-600/5 sticky top-28">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Asignar Plan</h3>
                    <button onClick={() => setSelectedUser(null)} className="p-2 text-slate-400 hover:text-slate-600"><XIcon /></button>
                  </div>
                  
                  <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Usuario seleccionado</p>
                    <p className="font-black text-lg text-slate-900">{selectedUser.name}</p>
                    <p className="text-sm font-medium text-slate-500">{selectedUser.email}</p>
                  </div>

                  <div className="space-y-3">
                    {plans.map(plan => (
                      <button 
                        key={plan.id}
                        onClick={() => handleAssignPlan(selectedUser.id, plan.id)}
                        className={`w-full p-5 rounded-2xl border-2 transition-all text-left group flex justify-between items-center ${selectedUser.currentPlan === plan.name ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-200 bg-white'}`}
                      >
                        <div>
                          <p className="font-black text-slate-900 uppercase text-xs tracking-widest">{plan.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">Límite: {plan.limit} propiedades</p>
                        </div>
                        <ChevronRight className={`w-5 h-5 ${selectedUser.currentPlan === plan.name ? 'text-blue-600' : 'text-slate-300 group-hover:text-blue-400'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

function StatCard({ icon, count, label, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    green: "bg-green-50 text-green-600 border-green-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100"
  };
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-6 transition-all hover:shadow-md hover:-translate-y-1">
      <div className={`p-4 rounded-2xl border ${colors[color]}`}>
        {React.cloneElement(icon, { className: "w-8 h-8" })}
      </div>
      <div>
        <div className="text-3xl font-black text-slate-900 tracking-tighter">{count}</div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button 
      onClick={onClick}
      className={`pb-4 font-black text-sm uppercase tracking-widest transition-all relative ${active ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
    >
      {label}
      {active && <span className="absolute bottom-0 left-0 w-full h-1.5 bg-blue-600 rounded-t-full"></span>}
    </button>
  );
}

function XIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
}
