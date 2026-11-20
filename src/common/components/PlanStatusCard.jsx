import React from "react";
import { Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import OneTimePaymentNote from "./OneTimePaymentNote";

/** Plan actual en el dashboard. Los planes pagos son pago único (sin renovación automática). */
export default function PlanStatusCard({ plan, usage, limit, expiresAt, onUpgrade, isFreePlan }) {
  if (!plan) return null;

  const percentage = Math.min((usage / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const expiry = expiresAt !== undefined ? expiresAt : plan.expiryDate;
  const isExpired = expiry && new Date(expiry) < new Date();

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Tu Plan Actual</h4>
          <div className="text-2xl font-black text-slate-900 uppercase">{plan.details.name}</div>
        </div>
        <div className={`p-2 rounded-xl ${isExpired ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
          {isExpired ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm font-bold">
          <span className="text-slate-600">Publicaciones</span>
          <span className={isNearLimit ? 'text-red-600' : 'text-blue-600'}>
            {usage} / {limit}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${isNearLimit ? 'bg-red-500' : 'bg-blue-600'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>{expiry ? `Vence el ${new Date(expiry).toLocaleDateString()}` : 'Plan sin vencimiento'}</span>
          </div>
          {onUpgrade && (
            <button onClick={onUpgrade} className="text-[10px] text-blue-600 font-bold uppercase tracking-widest hover:underline">
              Mejorar Plan
            </button>
          )}
        </div>

        {!isFreePlan && (
          <OneTimePaymentNote detail="Cuando venza, podés volver a contratarlo." />
        )}
      </div>
    </div>
  );
}
