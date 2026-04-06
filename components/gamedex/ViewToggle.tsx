"use client"

import { IconLayoutGrid, IconList } from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { ViewMode } from "@/components/gamedex/types"

type ViewToggleProps = {
  value: ViewMode
  onChange: (value: ViewMode) => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      aria-label="View mode"
      className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-md border border-zinc-800"
      role="tablist"
    >
      <button
        className={cn(
          "p-1.5 rounded transition-colors",
          value === "grid"
            ? "bg-zinc-800 text-white"
            : "text-zinc-500 hover:text-zinc-300"
        )}
        type="button"
        role="tab"
        onClick={() => onChange("grid")}
      >
        <IconLayoutGrid size={18} />
      </button>
      <button
        className={cn(
          "p-1.5 rounded transition-colors",
          value === "list"
            ? "bg-zinc-800 text-white"
            : "text-zinc-500 hover:text-zinc-300"
        )}
        type="button"
        role="tab"
        onClick={() => onChange("list")}
      >
        <IconList size={18} />
      </button>
    </div>
  )
}
