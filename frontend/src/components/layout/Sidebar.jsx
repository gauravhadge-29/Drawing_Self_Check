import React from 'react'
import { 
  LayoutDashboard, 
  Upload, 
  Drill,
  History, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Gauge
} from 'lucide-react'
import { cn } from '../../utils/utils'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', active: true },
  { icon: Upload, label: 'Upload Drawing', id: 'upload', active: false },
  { icon: History, label: 'History', id: 'history', active: false, disabled: true },
  { icon: Settings, label: 'Settings', id: 'settings', active: false, disabled: true },
]

export function Sidebar({ className }) {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <aside 
      className={cn(
        "flex flex-col border-r border-slate-500/30 transition-all duration-300 ease-in-out z-30 bg-linear-to-b from-slate-900 to-slate-800 text-slate-200",
        collapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 border-b border-slate-600/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-orange-300 to-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-900/20">
            <Drill className="w-5 h-5 text-slate-950" />
          </div>
          {!collapsed && (
            <span className="font-bold text-slate-100 truncate tracking-tight text-sm">
              MECHA<span className="text-orange-300">CHECK</span>
            </span>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="px-4 py-4 border-b border-slate-600/50">
          <div className="rounded-xl bg-slate-800/60 border border-slate-600/60 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="w-4 h-4 text-orange-200" />
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-300 font-semibold">Engineering Console</span>
            </div>
            <p className="text-xs text-slate-300/90 leading-relaxed">Precision drawing verification for production engineering teams.</p>
          </div>
        </div>
      )}

      {/* Navigation items */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            disabled={item.disabled}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
              item.active 
                ? "bg-slate-700/75 text-orange-200 border border-slate-500/70" 
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-100 border border-transparent",
              item.disabled && "opacity-50 cursor-not-allowed grayscale"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 shrink-0 transition-colors",
              item.active ? "text-orange-200" : "group-hover:text-slate-100"
            )} />
            {!collapsed && (
              <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
            )}
            
            {/* Active Indicator */}
            {item.active && (
              <div className="absolute left-0 top-2 bottom-2 w-1 bg-orange-300 rounded-r-full" />
            )}
            
            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-950 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-slate-700">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-slate-600/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center h-10 rounded-xl hover:bg-slate-800 text-slate-500 hover:text-slate-200 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  )
}
