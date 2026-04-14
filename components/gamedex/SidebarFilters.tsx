"use client"

import { useContext, useEffect, useRef, useState } from "react"
import { ChevronDown, ChevronRight, SlidersHorizontal, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { FilterContext } from "@/components/contexts/FilterContext"
import { useFilterModel } from "@/components/models/filterModel"

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
  // عدلنا الـ dragging عشان يشيل حالة الـ "both"
  const dragging = useRef<"min" | "max" | "both" | null>(null)
  // محتاجين نسجل نقطة البداية للسحب الجماعي
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
    if (type === "both") {
      startPos.current = { x: e.clientX, val: [...value] }
    }
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

      // Bound checking: التأكد إن الرينج ميطلعش بره الـ Min/Max الكلي
      if (nextMin < min) {
        nextMax += (min - nextMin)
        nextMin = min
      }
      if (nextMax > max) {
        nextMin -= (nextMax - max)
        nextMax = max
      }

      onChange([nextMin, nextMax])
      return
    }

    const v = valueFromClient(e.clientX)
    if (dragging.current === "min") onChange([Math.min(v, value[1] - 1), value[1]])
    else if (dragging.current === "max") onChange([value[0], Math.max(v, value[0] + 1)])
  }

  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = null
    startPos.current = null
    onCommit(value)
  }

  const lo = pct(value[0])
  const hi = pct(value[1])

  return (
    <div className="flex w-full flex-col gap-3 select-none">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[10px] font-bold tracking-[0.15em] text-zinc-500 uppercase">{label}</span>
        <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
          {unit}{value[0]} — {unit}{value[1]}
        </span>
      </div>

      <div className="relative px-2">
        <div
          ref={railRef}
          className="relative flex h-4 items-center"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* Background Track */}
          <div className="absolute inset-x-0 h-0.75 rounded-full bg-zinc-800" />
          
          {/* Active Range Bar (قابل للسحب الآن) */}
          <div
            className="absolute h-0.75 cursor-grab rounded-full bg-zinc-400 active:cursor-grabbing hover:bg-zinc-300 transition-colors"
            style={{ left: `${lo}%`, right: `${100 - hi}%` }}
            onPointerDown={onPointerDown("both")}
          />

          {/* Min Thumb */}
          <div
            className="absolute z-20 h-3.5 w-3.5 cursor-grab rounded-full bg-zinc-100 border border-zinc-400 shadow-[0_0_8px_rgba(0,0,0,0.5)] active:scale-125 transition-transform"
            style={{ left: `calc(${lo}% - 7px)` }}
            onPointerDown={onPointerDown("min")}
          />

          {/* Max Thumb */}
          <div
            className="absolute z-20 h-3.5 w-3.5 cursor-grab rounded-full bg-zinc-100 border border-zinc-400 shadow-[0_0_8px_rgba(0,0,0,0.5)] active:scale-125 transition-transform"
            style={{ left: `calc(${hi}% - 7px)` }}
            onPointerDown={onPointerDown("max")}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Collapsible Section ──────────────────────────────────────────────────────
function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="w-full">
      <button
        onClick={() => setOpen((p) => !p)}
        className="group flex w-full items-center justify-between py-1.5"
      >
        <span className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase transition-colors group-hover:text-zinc-300">
          {title}
        </span>
        <ChevronDown
          className="h-3 w-3 text-zinc-600 transition-all duration-200 group-hover:text-zinc-400"
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-200 ease-in-out"
        style={{ maxHeight: open ? "500px" : "0px", opacity: open ? 1 : 0 }}
      >
        <div className="mt-0.5 space-y-1 border-l border-zinc-800 pb-1 pl-3">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
