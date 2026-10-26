import React, { useState } from 'react';
import { Calendar, CheckCircle2, AlertCircle, RefreshCw, PauseCircle, PlayCircle } from 'lucide-react';
import { api } from '../../api/api'; // 👈 Ajustá la ruta si es necesario (ej: "@/api/api")
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../hooks/useToast'; // 👈 Ajustá la ruta si es necesario

export default function PlanStatusCard({ plan, usage, limit, expiresAt, onUpgrade, isAutoRenew, isFreePlan }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  if (!plan) return null;

  const percentage = Math.min((usage / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const expiry = expiresAt !== undefined ? expiresAt : plan.expiryDate;
  const isExpired = expiry && new Date(expiry) < new Date();

  const handleToggleAutoRenew = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const res = await api.patch('/subscriptions/toggle-auto-renew');
      
      // Refrescamos los datos del usuario para que la tarjeta se actualice
      queryClient.invalidateQueries({ queryKey: ['auth_me'] }); // Ajustá la queryKey según tu proyecto
      queryClient.invalidateQueries({ queryKey: ['userPlan'] });
      
      toast.success(res.message || "Preferencia de renovación actualizada");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "No se pudo actualizar la renovación automática");
    } finally {
      setLoading(false);
    }
  };

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

        {/* 👇 SECCIÓN DE RENOVACIÓN AUTOMÁTICA */}
        {!isFreePlan && (
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
            <div className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${isAutoRenew ? 'text-green-500' : 'text-slate-400'}`} />
              <div>
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Renovación Automática</p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {isAutoRenew ? 'Activada' : 'Pausada'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleToggleAutoRenew}
              disabled={loading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                isAutoRenew 
                  ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' 
                  : 'text-green-600 bg-green-50 hover:bg-green-100'
              } disabled:opacity-50`}
            >
              {loading ? (
                <span className="animate-spin text-lg leading-none">↻</span>
              ) : isAutoRenew ? (
                <><PauseCircle className="w-3.5 h-3.5" /> Pausar</>
              ) : (
                <><PlayCircle className="w-3.5 h-3.5" /> Reactivar</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
