"use client"

import { useContext, useEffect, useRef, useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  X,
  Bell,
  BellOff,
  Search,
  ArrowUpDown,
} from "lucide-react"

import { FilterContext } from "@/components/contexts/FilterContext"
import { useSettings } from "@/components/contexts/SettingsContext"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

type Section = { key: string; title: string; items: string[] }

// ─── Dual Range Slider ────────────────────────────────────────────────────────
function DualRangeSlider({
  label,
  min,
  max,
  value,
  onChange,
  onCommit,
  unit = "",
}: {
  label: string
  min: number
  max: number
  value: [number, number]
  onChange: (v: [number, number]) => void
  onCommit: (v: [number, number]) => void
  unit?: string
}) {
  const railRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<"min" | "max" | "both" | null>(null)
  const startPos = useRef<{ x: number; val: [number, number] } | null>(null)

  const pct = (v: number) => ((v - min) / (max - min)) * 100

  const valueFromClient = (clientX: number): number => {
    if (!railRef.current) return 0
    const rect = railRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round(ratio * (max - min) + min)
  }

  const onPointerDown = (type: "min" | "max" | "both") => (e: React.PointerEvent) => {
    e.stopPropagation()
    dragging.current = type
    if (type === "both") startPos.current = { x: e.clientX, val: [...value] }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !railRef.current) return
    if (dragging.current === "both" && startPos.current) {
      const rect = railRef.current.getBoundingClientRect()
      const deltaX = e.clientX - startPos.current.x
      const deltaVal = Math.round((deltaX / rect.width) * (max - min))
      let nextMin = startPos.current.val[0] + deltaVal
      let nextMax = startPos.current.val[1] + deltaVal
      if (nextMin < min) { nextMax += (min - nextMin); nextMin = min }
      if (nextMax > max) { nextMin -= (nextMax - max); nextMax = max }
      onChange([nextMin, nextMax])
      return
    }
    const v = valueFromClient(e.clientX)
    if (dragging.current === "min") onChange([Math.min(v, value[1] - 1), value[1]])
    else if (dragging.current === "max") onChange([value[0], Math.max(v, value[0] + 1)])
  }

  const onPointerUp = () => {
    dragging.current = null
    startPos.current = null
    onCommit(value)
  }

  const lo = pct(value[0])
  const hi = pct(value[1])

  return (
    <div className="flex w-full flex-col gap-2.5 select-none">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-semibold tracking-[0.18em] text-zinc-600 uppercase">
          {label}
        </span>
        <span className="font-mono text-[10px] text-zinc-500 tabular-nums">
          {unit}{value[0]}&thinsp;&mdash;&thinsp;{unit}{value[1]}
        </span>
      </div>

      <div className="relative px-1.5">
        <div
          ref={railRef}
          className="relative flex h-5 items-center"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="absolute inset-x-0 h-px rounded-full bg-zinc-800" />
          <div
            className="absolute h-px cursor-grab rounded-full bg-zinc-500 transition-colors hover:bg-zinc-400 active:cursor-grabbing"
            style={{ left: `${lo}%`, right: `${100 - hi}%` }}
            onPointerDown={onPointerDown("both")}
          />
          {/* Min Thumb */}
          <div
            className="absolute z-20 h-3 w-3 cursor-grab rounded-full border border-zinc-600 bg-zinc-200 shadow-md transition-transform active:scale-125 hover:bg-white hover:border-zinc-400"
            style={{ left: `calc(${lo}% - 6px)` }}
            onPointerDown={onPointerDown("min")}
          />
          {/* Max Thumb */}
          <div
            className="absolute z-20 h-3 w-3 cursor-grab rounded-full border border-zinc-600 bg-zinc-200 shadow-md transition-transform active:scale-125 hover:bg-white hover:border-zinc-400"
            style={{ left: `calc(${hi}% - 6px)` }}
            onPointerDown={onPointerDown("max")}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
  return <div className="h-px w-full bg-zinc-800/80" />
}

// ─── Collapsible Section ──────────────────────────────────────────────────────
function CollapsibleSection({
  title,
  children,
  count,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  count?: number
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="w-full">
      <button
        onClick={() => setOpen((p) => !p)}
        className="group flex w-full items-center justify-between py-1"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-semibold tracking-[0.18em] text-zinc-600 uppercase transition-colors group-hover:text-zinc-400">
            {title}
          </span>
          {count != null && count > 0 && (
            <span className="rounded-sm bg-zinc-800 px-1 py-px font-mono text-[9px] text-zinc-400">
              {count}
            </span>
          )}
        </div>
        <ChevronDown
          className="h-2.5 w-2.5 text-zinc-700 transition-all duration-200 group-hover:text-zinc-500"
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-l border-zinc-800/60 pl-2.5 pb-1.5 pt-0.5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Sort options ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "priceLowerToHigher", label: "Price: Low → High" },
  { value: "priceHigherToLower", label: "Price: High → Low" },
  { value: "sizeLowerToHigher", label: "Size: Low → High" },
  { value: "sizeHigherToLower", label: "Size: High → Low" },
  { value: "release", label: "Release Date" },
]

