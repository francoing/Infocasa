import React, { useEffect, useState } from "react";
import { User, Mail, Shield, CreditCard, Check, Crown, Loader2, Calendar } from "lucide-react";
import Layout from "../../../common/components/Layout";
import { useAuth } from "../../../hooks/useAuth";
import { usePlans } from "../../../hooks/usePlans";
import PlanBadge from "../../../common/components/PlanBadge";
import CheckoutModal from "../../dashboard/components/CheckoutModal";

export default function ProfilePage() {
  const { user } = useAuth();
  const { getPlans, getUserPlan, assignPlan } = usePlans();
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allPlans, myPlan] = await Promise.all([
          getPlans(),
          getUserPlan(user.id)
        ]);
        setPlans(allPlans);
        setCurrentPlan(myPlan);
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user, getPlans, getUserPlan]);

  const handleUpgrade = async (planId) => {
    try {
      await assignPlan(user.id, planId);
      const updatedPlan = await getUserPlan(user.id);
      setCurrentPlan(updatedPlan);
      setShowCheckout(null);
    } catch (err) {
      alert("Error al actualizar el plan.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* User Info Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-32 h-32 rounded-[2rem] bg-blue-600 flex items-center justify-center text-white text-4xl font-black mb-4 overflow-hidden border-4 border-white shadow-xl shadow-blue-600/20">
                  {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user?.name.charAt(0)}
                </div>
                <h2 className="text-2xl font-black text-slate-900">{user?.name}</h2>
                <div className="mt-2">
                  <PlanBadge planName={currentPlan?.details?.name || 'Básico'} />
                </div>
              </div>

              <div className="space-y-4">
                <InfoItem icon={<Mail />} label="Email" value={user?.email} />
                <InfoItem icon={<Shield />} label="Rol" value={user?.role} />
                {currentPlan && (
                  <InfoItem 
                    icon={<Calendar />} 
                    label="Vencimiento Plan" 
                    value={currentPlan.expiryDate ? new Date(currentPlan.expiryDate).toLocaleDateString() : 'Permanente'} 
                  />
                )}
              </div>

              <button className="w-full mt-8 py-4 rounded-2xl border-2 border-slate-100 font-bold text-slate-400 hover:border-blue-600 hover:text-blue-600 transition-all">
                Editar Perfil
              </button>
            </div>
          </div>

          {/* Plans Section */}
          <div className="lg:col-span-8">
            <div className="mb-10">
              <h1 className="text-3xl font-black text-slate-900 mb-2">Planes Disponibles</h1>
              <p className="text-slate-500 font-medium">Potencia tus ventas eligiendo el plan que mejor se adapte a tus necesidades.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map(plan => {
                const isCurrent = currentPlan?.planId === plan.id;
                return (
                  <div 
                    key={plan.id}
                    className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col ${isCurrent ? 'border-blue-600 bg-blue-50/30' : 'border-slate-100 bg-white hover:border-blue-200'}`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-black text-slate-900">${plan.price}</span>
                          <span className="text-slate-400 font-bold text-sm">/ año</span>
                        </div>
                      </div>
                      {plan.id === 'premium' && (
                        <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20">
                          <Crown className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <ul className="space-y-4 mb-8 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <div className="p-1 bg-green-100 text-green-600 rounded-lg">
                            <Check className="w-3 h-3" />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button 
                      disabled={isCurrent}
                      onClick={() => setShowCheckout(plan)}
                      className={`w-full py-4 rounded-2xl font-black transition-all ${isCurrent ? 'bg-green-100 text-green-600 cursor-default' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10 active:scale-[0.98]'}`}
                    >
                      {isCurrent ? 'Plan Actual' : 'Contratar Ahora'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {showCheckout && (
        <CheckoutModal 
          plan={showCheckout}
          onConfirm={handleUpgrade}
          onCancel={() => setShowCheckout(null)}
        />
      )}
    </Layout>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="p-2 bg-white text-slate-400 rounded-xl border border-slate-100">
        {React.cloneElement(icon, { className: "w-4 h-4" })}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-slate-900 truncate">{value || 'No especificado'}</p>
      </div>
    </div>
  );
}
