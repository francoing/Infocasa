import React from 'react';
import { Calendar, CreditCard, AlertCircle } from 'lucide-react';
import { ONE_TIME_PAYMENT_TEXT } from '@/common/components/OneTimePaymentNote';

/** Estado de la suscripción en el perfil. Los planes pagos son pago único: no hay renovación automática. */
export default function SubscriptionStatusCard({ user }) {
  const subscription = user?.subscription;
  if (!subscription || !subscription.active) return null;

  const isFreePlan = Number(subscription.plan?.price) === 0;
  const expiresAt = subscription.end_date;

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
            {isFreePlan ? <AlertCircle className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
              {isFreePlan ? 'Plan Gratuito' : 'Pago único'}
            </p>
            <p className="text-sm font-bold text-slate-800">
              {isFreePlan ? 'Sin costo' : ONE_TIME_PAYMENT_TEXT}
            </p>
            {!isFreePlan && (
              <p className="text-xs font-medium text-slate-500">
                Cuando venza, podés volver a contratarlo desde esta página.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 w-full md:w-auto justify-start md:justify-end">
          <Calendar className="w-4 h-4" />
          <span>{expiresAt ? `Vence el ${new Date(expiresAt).toLocaleDateString()}` : 'Sin vencimiento'}</span>
        </div>
      </div>
    </div>
  );
}
