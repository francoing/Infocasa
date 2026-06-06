import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePlans } from '@/hooks/usePlans';
import { useToast } from '@/hooks/useToast';
import Layout from '@/common/components/Layout';
import CheckoutModal from '@/features/dashboard/components/CheckoutModal';
import { Camera, Save, Lock, User as UserIcon, Phone, Loader2, Crown, Zap, Star, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, updatePassword, updateAvatar } = useAuth();
  const { usePlansQuery, assignPlan } = usePlans();
  const { data: plansList = [] } = usePlansQuery();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState(null);

  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);

  // Perfil
  const [infoForm, setInfoForm] = useState({
    name: user?.name || '',
    phone_area: user?.phone_area || '',
    phone_number: user?.phone_number || '',
  });

  // Password
  const [passForm, setPassForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setLoadingInfo(true);
    try {
      await updateProfile(infoForm);
      toast.success('Perfil actualizado correctamente.');
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        Object.values(err.data.errors).forEach((messages) => {
          messages.forEach((msg) => toast.error(msg));
        });
      } else {
        toast.error('Error al actualizar el perfil.');
      }
    } finally {
      setLoadingInfo(false);
    }
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    setLoadingPass(true);
    try {
      await updatePassword(passForm);
      toast.success('Contraseña actualizada correctamente.');
      setPassForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        Object.values(err.data.errors).forEach((messages) => {
          messages.forEach((msg) => toast.error(msg));
        });
      } else {
        toast.error('Error al actualizar la contraseña.');
      }
    } finally {
      setLoadingPass(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona una imagen válida.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setLoadingAvatar(true);
    try {
      await updateAvatar(formData);
      toast.success('Avatar actualizado correctamente.');
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        Object.values(err.data.errors).forEach((messages) => {
          messages.forEach((msg) => toast.error(msg));
        });
      } else {
        toast.error('Error al subir el avatar.');
      }
    } finally {
      setLoadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const handleAssignPlan = async (planId) => {
    try {
      await assignPlan(planId);
      toast.success("¡Plan activado con éxito!");
      setShowCheckout(false);
      // Actualizamos al usuario
      window.location.reload(); 
    } catch (err) {
      toast.error(err.message || "Error al activar el plan");
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Mi Perfil</h1>
          <p className="text-slate-500 mt-2">Gestiona tu información personal, seguridad y suscripción.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <div className="md:col-span-1">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black text-slate-300 tracking-widest">
                      {getUserInitials(user?.name)}
                    </span>
                  )}
                  {loadingAvatar && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loadingAvatar}
                  className="absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">{user?.name}</h3>
              <p className="text-slate-500 text-sm font-medium">{user?.email}</p>
              <div className="mt-4 px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest rounded-full">
                {user?.role === 'owner' ? 'Dueño' : user?.role === 'agent' ? 'Agente' : 'Comprador'}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            {/* Mi Suscripción - Interfaz de Planes */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl">
                    <Crown className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Mi Suscripción y Planes</h2>
                </div>
                {user?.subscription?.plan && (
                  <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Plan Actual:</span>
                    <span className="text-sm font-black text-blue-600 uppercase">{user.subscription.plan.name}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {plansList.map(plan => {
                  const isCurrentPlan = user?.subscription?.plan?.id === plan.id;
                  const isPopular = plan.name?.toLowerCase() === 'premium';

                  return (
                    <div 
                      key={plan.id} 
                      className={`relative flex flex-col p-6 rounded-3xl border-2 transition-all ${
                        isCurrentPlan 
                          ? 'border-blue-600 bg-blue-50/50 shadow-md' 
                          : isPopular 
                            ? 'border-amber-400 shadow-lg scale-[1.02] bg-white' 
                            : 'border-slate-100 bg-white hover:border-blue-200'
                      }`}
                    >
                      {isPopular && !isCurrentPlan && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full shadow-sm">
                          Más Elegido
                        </div>
                      )}
                      {isCurrentPlan && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full shadow-sm">
                          Tu Plan
                        </div>
                      )}

                      <h3 className="text-xl font-black text-slate-900 mb-2">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-3xl font-black text-slate-900">${plan.price}</span>
                        <span className="text-slate-500 font-bold text-sm">/año</span>
                      </div>

                      <div className="flex-1 space-y-3 mb-8">
                        {plan.features?.map((feature, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                            <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isCurrentPlan || isPopular ? 'text-blue-600' : 'text-slate-400'}`} />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        disabled={isCurrentPlan}
                        onClick={() => {
                          setSelectedPlanToBuy(plan);
                          setShowCheckout(true);
                        }}
                        className={`w-full py-3 rounded-xl font-bold transition-all shadow-sm ${
                          isCurrentPlan 
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : isPopular
                              ? 'bg-amber-400 text-amber-950 hover:bg-amber-500'
                              : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        {isCurrentPlan ? 'Plan Seleccionado' : 'Elegir Plan'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Información Personal */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
                  <UserIcon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Información Personal</h2>
              </div>
              <form onSubmit={handleInfoSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nombre completo</label>
                  <input
                    type="text"
                    required
                    value={infoForm.name}
                    onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Cód. Área</label>
                    <input
                      type="text"
                      value={infoForm.phone_area}
                      onChange={(e) => setInfoForm({ ...infoForm, phone_area: e.target.value })}
                      placeholder="Ej: 11"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Teléfono / Celular</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={infoForm.phone_number}
                        onChange={(e) => setInfoForm({ ...infoForm, phone_number: e.target.value })}
                        placeholder="Ej: 12345678"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={loadingInfo}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loadingInfo ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>

            {/* Seguridad / Contraseña */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Seguridad y Contraseña</h2>
              </div>
              <form onSubmit={handlePassSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña Actual</label>
                  <input
                    type="password"
                    required
                    value={passForm.current_password}
                    onChange={(e) => setPassForm({ ...passForm, current_password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nueva Contraseña</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passForm.password}
                      onChange={(e) => setPassForm({ ...passForm, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Confirmar Nueva Contraseña</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passForm.password_confirmation}
                      onChange={(e) => setPassForm({ ...passForm, password_confirmation: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={loadingPass}
                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loadingPass ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Actualizar Contraseña
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showCheckout && selectedPlanToBuy && (
        <CheckoutModal 
          plan={selectedPlanToBuy}
          onConfirm={(planId) => handleAssignPlan(planId)}
          onCancel={() => setShowCheckout(false)}
        />
      )}
    </Layout>
  );
}
