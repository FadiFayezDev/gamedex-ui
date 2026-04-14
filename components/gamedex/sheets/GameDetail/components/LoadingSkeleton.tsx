import { Skeleton } from "./Skeleton"
export function LoadingSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="relative h-64 w-full shrink-0 bg-zinc-900">
        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0b] to-transparent" />
        <div className="absolute bottom-5 left-6 space-y-2">
          <Skeleton className="h-3 w-24" style={{ width: "100%" }} />
          <Skeleton className="h-7 w-56" style={{ width: "100%" }} />
          <Skeleton className="h-3 w-36" style={{ width: "100%" }} />
        </div>
      </div>
      <div className="flex-1 space-y-6 px-6 py-6">
        {[80, 60, 72, 50, 90, 64].map((w, i) => (
          <Skeleton key={i} className="h-3" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  )
}