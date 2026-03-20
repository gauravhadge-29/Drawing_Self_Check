import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Loader2 
} from 'lucide-react';
import { cn } from '../utils/utils';

export function SummaryCards({ summary, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  const pass = summary?.pass ?? 0;
  const fail = summary?.fail ?? 0;
  const total = pass + fail;

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <MetricCard
        label="Total Items"
        value={total}
        icon={Layers}
        color="blue"
      />
      <MetricCard
        label="Passed"
        value={pass}
        icon={CheckCircle2}
        color="green"
      />
      <MetricCard
        label="Failed"
        value={fail}
        icon={XCircle}
        color="red"
      />
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color }) {
  const colorClasses = {
    blue: "bg-white text-slate-900 border-slate-200",
    green: "bg-white text-slate-900 border-emerald-200",
    red: "bg-white text-slate-900 border-red-200",
  };

  const iconClasses = {
    blue: "bg-slate-100 text-primary",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className={cn(
      "p-4 rounded-2xl border transition-all duration-200 hover:shadow-xl hover:-translate-y-1 group",
      colorClasses[color]
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className={cn("p-2 rounded-xl transition-colors", iconClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-2xl font-bold tracking-tight">{value}</span>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
}
