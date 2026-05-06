import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Section ──────────────────────────────────────────────────────────────────
export function Section({
  icon: Icon,
  title,
  action,
  children,
  count,
  collapsible = false,
  isCollapsed = false,
  onToggle,
}: {
  icon: React.ElementType
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  count?: number
  collapsible?: boolean
  isCollapsed?: boolean
  onToggle?: () => void
}) {
  return (
    <div className="space-y-3">
      <div 
        className={cn(
          "flex items-center justify-between transition-all duration-200",
          collapsible && "cursor-pointer group/sec -mx-2 rounded-lg px-2 py-1 hover:bg-white/5"
        )}
        onClick={collapsible ? onToggle : undefined}
      >
        <div className="flex items-center gap-2">
          {collapsible && (
            <div className={cn(
              "text-zinc-600 transition-all duration-300",
              !isCollapsed && "rotate-90 text-zinc-400"
            )}>
              <ChevronRight className="h-3 w-3" />
            </div>
          )}
          <Icon className={cn(
            "h-3.5 w-3.5 transition-colors",
            !isCollapsed ? "text-sky-500/70" : "text-zinc-600"
          )} />
          <span className="flex items-center gap-2 text-[10px] font-semibold tracking-widest text-zinc-500 uppercase transition-colors group-hover/sec:text-zinc-300">
            {title}
            {count !== undefined && count > 0 && (
              <span className="rounded-full bg-zinc-800/80 px-1.5 py-0.5 text-[9px] font-mono text-zinc-500">
                {count}
              </span>
            )}
          </span>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          {action}
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="space-y-2 border-l border-zinc-800/80 pl-4 transition-all duration-300 animate-in fade-in slide-in-from-top-1">
          {children}
        </div>
      )}
    </div>
  )
}
