// ─── Section ──────────────────────────────────────────────────────────────────
export function Section({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: React.ElementType
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-zinc-600" />
          <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
            {title}
          </span>
        </div>
        {action}
      </div>
      <div className="space-y-2 border-l border-zinc-800/80 pl-4">
        {children}
      </div>
    </div>
  )
}