// ─── Main Component ───────────────────────────────────────────────────────────
function SidebarFilters() {
  const { setFilterModel, options } = useContext(FilterContext)
  const { settings, updateSettings } = useSettings()

  const checkboxSections: Section[] = [
    { key: "genres",      title: "Genres",       items: options.genres.map((g) => g.name) },
    { key: "platforms",   title: "Platforms",    items: options.platforms.map((p) => p.name) },
    { key: "companies",   title: "Companies",    items: options.companies.map((c) => c.name) },
    { key: "modManagers", title: "Mod Managers", items: options.modManagers.map((m) => m.name) },
    { key: "tags",        title: "Tags",         items: options.tags.map((t) => t.name) },
  ]

  const initialFilters   = Object.fromEntries(checkboxSections.map((s) => [s.key, []]))
  const initialRange     = { price: { min: 0, max: 100 }, size: { min: 0, max: 100 } }
  const initialSortBy    = "name"

  const [filters,      setFilters]      = useState<Record<string, string[]>>(initialFilters)
  const [rangeFilters, setRangeFilters] = useState(initialRange)
  const [tempRange,    setTempRange]    = useState(initialRange)
  const [sortBy,       setSortBy]       = useState(initialSortBy)
  const [query,        setQuery]        = useState("")
  const [isOpen,       setIsOpen]       = useState(true)
  const [contentVisible, setContentVisible] = useState(true)

  useEffect(() => {
    setFilterModel({ checkboxes: filters, range: rangeFilters, sortBy, query })
  }, [filters, rangeFilters, sortBy, query, setFilterModel])

  const handleToggle = () => {
    if (isOpen) {
      setContentVisible(false)
      setTimeout(() => setIsOpen(false), 150)
    } else {
      setIsOpen(true)
      setTimeout(() => setContentVisible(true), 50)
    }
  }

  const activeCount =
    Object.values(filters).flat().length +
    (rangeFilters.price.min !== 0 || rangeFilters.price.max !== 100 ? 1 : 0) +
    (rangeFilters.size.min  !== 0 || rangeFilters.size.max  !== 100 ? 1 : 0) +
    (query ? 1 : 0)

  const toggleValue = (sectionKey: string, val: string) => {
    setFilters((prev) => {
      const cur = prev[sectionKey] || []
      return {
        ...prev,
        [sectionKey]: cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val],
      }
    })
  }

  const handleClearAll = () => {
    setFilters(initialFilters)
    setRangeFilters(initialRange)
    setSortBy(initialSortBy)
    setQuery("")
    setTempRange(initialRange)
  }

  return (
    <aside
      aria-label="Filters"
      className="relative flex h-full shrink-0 flex-col overflow-hidden border-r border-zinc-800/60"
      style={{
        width: isOpen ? "220px" : "36px",
        transition: "width 280ms cubic-bezier(0.4, 0, 0.2, 1)",
        minWidth: isOpen ? "220px" : "36px",
      }}
    >
      {/* ── Collapsed strip ── */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center pt-3.5"
        style={{
          opacity: isOpen ? 0 : 1,
          transition: "opacity 150ms ease",
          transitionDelay: isOpen ? "0ms" : "130ms",
        }}
      >
        <button
          onClick={handleToggle}
          className="pointer-events-auto relative rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-zinc-800/60 hover:text-zinc-300"
          title="Open filters"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {activeCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-zinc-300 text-[7px] font-bold leading-none text-zinc-900">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Expanded content ── */}
      <div
        className="flex h-full w-[220px] flex-col"
        style={{
          opacity: contentVisible && isOpen ? 1 : 0,
          transition: "opacity 180ms ease",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        {/* ── Header ── */}
        <div className="flex shrink-0 items-center justify-between px-3.5 pt-3.5 pb-2.5">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-3 w-3 text-zinc-600" />
            <span className="text-[10px] font-semibold tracking-[0.12em] text-zinc-400 uppercase">
              Filters
            </span>
            {activeCount > 0 && (
              <span className="rounded-sm bg-zinc-800 px-1 py-px font-mono text-[9px] text-zinc-500">
                {activeCount}
              </span>
            )}
          </div>
          <button
            onClick={handleToggle}
            className="rounded p-0.5 text-zinc-700 transition-colors hover:bg-zinc-800/60 hover:text-zinc-400"
            title="Collapse"
          >
            <ChevronRight
              className="h-3 w-3 transition-transform duration-300"
              style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
        </div>

        <Divider />

        {/* ── Scrollable body ── */}
        <div className="scrollbar-custom flex-1 overflow-y-auto px-3.5 py-3 space-y-4">

          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-zinc-600" />
            <input
              type="search"
              placeholder="Search games…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-6 w-full rounded border border-zinc-800/80 bg-zinc-900/60 pl-6 pr-2 text-[11px] text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus-visible:border-zinc-700 focus-visible:ring-0 transition-colors"
            />
          </div>

          <Divider />

          {/* Sort */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="h-2.5 w-2.5 text-zinc-600" />
              <span className="text-[9px] font-semibold tracking-[0.18em] text-zinc-600 uppercase">
                Sort By
              </span>
            </div>
            <div className="relative">
              <select
                className="w-full cursor-pointer appearance-none rounded border border-zinc-800/80 bg-zinc-900/60 px-2.5 py-1.5 text-[11px] text-zinc-300 focus:outline-none focus-visible:border-zinc-700 transition-colors"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-zinc-600" />
            </div>
          </div>

          <Divider />

          {/* Range Sliders */}
          <div className="space-y-4 pr-0.5">
            <DualRangeSlider
              label="Price"
              min={0}
              max={100}
              unit="$"
              value={[tempRange.price.min, tempRange.price.max]}
              onChange={([lo, hi]) =>
                setTempRange((p) => ({ ...p, price: { min: lo, max: hi } }))
              }
              onCommit={([lo, hi]) => {
                setTempRange((p) => ({ ...p, price: { min: lo, max: hi } }))
                setRangeFilters((p) => ({ ...p, price: { min: lo, max: hi } }))
              }}
            />
            <DualRangeSlider
              label="Size"
              min={0}
              max={100}
              unit=""
              value={[tempRange.size.min, tempRange.size.max]}
              onChange={([lo, hi]) =>
                setTempRange((p) => ({ ...p, size: { min: lo, max: hi } }))
              }
              onCommit={([lo, hi]) => {
                setTempRange((p) => ({ ...p, size: { min: lo, max: hi } }))
                setRangeFilters((p) => ({ ...p, size: { min: lo, max: hi } }))
              }}
            />
          </div>

          <Divider />

          {/* Checkbox Sections */}
          <div className="space-y-3">
            {checkboxSections.map((section) => {
              const active = filters[section.key]?.length ?? 0
              return (
                <CollapsibleSection
                  key={section.key}
                  title={section.title}
                  count={active}
                >
                  <div className="space-y-px pt-0.5">
                    {section.items.map((item) => {
                      const checked = !!filters[section.key]?.includes(item)
                      return (
                        <button
                          key={item}
                          onClick={() => toggleValue(section.key, item)}
                          className={cn(
                            "group flex w-full items-center gap-2 rounded px-1.5 py-[5px] text-left transition-colors",
                            checked
                              ? "bg-zinc-800/60 text-zinc-200"
                              : "text-zinc-600 hover:bg-zinc-800/30 hover:text-zinc-400"
                          )}
                        >
                          {/* Custom checkbox */}
                          <div
                            className={cn(
                              "flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-[2px] border transition-all",
                              checked
                                ? "border-zinc-400 bg-zinc-300"
                                : "border-zinc-700 group-hover:border-zinc-600"
                            )}
                          >
                            {checked && (
                              <svg
                                viewBox="0 0 8 8"
                                className="h-1.5 w-1.5 text-zinc-900"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="1,4 3,6 7,2" />
                              </svg>
                            )}
                          </div>
                          <span className="text-[11px] leading-none">{item}</span>
                        </button>
                      )
                    })}
                  </div>
                </CollapsibleSection>
              )
            })}
          </div>

          <Divider />

          {/* System Settings */}
          <CollapsibleSection title="Settings" defaultOpen={false}>
            <div className="pt-1.5 pb-0.5">
              <div className="flex items-center justify-between pr-1">
                <div className="flex items-center gap-1.5">
                  {settings.notificationsEnabled ? (
                    <Bell className="h-2.5 w-2.5 text-emerald-500/70" />
                  ) : (
                    <BellOff className="h-2.5 w-2.5 text-zinc-600" />
                  )}
                  <span className="text-[11px] text-zinc-500">Notifications</span>
                </div>
                <button
                  onClick={() =>
                    updateSettings({ notificationsEnabled: !settings.notificationsEnabled })
                  }
                  className={cn(
                    "relative h-3.5 w-7 rounded-full transition-colors duration-200",
                    settings.notificationsEnabled ? "bg-emerald-500/20" : "bg-zinc-800"
                  )}
                >
                  <motion.div
                    animate={{ x: settings.notificationsEnabled ? 14 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={cn(
                      "h-2.5 w-2.5 rounded-full shadow-sm",
                      settings.notificationsEnabled ? "bg-emerald-500" : "bg-zinc-600"
                    )}
                  />
                </button>
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* ── Footer: Clear All ── */}
        <AnimatePresence>
          {activeCount > 0 && (
            <motion.div
              key="clear"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="overflow-hidden border-t border-zinc-800/60"
            >
              <div className="px-3.5 py-2.5">
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 text-[9px] font-medium tracking-[0.12em] text-zinc-600 uppercase transition-colors hover:text-zinc-300"
                >
                  <X className="h-2.5 w-2.5" />
                  Clear all
                  <span className="font-mono normal-case tracking-normal text-zinc-700">
                    ({activeCount})
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  )
}

export default SidebarFilters
