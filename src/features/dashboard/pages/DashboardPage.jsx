import React, { useEffect, useState } from "react";
import { LayoutDashboard, Home, MessageSquare, Plus, Edit, Trash2, ExternalLink, Loader2, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../../../common/components/Layout";
import { useAuth } from "../../../hooks/useAuth";
import { usePlans } from "../../../hooks/usePlans";
import { api } from "../../../api/api";
import PlanStatusCard from "../../../common/components/PlanStatusCard";

export default function DashboardPage() {
  const { user } = useAuth();
  const { getUserPlan } = usePlans();
  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [userPlan, setUserPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("properties");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Obtener plan del usuario
        const plan = await getUserPlan(user.id);
        setUserPlan(plan);

        // Obtener propiedades del usuario
        const myProps = await api.get(`/properties?userId=${user.id}`);
        setProperties(myProps);

        // Obtener consultas para sus propiedades
        const myLeads = await api.get(`/leads?publisherId=${user.id}`);
        setLeads(myLeads);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, getUserPlan]);

  const handleDeleteProperty = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta propiedad?")) {
      try {
        await api.delete(`/properties/${id}`);
        setProperties(properties.filter(p => p.id !== id));
      } catch (err) {
        alert("Error al eliminar la propiedad.");
      }
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
                limit={userPlan.details.propertyLimit} 
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
                    <div key={prop.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-center gap-6 hover:shadow-lg transition-all">
                      <div className="w-full md:w-32 h-24 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={prop.imageUrl} alt={prop.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 text-lg">{prop.title}</h3>
                        <p className="text-slate-500 text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {prop.location}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded-md uppercase text-slate-600">{prop.type}</span>
                          <span className="text-xs font-bold px-2 py-1 bg-blue-50 rounded-md uppercase text-blue-600">{prop.status}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/property/${prop.id}`} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                          <ExternalLink className="w-5 h-5" />
                        </Link>
                        <Link to={`/dashboard/properties/edit/${prop.id}`} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteProperty(prop.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
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
    </Layout>
  );
}
