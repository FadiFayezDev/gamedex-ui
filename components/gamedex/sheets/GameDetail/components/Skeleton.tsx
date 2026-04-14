// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({
  className,
  style,
}: {
  className?: string
  style: React.CSSProperties
}) {
  return (
    <div
      className={`animate-pulse rounded-md bg-zinc-800/60 ${className}`}
      style={style}
    />
  )
}