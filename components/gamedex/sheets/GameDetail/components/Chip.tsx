import { X } from "lucide-react";

// ─── Chip ─────────────────────────────────────────────────────────────────────
export function Chip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="group inline-flex items-center gap-1.5 rounded-md border border-zinc-700/50 bg-zinc-800/60 px-2.5 py-1 text-xs text-zinc-300">
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-zinc-500 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  )
}