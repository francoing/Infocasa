import React from 'react';

export default function PlanBadge({ planName }) {
  const styles = {
    'Básico': 'bg-slate-100 text-slate-600 border-slate-200',
    'Premium': 'bg-blue-100 text-blue-600 border-blue-200',
    'Enterprise': 'bg-purple-100 text-purple-600 border-purple-200'
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[planName] || styles['Básico']}`}>
      {planName}
    </span>
  );
}
