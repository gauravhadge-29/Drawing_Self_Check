import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ClipboardCheck,
  Search,
  FileSearch
} from 'lucide-react';
import { cn } from '../utils/utils';

export function ValidationTable({ items, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PASS, FAIL

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter(item => {
      const matchesSearch = 
        item.item.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'ALL' || 
        item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  const itemCount = items?.length ?? 0;

  return (
    <div className="panel-industrial overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 bg-slate-100/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-orange-300 shadow-sm border border-slate-700">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Validation Results</h3>
            <p className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">
              {loading ? 'Processing...' : items ? `${itemCount} BOM items checked` : 'Ready for validation'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-600 transition-all w-full sm:w-48 shadow-sm"
            />
          </div>
          
          <div className="flex items-center bg-white border border-slate-300 rounded-lg p-1 shadow-sm">
            <button 
              onClick={() => setStatusFilter('ALL')}
              className={cn(
                "px-2 py-1 text-[10px] font-bold rounded-md transition-all",
                statusFilter === 'ALL' ? "bg-slate-800 text-slate-100" : "text-slate-500 hover:text-slate-700"
              )}
            >
              ALL
            </button>
            <button 
              onClick={() => setStatusFilter('PASS')}
              className={cn(
                "px-2 py-1 text-[10px] font-bold rounded-md transition-all",
                statusFilter === 'PASS' ? "bg-emerald-100 text-emerald-700" : "text-slate-500 hover:text-slate-700"
              )}
            >
              PASS
            </button>
            <button 
              onClick={() => setStatusFilter('FAIL')}
              className={cn(
                "px-2 py-1 text-[10px] font-bold rounded-md transition-all",
                statusFilter === 'FAIL' ? "bg-red-100 text-red-700" : "text-slate-500 hover:text-slate-700"
              )}
            >
              FAIL
            </button>
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-auto custom-scrollbar min-h-100">
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-xl border border-slate-200" />
            ))}
          </div>
        ) : !items || items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 gap-3 text-slate-500">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
              <FileSearch className="w-8 h-8 opacity-20" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">No results yet</p>
              <p className="text-xs">Upload a drawing to begin validation</p>
            </div>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <tr>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Item</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Description</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-center">Exp. Qty</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-center">Callout</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.map((row, i) => {
                const isPassed = row.status === 'PASS';
                return (
                  <tr 
                    key={row.item} 
                    className={cn(
                      "hover:bg-slate-50 transition-all duration-150 group",
                      i % 2 === 1 ? "bg-slate-50/50" : "bg-white"
                    )}
                  >
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded border border-slate-300">
                        {row.item}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-xs font-bold text-slate-800 truncate max-w-70" title={row.description}>
                        {row.description}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {row.expected_qty}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center">
                        {row.callout_found ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Found</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-500">
                            <XCircle className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Missing</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all",
                        isPassed 
                          ? "bg-green-50 text-green-600 border-green-100" 
                          : "bg-red-50 text-red-600 border-red-100"
                      )}>
                        {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {row.status}
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500 italic text-xs">
                    No items match your search/filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