function SidebarFilters() {
  const { filterModel: contextFilterModel, setFilterModel, options } =
    useContext(FilterContext)

  const checkboxSections: Section[] = [
    { key: "genres", title: "Genres", items: options.genres.map(g => g.name) },
    { key: "platforms", title: "Platforms", items: options.platforms.map(p => p.name) },
    { key: "companies", title: "Companies", items: options.companies.map(c => c.name) },
    { key: "modManagers", title: "Mod Managers", items: options.modManagers.map(m => m.name) },
    { key: "tags", title: "Tags", items: ["Multiplayer", "Single Player", "Controller Support"] },
  ]

  const initialFilters = Object.fromEntries(
    checkboxSections.map((s) => [s.key, []])
  )
  const initialRange = {
    price: { min: 0, max: 100 },
    size: { min: 0, max: 100 },
  }
  const initialSortBy = "name"

  const [filters, setFilters] =
    useState<Record<string, string[]>>(initialFilters)
  const [rangeFilters, setRangeFilters] = useState(initialRange)
  const [tempRange, setTempRange] = useState(initialRange)
  const [sortBy, setSortBy] = useState(initialSortBy)
  const [isOpen, setIsOpen] = useState(true)
  const [contentVisible, setContentVisible] = useState(true)

  // Update context filter model whenever local state changes
  useEffect(() => {
    setFilterModel({ checkboxes: filters, range: rangeFilters, sortBy })
  }, [filters, rangeFilters, sortBy, setFilterModel])

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
    (rangeFilters.size.min !== 0 || rangeFilters.size.max !== 100 ? 1 : 0)

  const toggleValue = (sectionKey: string, val: string) => {
    setFilters((prev) => {
      const cur = prev[sectionKey] || []
      return {
        ...prev,
        [sectionKey]: cur.includes(val)
          ? cur.filter((v) => v !== val)
          : [...cur, val],
      }
    })
  }

  const handleClearAll = () => {
    setFilters(initialFilters)
    setRangeFilters(initialRange)
    setSortBy(initialSortBy)
    setTempRange(initialRange)
  }

  return (
    <aside
      aria-label="Filters"
      className="relative flex h-full shrink-0 flex-col overflow-hidden border-r border-zinc-800/70"
      style={{
        width: isOpen ? "256px" : "36px",
        transition: "width 280ms cubic-bezier(0.4, 0, 0.2, 1)",
        minWidth: isOpen ? "256px" : "36px",
      }}
    >
      {/* ── Collapsed strip (icon + badge only) ── */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center pt-4"
        style={{
          opacity: isOpen ? 0 : 1,
          transition: "opacity 150ms ease",
          transitionDelay: isOpen ? "0ms" : "130ms",
        }}
      >
        <button
          onClick={handleToggle}
          className="pointer-events-auto relative rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800/60 hover:text-zinc-200"
          title="Open filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-zinc-300 text-[8px] leading-none font-bold text-zinc-900">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Expanded content ── */}
      <div
        className="flex h-full w-[256px] flex-col"
        style={{
          opacity: contentVisible && isOpen ? 1 : 0,
          transition: "opacity 180ms ease",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-xs font-semibold tracking-tight text-zinc-200">
              Filters
            </span>
            {activeCount > 0 && (
              <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                {activeCount}
              </span>
            )}
          </div>
          <button
            onClick={handleToggle}
            className="rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-800/60 hover:text-zinc-300"
            title="Collapse"
          >
            <ChevronRight
              className="h-3.5 w-3.5 transition-transform duration-300"
              style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
        </div>

        <div className=" space-y-4 overflow-y-auto px-4 pb-4">
          <Input
            type="search"
            placeholder="Search…"
            className="h-7 w-full rounded-md border-zinc-800 bg-zinc-900/50 text-xs placeholder:text-zinc-600 focus-visible:ring-zinc-700"
          />

          <select
            className="w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-2.5 py-1.5 text-xs text-zinc-300 focus:ring-1 focus:ring-zinc-700 focus:outline-none"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Name</option>
            <option value="priceLowerToHigher">Price ↑</option>
            <option value="priceHigherToLower">Price ↓</option>
            <option value="sizeLowerToHigher">Size ↑</option>
            <option value="sizeHigherToLower">Size ↓</option>
            <option value="release">Release Date</option>
          </select>

          {/* Range Sliders */}
          <div className="space-y-4 pt-2 pr-1">
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
        </div>

        {/* Scrollable body */}
        <div className="scrollbar-custom flex-1 space-y-4 overflow-y-auto px-4 pb-4">
          {checkboxSections.map((section) => (
            <CollapsibleSection key={section.key} title={section.title}>
              <div className="space-y-0.5 pt-0.5">
                {section.items.map((item) => {
                  const checked = !!filters[section.key]?.includes(item)
                  return (
                    <button
                      key={item}
                      onClick={() => toggleValue(section.key, item)}
                      className={`group flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors ${
                        checked
                          ? "bg-zinc-800/70 text-zinc-200"
                          : "text-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300"
                      }`}
                    >
                      <div
                        className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                          checked
                            ? "border-zinc-300 bg-zinc-300"
                            : "border-zinc-700 group-hover:border-zinc-500"
                        }`}
                      >
                        {checked && (
                          <svg
                            viewBox="0 0 8 8"
                            className="h-2 w-2 text-zinc-900"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
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
          ))}
        </div>

        {/* Footer */}
        <div
          className="shrink-0 overflow-hidden border-t border-zinc-800/70 transition-all duration-200"
          style={{
            maxHeight: activeCount > 0 ? "48px" : "0px",
            opacity: activeCount > 0 ? 1 : 0,
          }}
        >
          <div className="px-4 py-3">
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 text-[10px] text-zinc-500 transition-colors hover:text-zinc-300"
            >
              <X className="h-3 w-3" />
              Clear all filters
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default SidebarFilters
