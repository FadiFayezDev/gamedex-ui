"use client"

import {
  IconLayoutGrid,
  IconLayoutKanban,
  IconListDetails,
  IconTable,
} from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { ViewMode } from "@/components/gamedex/types"

type ViewToggleProps = {
  value: ViewMode
  onChange: (value: ViewMode) => void
}

const viewOptions: Array<{
  value: ViewMode
  label: string
  Icon: typeof IconLayoutGrid
}> = [
  { value: "grid",    label: "Cards",   Icon: IconLayoutGrid    },
  { value: "tiles",   label: "Tiles",   Icon: IconLayoutKanban  },
  { value: "list",    label: "List",    Icon: IconListDetails   },
  { value: "details", label: "Details", Icon: IconTable         },
]

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      aria-label="View mode"
      role="tablist"
      className="flex items-center gap-px rounded-lg border border-zinc-800 bg-zinc-900/80 p-0.5"
    >
      {viewOptions.map(({ value: v, label, Icon }) => {
        const active = value === v
        return (
          <button
            key={v}
            role="tab"
            aria-label={label}
            aria-selected={active}
            title={label}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md transition-all duration-150 active:scale-90",
              active
                ? "bg-zinc-100 text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300"
            )}
          >
            <Icon size={14} strokeWidth={active ? 2 : 1.6} />
          </button>
        )
      })}
    </div>
  )
}
