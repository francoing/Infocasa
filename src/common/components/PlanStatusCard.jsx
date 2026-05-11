import React from 'react';
import { Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PlanStatusCard({ plan, usage, limit }) {
  if (!plan) return null;

  const percentage = Math.min((usage / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isExpired = plan.expiryDate && new Date(plan.expiryDate) < new Date();

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

      <div className="flex items-center gap-2 text-xs font-medium text-slate-400 pt-2 border-t border-slate-50">
        <Calendar className="w-4 h-4" />
        <span>{plan.expiryDate ? `Vence el ${new Date(plan.expiryDate).toLocaleDateString()}` : 'Plan Vitalicio'}</span>
      </div>
    </div>
  );
}
