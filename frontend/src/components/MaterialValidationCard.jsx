import React from 'react';
import { 
  Beaker, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../utils/utils';

export function MaterialValidationCard({ materialValidation, loading }) {
  const material = materialValidation?.material || 'NOT FOUND';
  const allowedFinishes = materialValidation?.allowed_finishes || [];
  const partFinishes = materialValidation?.part_finishes || [];
  
  const statusConfig = {
    PASS: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
    FAIL: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
    UNKNOWN: { icon: AlertCircle, color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-100" },
  };

  const normalizeToken = (value) =>
    (value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

  const getPartStatus = (entryFinish) => {
    if (!entryFinish) return 'FAIL';
    if (!allowedFinishes.length) return 'UNKNOWN';

    const normalizedFinish = normalizeToken(entryFinish);
    const isAllowed = allowedFinishes.some((finish) => normalizeToken(finish) === normalizedFinish);
    return isAllowed ? 'PASS' : 'FAIL';
  };

  return (
    <div className="panel-industrial overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-200 bg-slate-100/70">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-orange-300 shadow-sm border border-slate-700">
          <Beaker className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Material Compliance</h3>
          <p className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">
            {loading ? 'Processing...' : 'Surface finish policy'}
          </p>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="max-h-80 min-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-1">
          {partFinishes.length === 0 ? (
            <div className="px-3 py-3 text-xs text-slate-500 italic">No per-part finish information found in PDF text.</div>
          ) : (
            partFinishes.map((entry, idx) => {
              const partStatus = getPartStatus(entry.surface_finish);
              const partStatusStyle = statusConfig[partStatus] || statusConfig.UNKNOWN;

              return (
                <div
                  key={`${entry.part_number || 'part'}-${idx}`}
                  className="bg-white border border-slate-200 rounded-lg p-3 space-y-2"
                >
                  <InfoRow label="Part" value={entry.part_number || '-'} />
                  <InfoRow label="Material" value={material || 'NOT FOUND'} />
                  <InfoRow label="Surface Finish" value={entry.surface_finish || 'MISSING'} />
                  <InfoRow label="Page" value={entry.page || '-'} />

                  <div className="flex items-center justify-between py-1 border-t border-slate-200 pt-2">
                    <span className="text-xs font-medium text-slate-500">Status</span>
                    <div className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border",
                      partStatusStyle.bg,
                      partStatusStyle.color,
                      partStatusStyle.border
                    )}>
                      <partStatusStyle.icon className="w-3.5 h-3.5" />
                      {partStatus}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <ShieldCheck className="w-3 h-3 text-slate-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Allowed Finishes</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {allowedFinishes.length > 0 ? (
                        allowedFinishes.map((finish) => (
                          <span key={`${entry.part_number || idx}-${finish}`} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md border border-slate-200">
                            {finish}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs italic text-slate-500">None defined</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{value}</span>
    </div>
  );
}
