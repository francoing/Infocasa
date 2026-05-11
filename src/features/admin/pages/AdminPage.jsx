import React, { useEffect, useState } from "react";
import { Users, Home, BarChart3, Shield, Power, Trash2, CreditCard, ChevronRight, Loader2 } from "lucide-react";
import Layout from "../../../common/components/Layout";
import { api } from "../../../api/api";
import { useAuth } from "../../../hooks/useAuth";
import { usePlans } from "../../../hooks/usePlans";
import PlanBadge from "../../../common/components/PlanBadge";

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const { getPlans, assignPlan } = usePlans();
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allUsers, allProps, allPlans] = await Promise.all([
          api.get("/users"),
          api.get("/properties"),
          getPlans()
        ]);

        // Enriquecer usuarios con sus planes activos
        const usersWithPlans = await Promise.all(allUsers.map(async (u) => {
          const userPlans = await api.get(`/userPlans?userId=${u.id}&active=true`);
          if (userPlans.length > 0) {
            const planDetails = allPlans.find(p => p.id === userPlans[0].planId);
            return { ...u, currentPlan: planDetails?.name || 'Ninguno' };
          }
          return { ...u, currentPlan: 'Ninguno' };
        }));

        setUsers(usersWithPlans);
        setProperties(allProps);
        setPlans(allPlans);
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getPlans]);

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/users/${userId}`, { active: !currentStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, active: !currentStatus } : u));
    } catch (err) {
      alert("Error al actualizar estado del usuario.");
    }
  };

  const handleAssignPlan = async (userId, planId) => {
    try {
      await assignPlan(userId, planId);
      const planName = plans.find(p => p.id === planId).name;
      setUsers(users.map(u => u.id === userId ? { ...u, currentPlan: planName } : u));
      setSelectedUser(null);
      alert("Plan asignado correctamente.");
    } catch (err) {
      alert("Error al asignar plan.");
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Administración Central</h1>
            <p className="text-slate-500">Panel de control global para gestión de plataforma.</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-blue-600 text-sm">Modo SuperAdmin</span>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard icon={<Users />} count={users.length} label="Usuarios Totales" color="blue" />
          <StatCard icon={<Home />} count={properties.length} label="Propiedades Activas" color="indigo" />
          <StatCard icon={<CreditCard />} count={users.filter(u => u.currentPlan !== 'Básico' && u.currentPlan !== 'Ninguno').length} label="Suscripciones Premium" color="green" />
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-slate-200 mb-8">
          <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")} label="Gestión de Usuarios" />
          <TabButton active={activeTab === "properties"} onClick={() => setActiveTab("properties")} label="Gestión de Propiedades" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className={selectedUser ? "lg:col-span-8" : "lg:col-span-12"}>
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                {activeTab === "users" ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Usuario</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Plan Actual</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Estado</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase overflow-hidden">
                                {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{u.name}</div>
                                <div className="text-xs text-slate-400">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <PlanBadge planName={u.currentPlan} />
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${u.active ? 'text-green-600' : 'text-red-500'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-green-600' : 'bg-red-500'}`} />
                              {u.active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            {u.role !== 'admin' && (
                              <button 
                                onClick={() => setSelectedUser(u)}
                                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Cambiar Plan"
                              >
                                <CreditCard className="w-5 h-5" />
                              </button>
                            )}
                            {u.id !== currentUser.id && (
                              <button 
                                onClick={() => toggleUserStatus(u.id, u.active)}
                                className={`p-2 rounded-lg transition-colors ${u.active ? 'text-slate-400 hover:text-red-600' : 'text-slate-400 hover:text-green-600'}`}
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
                ) : (
                  <table className="w-full text-left border-collapse">
                    {/* ... Tabla de propiedades (se mantiene igual) ... */}
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Propiedad</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ubicación</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Precio</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {properties.map(p => (
                        <tr key={p.id}>
                          <td className="px-6 py-4 font-bold text-slate-900">{p.title}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{p.location}</td>
                          <td className="px-6 py-4 text-sm font-bold text-blue-600">${p.price.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                             <button className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Plan Selector Sidebar */}
            {selectedUser && (
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-blue-200 shadow-xl shadow-blue-600/5 sticky top-28">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Asignar Plan</h3>
                    <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600"><XIcon /></button>
                  </div>
                  
                  <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Usuario seleccionado</p>
                    <p className="font-bold text-slate-900">{selectedUser.name}</p>
                    <p className="text-sm text-slate-500">{selectedUser.email}</p>
                  </div>

                  <div className="space-y-3">
                    {plans.map(plan => (
                      <button 
                        key={plan.id}
                        onClick={() => handleAssignPlan(selectedUser.id, plan.id)}
                        className={`w-full p-4 rounded-2xl border transition-all text-left group flex justify-between items-center ${selectedUser.currentPlan === plan.name ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-200'}`}
                      >
                        <div>
                          <p className="font-bold text-slate-900">{plan.name}</p>
                          <p className="text-xs text-slate-500">{plan.propertyLimit} propiedades</p>
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
    green: "bg-green-50 text-green-600 border-green-100"
  };
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6 transition-all hover:shadow-md hover:-translate-y-1">
      <div className={`p-4 rounded-2xl border ${colors[color]}`}>
        {React.cloneElement(icon, { className: "w-8 h-8" })}
      </div>
      <div>
        <div className="text-3xl font-bold text-slate-900">{count}</div>
        <div className="text-sm font-medium text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button 
      onClick={onClick}
      className={`pb-4 font-bold transition-all relative ${active ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
    >
      {label}
      {active && <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></span>}
    </button>
  );
}

function XIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
}
