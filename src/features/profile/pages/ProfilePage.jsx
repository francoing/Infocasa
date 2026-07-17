import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePlans } from '@/hooks/usePlans';
import { useToast } from '@/hooks/useToast';
import { useMercadoPagoReturn } from '@/hooks/useMercadoPagoReturn';
import { createAgency, updateAgency } from '@/hooks/useAgencies';
import Layout from '@/common/components/Layout';
import CheckoutModal from '@/features/dashboard/components/CheckoutModal';
import ProfileAvatarCard from '../components/ProfileAvatarCard';
import SubscriptionPlans from '../components/SubscriptionPlans';
import PersonalInfoForm from '../components/PersonalInfoForm';
import AgencyForm from '../components/AgencyForm';
import PasswordForm from '../components/PasswordForm';

// Desglosa los errores 422 del backend en toasts; devuelve true si los manejó.
const showValidationErrors = (err, toast) => {
  if (err.status === 422 && err.data?.errors) {
    Object.values(err.data.errors).forEach((messages) => messages.forEach((msg) => toast.error(msg)));
    return true;
  }
  return false;
};

export default function ProfilePage() {
  const { user, updateProfile, updatePassword, updateAvatar, refreshUser } = useAuth();
  const { usePlansQuery, assignPlan, payWithMercadoPago, verifyMercadoPagoPayment } = usePlans();
  const { data: plansList = [] } = usePlansQuery();
  const toast = useToast();

  // Al volver del checkout de MP, verificar el pago y activar la suscripción.
  useMercadoPagoReturn(verifyMercadoPagoPayment);

  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState(null);

  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [loadingAgency, setLoadingAgency] = useState(false);

  const [infoForm, setInfoForm] = useState({
    name: user?.name || '',
    phone_area: user?.phone_area || '',
    phone_number: user?.phone_number || '',
  });

  const [agencyForm, setAgencyForm] = useState({
    name: user?.agency?.name || '',
    cuit: user?.agency?.cuit || '',
    fantasy_name: user?.agency?.fantasy_name || '',
    tax_condition: user?.agency?.tax_condition || '',
    business_name: user?.agency?.business_name || '',
    address: user?.agency?.address || '',
  });

  const [passForm, setPassForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    if (user?.agency) {
      setAgencyForm({
        name: user.agency.name || '',
        cuit: user.agency.cuit || '',
        fantasy_name: user.agency.fantasy_name || '',
        tax_condition: user.agency.tax_condition || '',
        business_name: user.agency.business_name || '',
        address: user.agency.address || '',
      });
    }
  }, [user]);

  const handleAgencySubmit = async (e) => {
    e.preventDefault();
    setLoadingAgency(true);
    try {
      if (user?.agency?.id) {
        await updateAgency(user.agency.id, agencyForm);
        toast.success('Información de la inmobiliaria actualizada correctamente.');
      } else {
        await createAgency(agencyForm);
        toast.success('Inmobiliaria registrada correctamente.');
      }
      await refreshUser();
    } catch (err) {
      if (!showValidationErrors(err, toast)) toast.error('Error al guardar la información de la inmobiliaria.');
    } finally {
      setLoadingAgency(false);
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setLoadingInfo(true);
    try {
      await updateProfile(infoForm);
      toast.success('Perfil actualizado correctamente.');
    } catch (err) {
      if (!showValidationErrors(err, toast)) toast.error('Error al actualizar el perfil.');
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
      if (!showValidationErrors(err, toast)) toast.error('Error al actualizar la contraseña.');
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
      if (!showValidationErrors(err, toast)) toast.error('Error al subir el avatar.');
    } finally {
      setLoadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleAssignPlan = async (plan) => {
    try {
      if (Number(plan.price) > 0) {
        const preference = await payWithMercadoPago(plan.id);
        if (preference?.redirect_url) {
          window.location.href = preference.redirect_url;
        } else {
          toast.error('No se pudo obtener la URL de pago.');
        }
      } else {
        await assignPlan(plan.id);
        toast.success('¡Plan activado con éxito!');
        setShowCheckout(false);
      }
    } catch (err) {
      toast.error(err.message || 'Error al activar el plan');
      throw err;
    }
  };

  const choosePlan = (plan) => {
    setSelectedPlanToBuy(plan);
    setShowCheckout(true);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Mi Perfil</h1>
          <p className="text-slate-500 mt-2">Gestiona tu información personal, seguridad y suscripción.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ProfileAvatarCard user={user} loadingAvatar={loadingAvatar} onAvatarChange={handleAvatarChange} />

          <div className="md:col-span-2 space-y-8">
            <SubscriptionPlans plans={plansList} user={user} onChoose={choosePlan} />
            <PersonalInfoForm form={infoForm} setForm={setInfoForm} loading={loadingInfo} onSubmit={handleInfoSubmit} />
            {user?.role === 'agent' && (
              <AgencyForm form={agencyForm} setForm={setAgencyForm} loading={loadingAgency} onSubmit={handleAgencySubmit} />
            )}
            <PasswordForm form={passForm} setForm={setPassForm} loading={loadingPass} onSubmit={handlePassSubmit} />
          </div>
        </div>
      </div>

      {showCheckout && selectedPlanToBuy && (
        <CheckoutModal
          plan={selectedPlanToBuy}
          onConfirm={() => handleAssignPlan(selectedPlanToBuy)}
          onCancel={() => setShowCheckout(false)}
        />
      )}
    </Layout>
  );
}
