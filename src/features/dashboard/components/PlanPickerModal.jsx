import React from "react";
import { Check } from "lucide-react";

/** Modal de selección de plan (upgrade de suscripción). */
export default function PlanPickerModal({ plans, userPlan, onChoose, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8">
        <h3 className="text-2xl font-black text-slate-900 mb-2">Elegí tu Plan</h3>
        <p className="text-slate-500 font-medium mb-8">Seleccioná el plan que mejor se adapte a tus necesidades.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrent = userPlan?.planId === plan.id;
            return (
              <div key={plan.id} className={`p-6 rounded-2xl border-2 transition-all flex flex-col ${isCurrent ? "border-blue-600 bg-blue-50/50" : "border-slate-100 hover:border-blue-200 bg-white"}`}>
                <h4 className="text-lg font-black text-slate-900 uppercase mb-1">{plan.name}</h4>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-black text-slate-900">${plan.price}</span>
                  <span className="text-xs text-slate-400 font-bold">/ año</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features?.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Check className="w-3 h-3 text-green-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={isCurrent}
                  onClick={() => onChoose(plan)}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${isCurrent ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                >
                  {isCurrent ? "Plan Actual" : "Seleccionar"}
                </button>
              </div>
            );
          })}
        </div>
        <button onClick={onClose} className="mt-6 w-full py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  );
}
