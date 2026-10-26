import React from 'react';
import { Calendar, RefreshCw, PauseCircle, PlayCircle, AlertCircle } from 'lucide-react';
import { useToggleAutoRenew } from '@/hooks/useQrStats';
import { useToast } from '@/hooks/useToast';

export default function SubscriptionStatusCard({ user }) {
  const toast = useToast();
  const { mutate: toggleAutoRenew, isPending: loading } = useToggleAutoRenew();

  const subscription = user?.subscription;
  if (!subscription || !subscription.active) return null;

  const isFreePlan = Number(subscription.plan?.price) === 0;
  const autoRenew = subscription.auto_renew ?? false;
  const expiresAt = subscription.end_date;

  const handleToggleAutoRenew = () => {
    toggleAutoRenew(undefined, {
      onSuccess: (res) => {
        toast.success(res.message || "Preferencia de renovación actualizada");
      },
      onError: (err) => {
        console.error(err);
        toast.error(err.message || "No se pudo actualizar la renovación automática");
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900">Tu Suscripción Actual</h3>
          <p className="text-sm text-slate-500 font-medium">
            Estás en el plan <span className="font-bold text-slate-800">{subscription.plan?.name}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isFreePlan ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
            {isFreePlan ? <AlertCircle className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
              {isFreePlan ? 'Plan Gratuito' : 'Renovación Automática'}
            </p>
            <p className="text-sm font-bold text-slate-800">
              {isFreePlan 
                ? 'Sin fecha de vencimiento' 
                : autoRenew 
                  ? 'Activada' 
                  : 'Pausada'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Calendar className="w-4 h-4" />
            <span>{expiresAt ? `Vence el ${new Date(expiresAt).toLocaleDateString()}` : 'Sin vencimiento'}</span>
          </div>

          {!isFreePlan && (
            <button
              onClick={handleToggleAutoRenew}
              disabled={loading}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                autoRenew 
                  ? 'text-amber-600 bg-amber-100 hover:bg-amber-200' 
                  : 'text-green-600 bg-green-100 hover:bg-green-200'
              } disabled:opacity-50`}
            >
              {loading ? (
                <span className="animate-spin text-lg leading-none">↻</span>
              ) : autoRenew ? (
                <><PauseCircle className="w-4 h-4" /> Pausar Renovación</>
              ) : (
                <><PlayCircle className="w-4 h-4" /> Reactivar Renovación</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
