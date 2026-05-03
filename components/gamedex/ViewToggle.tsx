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
  description: string
  Icon: typeof IconLayoutGrid
}> = [
  {
    value: "grid",
    label: "Cards",
    description: "Poster-first browsing",
    Icon: IconLayoutGrid,
  },
  {
    value: "tiles",
    label: "Tiles",
    description: "Windows-style media tiles",
    Icon: IconLayoutKanban,
  },
  {
    value: "list",
    label: "List",
    description: "Compact content rows",
    Icon: IconListDetails,
  },
  {
    value: "details",
    label: "Details",
    description: "Dense library table",
    Icon: IconTable,
  },
]

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      aria-label="View mode"
      className="flex items-center gap-1 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl"
      role="tablist"
    >
      {viewOptions.map(({ value: optionValue, label, description, Icon }) => (
        <button
          key={optionValue}
          aria-label={label}
          aria-selected={value === optionValue}
          className={cn(
            "group flex min-w-12 items-center gap-2 rounded-xl px-3 py-2 text-left transition-all duration-200",
            value === optionValue
              ? "bg-zinc-100 text-zinc-950 shadow-[0_10px_20px_rgba(255,255,255,0.12)]"
              : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
          )}
          title={description}
          type="button"
          role="tab"
          onClick={() => onChange(optionValue)}
        >
          <Icon size={17} strokeWidth={1.7} />
          <span className="hidden sm:block">
            <span className="block text-[11px] leading-none font-semibold">
              {label}
            </span>
            <span
              className={cn(
                "mt-1 block text-[10px] leading-none",
                value === optionValue ? "text-zinc-600" : "text-zinc-500/80"
              )}
            >
              {description}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}
