import React from 'react'
import { 
  FileUp, 
  Play, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Cog,
  Factory 
} from 'lucide-react'
import { cn } from '../../utils/utils'

export function Navbar({ 
  projectName = "Drawing Validation", 
  status = "idle", 
  onUpload, 
  onRun, 
  isLoading,
  canRun = false
}) {
  const statusLabel = status === 'processing' ? 'Processing' : status === 'completed' ? 'Completed' : 'Awaiting Input'

  return (
    <header className="h-16 bg-white/80 border-b border-slate-300/80 flex items-center justify-between px-4 md:px-6 z-20 sticky top-0 backdrop-blur-md">
      <div className="flex items-center gap-4 shrink-0">
        <h1 className="text-base md:text-lg font-semibold text-slate-800 truncate max-w-57.5 md:max-w-90">
          {projectName}
        </h1>
        
        {/* Status Badge */}
        <div className={cn(
          "hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300",
          status === "processing" 
            ? "bg-blue-100 text-blue-700 border-blue-200 animate-pulse" 
            : status === "completed"
            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
            : "bg-slate-100 text-slate-600 border-slate-200"
        )}>
          {status === "processing" ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : status === "completed" ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <AlertCircle className="w-3 h-3" />
          )}
          <span>{statusLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-slate-50">
          <Factory className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium">Mechanical QA Suite</span>
        </div>
        
        {/* Action Buttons */}
        <button
          onClick={onUpload}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileUp className="w-4 h-4" />
          <span className="hidden sm:inline">Upload</span>
        </button>

        <button
          onClick={onRun}
          disabled={isLoading || !canRun}
          className={cn(
            "flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-white bg-linear-to-r from-primary to-slate-700 rounded-xl hover:from-slate-700 hover:to-primary active:from-primary active:to-slate-700 transition-all shadow-md shadow-slate-700/20 disabled:opacity-50 disabled:cursor-not-allowed",
            status === "processing" && "opacity-80"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          <span className="hidden sm:inline">Run Validation</span>
        </button>

        <div className="h-8 w-px bg-slate-300 mx-1 md:mx-2" />

        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-600">
          <Cog className="w-4 h-4" />
          <span className="hidden md:inline text-xs font-medium">Controls</span>
        </div>
      </div>
    </header>
  )
}
