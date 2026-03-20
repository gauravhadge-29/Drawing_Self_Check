import React from 'react';
import { 
  Puzzle, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FileSearch
} from 'lucide-react';
import { cn } from '../utils/utils';

export function PartValidationCard({ partValidation, loading }) {
  const parts = partValidation || [];

  return (
    <div className="panel-industrial overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-200 bg-slate-100/70">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-orange-300 shadow-sm border border-slate-700">
          <Puzzle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Part Drawing Validation</h3>
          <p className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">
            {loading ? 'Processing...' : 'BOM cross-reference'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar min-h-50">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10">
            <tr>
              <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Item</th>
              <th className="px-2 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Description</th>
              <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {parts.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileSearch className="w-8 h-8 text-slate-300" />
                    <span className="text-xs text-slate-500 italic">No part data available</span>
                  </div>
                </td>
              </tr>
            ) : (
              parts.map((p, i) => {
                const status = getStatusConfig(p.status);
                return (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-5 py-3 text-xs font-medium text-slate-600 group-hover:text-slate-900">{p.item}</td>
                    <td className="px-2 py-3 text-xs font-bold text-slate-700 truncate max-w-30" title={p.description}>
                      {p.description}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all",
                        status.bg,
                        status.color,
                        status.border
                      )}>
                        <status.icon className="w-3 h-3" />
                        {status.label}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getStatusConfig(status) {
  switch (status) {
    case 'PASS':
      return { label: 'FOUND', icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" };
    case 'FAIL':
      return { label: 'MISSING', icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" };
    case 'WARNING':
      return { label: 'EXTRA', icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" };
    default:
      return { label: 'UNKNOWN', icon: FileSearch, color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-100" };
  }
}
