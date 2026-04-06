"use client"
import { motion, AnimatePresence } from "framer-motion"
import * as React from "react"
import { useEffect, useState, useRef, useCallback } from "react"
import {
  Pencil,
  Check,
  X,
  Plus,
  Trash2,
  ChevronRight,
  Calendar,
  Shield,
  HardDrive,
  DollarSign,
  Gamepad2,
  Users,
  Building2,
  Package,
  Map,
  Cpu,
  Layers,
  Puzzle,
  Film,
  Loader2,
  Search,
  ArrowLeft,
  Play,
  Maximize2,
  Images,
  Video,
  Settings2,
  ChevronLeft,
  Volume2,
  VolumeX,
} from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  getGame,
  updateGameDetails,
  setGameRatings,
  addMission,
  addCharacterProfile,
  addDlc,
  addPerformanceProfile,
  addRequirement,
  addControlMapping,
  deleteMission,
  deleteCharacterProfile,
  deleteDlc,
  deletePerformanceProfile,
  deleteRequirement,
  deleteControlMapping,
  updateGameCover,
  deleteGameCover,
  uploadGameScreenshot,
  deleteScreenshot,
  uploadGameTrailer,
  addMediaAsset,
  deleteMediaAsset,
  getGameScreenshotUrl,
  getGameTrailerUrl,
  getGameCoverUrl,
  deleteTrailer,
} from "@/lib/services/games"
import { listGenres } from "@/lib/services/genres"
import { listPlatforms } from "@/lib/services/platforms"
import { listCompanies } from "@/lib/services/companies"
import { listModManagers } from "@/lib/services/mod-managers"
import {
  createAssociation,
  deleteAssociation,
} from "@/lib/services/associations"
import { GameDetails } from "../models/gameCatalog/game"
import { AssociationType } from "../enums/AssociationType"
import { Switch } from "radix-ui"
import { AssetType } from "../enums/AssetType"

// ─── Association type values ──────────────────────────────────────────────────
const ASSOC_DEVELOPER = 1 as AssociationType
const ASSOC_PUBLISHER = 2 as AssociationType
const ASSOC_GENRE = 3 as AssociationType
const ASSOC_PLATFORM = 4 as AssociationType
const ASSOC_MOD_MANAGER = 5 as AssociationType

// ─── Field config for the generic AddForm ────────────────────────────────────
interface FormField {
  key: string
  placeholder: string
  type?: "text" | "number" | "date" | "file"
  options?: { value: string; label: string }[]
}

// ─── Types ────────────────────────────────────────────────────────────────────
type PickerEntity = { id: string; name: string }

type Props = {
  gameId: string
  coverUrl?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: (updated: GameDetails) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatBytes = (b: number) =>
  b < 1e9 ? `${(b / 1e6).toFixed(1)} MB` : `${(b / 1e9).toFixed(2)} GB`

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—"

async function fetchModManagers(): Promise<PickerEntity[]> {
  const data = await listModManagers()
  if (!data || !Array.isArray(data)) return []
  return (data as any[]).map((m) => ({
    id: String(m.id ?? ""),
    name: String(m.name ?? "Unknown"),
  }))
}

// ─── EntityPicker ─────────────────────────────────────────────────────────────
function EntityPicker({
  fetchFn,
  linkedNames,
  onSelect,
}: {
  fetchFn: () => Promise<PickerEntity[]>
  linkedNames: string[]
  onSelect: (e: PickerEntity) => Promise<void>
}) {
  const [open, setOpen] = React.useState(false)
  const [entities, setEntities] = React.useState<PickerEntity[]>([])
  const [loading, setLoading] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [adding, setAdding] = React.useState<string | null>(null)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    setLoading(true)
    fetchFn()
      .then(setEntities)
      .catch(() => setEntities([]))
      .finally(() => setLoading(false))
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const available = entities.filter(
    (e) =>
      !linkedNames.includes(e.name) &&
      e.name.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = async (entity: PickerEntity) => {
    setAdding(entity.id)
    try {
      await onSelect(entity)
      setOpen(false)
      setQuery("")
    } finally {
      setAdding(null)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-[10px] text-zinc-600 transition-colors hover:text-zinc-300"
      >
        <Plus className="h-3 w-3" /> Add
      </button>

      {open && (
        <div className="absolute top-6 right-0 z-50 w-52 rounded-xl border border-zinc-700/60 bg-zinc-900 shadow-2xl shadow-black/60">
          <div className="flex items-center gap-2 border-b border-zinc-800 px-2.5 py-2">
            <Search className="h-3 w-3 shrink-0 text-zinc-600" />
            <input
              autoFocus
              className="flex-1 bg-transparent text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-600" />
              </div>
            ) : available.length === 0 ? (
              <p className="px-3 py-3 text-center text-[10px] text-zinc-600">
                {entities.length === 0
                  ? "No options available"
                  : "All items already added"}
              </p>
            ) : (
              available.map((e) => (
                <button
                  key={e.id}
                  onClick={() => handleSelect(e)}
                  disabled={!!adding}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-zinc-300 transition-colors hover:bg-zinc-800/80 disabled:opacity-50"
                >
                  {adding === e.id && (
                    <Loader2 className="h-3 w-3 shrink-0 animate-spin text-zinc-500" />
                  )}
                  {e.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CompanyPicker ────────────────────────────────────────────────────────────
function CompanyPicker({
  linkedCompanies,
  onSelect,
}: {
  linkedCompanies: { name: string; type: AssociationType }[]
  onSelect: (company: PickerEntity, type: AssociationType) => Promise<void>
}) {
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState<"pick" | "role">("pick")
  const [companies, setCompanies] = React.useState<PickerEntity[]>([])
  const [selected, setSelected] = React.useState<PickerEntity | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    setLoading(true)
    listCompanies()
      .then(setCompanies)
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false))
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false)
        setStep("pick")
        setSelected(null)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const available = companies.filter((c) => {
    const isSearchMatch = c.name.toLowerCase().includes(query.toLowerCase())
    const rolesCount = linkedCompanies.filter((lc) => lc.name === c.name).length
    return isSearchMatch && rolesCount < 2
  })

  const handleRoleSelect = async (type: AssociationType) => {
    if (!selected) return
    setSaving(true)
    try {
      await onSelect(selected, type)
      setOpen(false)
      setStep("pick")
      setSelected(null)
      setQuery("")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-[10px] text-zinc-600 transition-colors hover:text-zinc-300"
      >
        <Plus className="h-3 w-3" /> Add
      </button>

      {open && (
        <div className="absolute top-6 right-0 z-50 w-52 rounded-xl border border-zinc-700/60 bg-zinc-900 shadow-2xl shadow-black/60">
          {step === "pick" ? (
            <>
              <div className="flex items-center gap-2 border-b border-zinc-800 px-2.5 py-2">
                <Search className="h-3 w-3 shrink-0 text-zinc-600" />
                <input
                  autoFocus
                  className="flex-1 bg-transparent text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
                  placeholder="Search companies…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="max-h-48 overflow-y-auto py-1">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-600" />
                  </div>
                ) : available.length === 0 ? (
                  <p className="px-3 py-3 text-center text-[10px] text-zinc-600">
                    No companies found
                  </p>
                ) : (
                  available.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelected(c)
                        setStep("role")
                      }}
                      className="flex w-full items-center px-3 py-1.5 text-left text-xs text-zinc-300 transition-colors hover:bg-zinc-800/80"
                    >
                      {c.name}
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 border-b border-zinc-800 px-2.5 py-2">
                <button
                  onClick={() => setStep("pick")}
                  className="shrink-0 text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  <ArrowLeft className="h-3 w-3" />
                </button>
                <span className="truncate text-xs font-medium text-zinc-300">
                  {selected?.name}
                </span>
              </div>
              <div className="py-1">
                <p className="px-3 pt-0.5 pb-1 text-[9px] tracking-widest text-zinc-600 uppercase">
                  Select role
                </p>
                {(
                  [
                    ["Developer", ASSOC_DEVELOPER],
                    ["Publisher", ASSOC_PUBLISHER],
                  ] as [string, AssociationType][]
                ).map(([label, type]) => {
                  const isAlreadyLinked = linkedCompanies.some(
                    (lc) => lc.name === selected?.name && lc.type === type
                  )
                  return (
                    <button
                      key={label}
                      onClick={() => handleRoleSelect(type)}
                      disabled={saving || isAlreadyLinked}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-zinc-300 transition-colors hover:bg-zinc-800/80 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                      {label}
                      {isAlreadyLinked && (
                        <span className="ml-auto text-[8px] text-zinc-500">
                          (Added)
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Generic inline AddForm ───────────────────────────────────────────────────
function AddForm({
  fields,
  onSave,
  onCancel,
}: {
  fields: FormField[]
  onSave: (values: any) => Promise<void>
  onCancel: () => void
}) {
  const [values, setValues] = React.useState<Record<string, any>>(
    Object.fromEntries(fields.map((f) => [f.key, f.options?.[0]?.value ?? ""]))
  )
  const [saving, setSaving] = React.useState(false)
  const firstTextKey = fields.find((f) => !f.options && f.type !== "file")?.key

  const commit = async () => {
    if (
      firstTextKey &&
      typeof values[firstTextKey] === "string" &&
      !values[firstTextKey]?.trim()
    )
      return
    setSaving(true)
    try {
      await onSave(values)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-700/40 bg-zinc-900/60 p-2.5">
      {fields.map((f, i) => {
        if (f.options) {
          return (
            <select
              key={f.key}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 focus:ring-1 focus:ring-zinc-600 focus:outline-none"
              value={values[f.key] ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, [f.key]: e.target.value }))
              }
            >
              {f.options.map((o) => (
                <option key={o.value} value={o.value} className="bg-zinc-900">
                  {o.label}
                </option>
              ))}
            </select>
          )
        }

        if (f.type === "file") {
          return (
            <input
              key={f.key}
              type="file"
              className="w-full text-[10px] text-zinc-400 file:mr-2 file:rounded file:border-0 file:bg-zinc-800 file:px-2 file:py-1 file:text-[10px] file:text-zinc-200 hover:file:bg-zinc-700"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setValues((v) => ({ ...v, [f.key]: file }))
              }}
            />
          )
        }

        return (
          <input
            key={f.key}
            autoFocus={i === 0}
            type={f.type ?? "text"}
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 placeholder-zinc-600 focus:ring-1 focus:ring-zinc-600 focus:outline-none"
            placeholder={f.placeholder}
            value={values[f.key] ?? ""}
            onChange={(e) =>
              setValues((v) => ({ ...v, [f.key]: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && i === fields.length - 1) commit()
              if (e.key === "Escape") onCancel()
            }}
          />
        )
      })}

      <div className="flex gap-2 pt-0.5">
        <button
          onClick={commit}
          disabled={
            saving ||
            (!!firstTextKey &&
              typeof values[firstTextKey] === "string" &&
              !values[firstTextKey]?.trim())
          }
          className="flex items-center gap-1 text-[10px] text-emerald-400 transition-colors hover:text-emerald-300 disabled:opacity-40"
        >
          {saving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Check className="h-3 w-3" />
          )}
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 text-[10px] text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <X className="h-3 w-3" /> Cancel
        </button>
      </div>
    </div>
  )
}

function AddFormToggle({
  fields,
  onSave,
}: {
  fields: FormField[]
  onSave: (values: any) => Promise<void>
}) {
  const [active, setActive] = React.useState(false)

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="inline-flex items-center gap-1 text-[10px] text-zinc-600 transition-colors hover:text-zinc-300"
      >
        <Plus className="h-3 w-3" /> Add
      </button>
    )
  }

  return (
    <AddForm
      fields={fields}
      onSave={async (v) => {
        await onSave(v)
        setActive(false)
      }}
      onCancel={() => setActive(false)}
    />
  )
}

// ─── InlineField ──────────────────────────────────────────────────────────────
function InlineField({
  value,
  onSave,
  multiline = false,
  placeholder = "—",
}: {
  value: string | null
  onSave: (v: string) => void
  multiline?: boolean
  placeholder?: string
}) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(value ?? "")

  React.useEffect(() => setDraft(value ?? ""), [value])

  const commit = () => {
    onSave(draft)
    setEditing(false)
  }
  const discard = () => {
    setDraft(value ?? "")
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex w-full flex-col gap-1.5">
        {multiline ? (
          <textarea
            autoFocus
            rows={3}
            className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:ring-1 focus:ring-zinc-500 focus:outline-none"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        ) : (
          <input
            autoFocus
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:ring-1 focus:ring-zinc-500 focus:outline-none"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit()
              if (e.key === "Escape") discard()
            }}
          />
        )}
        <div className="flex gap-3">
          <button
            onClick={commit}
            className="flex items-center gap-1 text-[10px] text-emerald-400 transition-colors hover:text-emerald-300"
          >
            <Check className="h-3 w-3" /> Save
          </button>
          <button
            onClick={discard}
            className="flex items-center gap-1 text-[10px] text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex w-full items-start gap-2">
      <span
        className={`flex-1 text-sm leading-relaxed ${value ? "text-zinc-300" : "text-zinc-600 italic"}`}
      >
        {value ?? placeholder}
      </span>
      <button
        onClick={() => setEditing(true)}
        className="mt-0.5 shrink-0 rounded p-1 text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-zinc-800 hover:text-zinc-300"
      >
        <Pencil className="h-3 w-3" />
      </button>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────
function Section({
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

// ─── Chip ─────────────────────────────────────────────────────────────────────
function Chip({ label, onRemove }: { label: string; onRemove?: () => void }) {
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

// ─── RatingBar ────────────────────────────────────────────────────────────────
function RatingBar({
  label,
  value,
  onSave,
}: {
  label: string
  value: number | null
  onSave?: (v: number | null) => void
}) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState("")

  const commit = () => {
    const n = parseFloat(draft)
    onSave?.(isNaN(n) ? null : Math.max(0, Math.min(100, n)))
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 text-[10px] tracking-wider text-zinc-500 uppercase">
        {label}
      </span>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-zinc-400 transition-all duration-300"
          style={{ width: `${value !== null ? value * 10 : 0}%` }}
        />
      </div>
      {editing ? (
        <input
          autoFocus
          type="number"
          min="0"
          max="100"
          className="w-12 rounded bg-zinc-800 px-1 py-0.5 text-right font-mono text-xs text-zinc-300 focus:outline-none"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit()
            if (e.key === "Escape") setEditing(false)
          }}
        />
      ) : (
        <button
          onClick={() => {
            setDraft(String(value ?? ""))
            setEditing(true)
          }}
          disabled={!onSave}
          className="w-8 text-right font-mono text-xs text-zinc-400 tabular-nums transition-colors hover:text-zinc-200 disabled:cursor-default"
          title={onSave ? "Click to edit" : undefined}
        >
          {value ?? "—"}
        </button>
      )}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({
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

function LoadingSkeleton() {
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

// ─── Trailer Fullscreen Modal ─────────────────────────────────────────────────
function TrailerModal({
  url,
  title,
  onClose,
}: {
  url: string
  title: string
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(false)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setMuted(videoRef.current.muted)
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
        setPlaying(true)
      } else {
        videoRef.current.pause()
        setPlaying(false)
      }
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-4xl px-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title bar */}
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Film className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-xs font-medium tracking-wider text-zinc-400 uppercase">
                {title} — Trailer
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-1.5 text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Video */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-black shadow-2xl shadow-black">
            <video
              ref={videoRef}
              src={url}
              autoPlay
              controls
              className="aspect-video w-full"
              onEnded={() => setPlaying(false)}
            />
          </div>

          {/* Controls row */}
          <div className="mt-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-[10px] font-medium tracking-wider text-zinc-400 uppercase transition-all hover:border-zinc-700 hover:text-zinc-200"
              >
                {playing ? (
                  <>
                    <span className="flex h-2.5 w-2.5 items-center justify-between gap-px">
                      <span className="h-full w-px bg-current" />
                      <span className="h-full w-px bg-current" />
                    </span>
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-2.5 w-2.5 fill-current" />
                    Play
                  </>
                )}
              </button>
              <button
                onClick={toggleMute}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-[10px] font-medium tracking-wider text-zinc-400 uppercase transition-all hover:border-zinc-700 hover:text-zinc-200"
              >
                {muted ? (
                  <VolumeX className="h-3 w-3" />
                ) : (
                  <Volume2 className="h-3 w-3" />
                )}
                {muted ? "Unmute" : "Mute"}
              </button>
            </div>
            <span className="text-[10px] text-zinc-600">Press Esc to close</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Header Settings Popover ──────────────────────────────────────────────────
function HeaderSettingsPopover({
  showTrailer,
  hasTrailer,
  onToggle,
}: {
  showTrailer: boolean
  hasTrailer: boolean
  onToggle: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-white/50 backdrop-blur-sm transition-all hover:border-white/20 hover:text-white/80"
      >
        <Settings2 className="h-3.5 w-3.5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-9 right-0 z-50 w-56 rounded-xl border border-zinc-700/60 bg-zinc-950/95 p-3 shadow-2xl shadow-black/60 backdrop-blur-md"
          >
            <p className="mb-2 text-[9px] font-semibold tracking-widest text-zinc-600 uppercase">
              Header Display
            </p>

            <button
              onClick={() => {
                onToggle()
                setOpen(false)
              }}
              disabled={!hasTrailer}
              className="group flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-zinc-800/60 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <div className="flex items-center gap-2">
                {showTrailer ? (
                  <Video className="h-3.5 w-3.5 text-zinc-400" />
                ) : (
                  <Images className="h-3.5 w-3.5 text-zinc-400" />
                )}
                <div>
                  <div className="text-xs font-medium text-zinc-300">
                    {showTrailer ? "Show Trailer" : "Show Screenshots"}
                  </div>
                  {!hasTrailer && (
                    <div className="text-[9px] text-zinc-600">
                      No trailer available
                    </div>
                  )}
                </div>
              </div>

              {/* Toggle visual */}
              <div
                className={`relative h-4.5 w-8 rounded-full border transition-all ${
                  showTrailer
                    ? "border-zinc-500 bg-zinc-600"
                    : "border-zinc-700 bg-zinc-800"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-all ${
                    showTrailer ? "left-4" : "left-0.5"
                  }`}
                />
              </div>
            </button>

            <p className="mt-2 px-2.5 text-[9px] leading-relaxed text-zinc-600">
              {showTrailer
                ? "Trailer plays muted in the header background"
                : "Screenshots cycle automatically every 4s"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Field configs ────────────────────────────────────────────────────────────
const MISSION_FIELDS: FormField[] = [
  { key: "title", placeholder: "Mission title…" },
  { key: "description", placeholder: "Description (optional)…" },
]

const CHARACTER_FIELDS: FormField[] = [
  { key: "name", placeholder: "Character name…" },
  { key: "role", placeholder: "Role (e.g. Protagonist)…" },
]

const DLC_FIELDS: FormField[] = [
  { key: "title", placeholder: "DLC title…" },
  { key: "releaseDate", placeholder: "Release date", type: "date" },
]

const PERF_PROFILE_FIELDS: FormField[] = [
  { key: "resolution", placeholder: "Resolution (e.g. 1080p)…" },
  { key: "targetFps", placeholder: "Target FPS (e.g. 60)", type: "number" },
  { key: "settingsPreset", placeholder: "Settings preset (e.g. High)…" },
]

const REQUIREMENT_FIELDS: FormField[] = [
  {
    key: "type",
    placeholder: "Type",
    options: [
      { value: "1", label: "Minimum" },
      { value: "2", label: "Recommended" },
      { value: "3", label: "Ultra" },
    ],
  },
  { key: "os", placeholder: "OS (e.g. Windows 10)…" },
  { key: "cpu", placeholder: "CPU (e.g. Intel i5-8600K)…" },
  { key: "gpu", placeholder: "GPU (e.g. NVIDIA GTX 1070)…" },
  { key: "ramGb", placeholder: "RAM in GB (e.g. 8)", type: "number" },
  {
    key: "storageBytes",
    placeholder: "Storage in Bytes (e.g. 8589934592)",
    type: "number",
  },
  { key: "additionalNotes", placeholder: "Additional notes…" },
]

const CONTROL_FIELDS: FormField[] = [
  { key: "device", placeholder: "Device (e.g. Keyboard)…" },
  { key: "action", placeholder: "Action (e.g. Jump)…" },
  { key: "key", placeholder: "Key / Button (e.g. Space)…" },
]

const MEDIA_ASSET_FIELDS: FormField[] = [
  {
    key: "type",
    placeholder: "Type",
    options: [
      { value: "1", label: "Screenshot" },
      { value: "2", label: "Video" },
      { value: "3", label: "Artwork" },
    ],
  },
  { key: "file", placeholder: "Select File…", type: "file" },
]

// ─── Main Sheet ───────────────────────────────────────────────────────────────
export function GameDetailSheet({
  gameId,
  coverUrl,
  open,
  onOpenChange,
  onUpdate,
}: Props) {
  const [game, setGame] = useState<GameDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [missionsRowIsOpen, setMissionsRowIsOpen] = useState<string | null>(null)

  // ── Header state ──────────────────────────────────────────────────────────
  const [showTrailerInHeader, setShowTrailerInHeader] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gamedex-header-trailer") === "true"
    }
    return false
  })
  const [headerImageIdx, setHeaderImageIdx] = useState(0)
  const [trailerModalOpen, setTrailerModalOpen] = useState(false)
  const bgVideoRef = useRef<HTMLVideoElement>(null)

  // ── Data loading ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    if (game?.id === gameId) return

    let cancelled = false
    setLoading(true)
    setError(null)

    getGame(gameId)
      .then((data) => {
        if (!cancelled) {
          setGame(data)
          setHeaderImageIdx(0)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Failed to load game details")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, gameId])

  // ── Derived media ─────────────────────────────────────────────────────────
  // type 3 = Trailer (URL returned directly from handleMediaAssetsPath)
  // type 2 = Screenshot
  const trailer = game?.mediaAssets.find((a) => a.type === 3) ?? null
  const screenshots = game?.mediaAssets.filter((a) => a.type === 2) ?? []

  // All background images: cover first, then screenshots
  const headerImages: string[] = [
    ...(coverUrl ? [coverUrl] : []),
    ...screenshots.map((s) => getGameScreenshotUrl(gameId, s.url)),
  ]

  // Image cycling — only when NOT showing trailer in header
  useEffect(() => {
    if (showTrailerInHeader && trailer) return
    if (headerImages.length <= 1) return

    const id = setInterval(() => {
      setHeaderImageIdx((i) => (i + 1) % headerImages.length)
    }, 4000)
    return () => clearInterval(id)
  }, [showTrailerInHeader, trailer, headerImages.length, gameId])

  // ── State helpers ─────────────────────────────────────────────────────────
  const patch = (partial: Partial<GameDetails>) => {
    if (!game) return
    const updated = { ...game, ...partial }
    setGame(updated)
    onUpdate?.(updated)
  }

  const refresh = useCallback(async () => {
    try {
      const data = await getGame(gameId)
      if (data) {
        setGame(data)
        onUpdate?.(data)
      }
    } catch (err) {
      console.error("Refresh failed:", err)
    }
  }, [gameId])

  const optimisticDelete = async <K extends keyof GameDetails>(
    key: K,
    itemId: string,
    apiFn: () => Promise<void>
  ) => {
    if (!game) return
    const original = game[key] as any[]
    patch({ [key]: original.filter((x: any) => x.id !== itemId) } as any)
    try {
      await apiFn()
    } catch (err) {
      console.error(`Delete ${key} failed:`, err)
      await refresh()
    }
  }

  // ── Header toggle ─────────────────────────────────────────────────────────
  const toggleTrailerInHeader = () => {
    const next = !showTrailerInHeader
    setShowTrailerInHeader(next)
    if (typeof window !== "undefined") {
      localStorage.setItem("gamedex-header-trailer", String(next))
    }
  }

  // ── Association handlers ──────────────────────────────────────────────────
  const removeAssociation = async (
    associationId: string,
    key: keyof GameDetails
  ) => {
    patch({
      [key]: (game![key] as any[]).filter(
        (x: any) => x.associationId !== associationId
      ),
    })
    try {
      await deleteAssociation(associationId)
    } catch {
      await refresh()
    }
  }

  const addGenre = async (entity: PickerEntity) => {
    await createAssociation({
      gameId,
      associatedEntityId: entity.id,
      type: ASSOC_GENRE,
    })
    await refresh()
  }

  const addPlatform = async (entity: PickerEntity) => {
    await createAssociation({
      gameId,
      associatedEntityId: entity.id,
      type: ASSOC_PLATFORM,
    })
    await refresh()
  }

  const addModManager = async (entity: PickerEntity) => {
    await createAssociation({
      gameId,
      associatedEntityId: entity.id,
      type: ASSOC_MOD_MANAGER,
    })
    await refresh()
  }

  const addCompany = async (company: PickerEntity, type: AssociationType) => {
    await createAssociation({ gameId, associatedEntityId: company.id, type })
    await refresh()
  }

  // ── Game detail mutations ─────────────────────────────────────────────────
  const handleDescriptionSave = (description: string) => {
    patch({ description })
    updateGameDetails(gameId, { description }).catch(console.error)
  }

  const handleRatingSave =
    (field: "criticRating" | "userRating") => (value: number | null) => {
      if (!game) return
      patch({ [field]: value })
      setGameRatings(gameId, {
        criticRating: field === "criticRating" ? value : game.criticRating,
        userRating: field === "userRating" ? value : game.userRating,
      }).catch(console.error)
    }

  // ── Add handlers ──────────────────────────────────────────────────────────
  const handleAddMission = async (v: Record<string, string>) => {
    await addMission(gameId, {
      title: v.title,
      description: v.description || undefined,
    })
    await refresh()
  }

  const handleAddCharacter = async (v: Record<string, string>) => {
    await addCharacterProfile(gameId, { name: v.name, role: v.role })
    await refresh()
  }

  const handleAddDlc = async (v: Record<string, string>) => {
    await addDlc(gameId, {
      title: v.title,
      releaseDate: v.releaseDate || undefined,
    })
    await refresh()
  }

  const handleAddPerfProfile = async (v: Record<string, string>) => {
    await addPerformanceProfile(gameId, {
      resolution: v.resolution || undefined,
      targetFps: parseInt(v.targetFps) || undefined,
      settingsPreset: v.settingsPreset || undefined,
    })
    await refresh()
  }

  const handleAddRequirement = async (v: Record<string, string>) => {
    await addRequirement(gameId, {
      type: parseInt(v.type) as any,
      os: v.os || undefined,
      cpu: v.cpu || undefined,
      gpu: v.gpu || undefined,
      ramBytes: v.ramGb
        ? Math.round(parseFloat(v.ramGb) * 1073741824)
        : undefined,
      storageBytes: v.storageBytes ? parseInt(v.storageBytes) : undefined,
      additionalNotes: v.additionalNotes || undefined,
    })
    await refresh()
  }

  const handleAddControlMapping = async (v: Record<string, string>) => {
    await addControlMapping(gameId, {
      device: v.device || undefined,
      action: v.action || undefined,
      key: v.key || undefined,
    })
    await refresh()
  }

  const handleAddMediaAsset = async (v: any) => {
    if (!v.file) return
    const type = parseInt(v.type)
    try {
      switch (type) {
        case 1:
          await uploadGameScreenshot(gameId, v.file)
          break
        case 2:
          await uploadGameTrailer(gameId, v.file)
          break
        case 3:
          await updateGameCover(gameId, v.file)
          break
        default:
          await addMediaAsset(gameId, { type, file: v.file })
      }
      await refresh()
    } catch (err) {
      console.error("Upload failed:", err)
    }
  }

  // ── Delete handlers ───────────────────────────────────────────────────────
  const handleDeleteMission = (id: string) =>
    optimisticDelete("missions", id, () => deleteMission(gameId, id))

  const handleDeleteCharacter = (id: string) =>
    optimisticDelete("characterProfiles", id, () =>
      deleteCharacterProfile(gameId, id)
    )

  const handleDeleteDlc = (id: string) =>
    optimisticDelete("dlcs", id, () => deleteDlc(gameId, id))

  const handleDeletePerfProfile = (id: string) =>
    optimisticDelete("performanceProfiles", id, () =>
      deletePerformanceProfile(gameId, id)
    )

  const handleDeleteRequirement = (id: string) =>
    optimisticDelete("requirements", id, () => deleteRequirement(gameId, id))

  const handleDeleteControlMapping = (id: string) =>
    optimisticDelete("controlMappings", id, () =>
      deleteControlMapping(gameId, id)
    )

  const handleDeleteMediaAssets = async ({
    gameId,
    url,
    type,
  }: {
    gameId: string
    url: string
    type: AssetType
  }) => {
    try {
      switch (type) {
        case 1:
          await deleteGameCover(url)
          break
        case 2:
          await deleteScreenshot(gameId, url)
          break
        case 3:
          await deleteTrailer(gameId)
          break
      }
      await refresh()
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  const handleMediaAssetsPath = ({
    gameId,
    url,
    type,
  }: {
    gameId: string
    url: string
    type: AssetType
  }) => {
    switch (type) {
      case 1:
        return getGameCoverUrl(url)
      case 2:
        return getGameScreenshotUrl(gameId, url)
      case 3:
        return url
      default:
        return url
    }
  }

  // ── Nav ───────────────────────────────────────────────────────────────────
  const scrollTo = (id: string) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" })

  const navItems = [
    { id: "sec-info", label: "Info" },
    { id: "sec-media", label: "Media" },
    { id: "sec-genres", label: "Genres" },
    { id: "sec-companies", label: "Companies" },
    { id: "sec-missions", label: "Missions" },
    { id: "sec-chars", label: "Characters" },
    { id: "sec-dlcs", label: "DLCs" },
    { id: "sec-perf", label: "Performance" },
    { id: "sec-req", label: "Requirements" },
    { id: "sec-controls", label: "Controls" },
  ]

  // ── Whether to render trailer in bg ───────────────────────────────────────
  const showBgTrailer = showTrailerInHeader && !!trailer

  return (
    <>
      {/* ── Fullscreen Trailer Modal ── */}
      <AnimatePresence>
        {trailerModalOpen && trailer && (
          <TrailerModal
            url={trailer.url}
            title={game?.title ?? ""}
            onClose={() => setTrailerModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col overflow-hidden border-l border-zinc-800 bg-[#0a0a0b] p-0 sm:max-w-570 lg:min-w-150">
          {/* ── Loading ── */}
          {loading && (
            <div className="flex flex-1 flex-col">
              <LoadingSkeleton />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
              <span className="text-sm text-red-400">{error}</span>
              <button
                onClick={() => {
                  setGame(null)
                  setError(null)
                }}
                className="text-xs text-zinc-500 underline underline-offset-4 transition-colors hover:text-zinc-200"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Content ── */}
          {!loading && !error && game && (
            <>
              {/* ═══════════════════════════════════════════════════════════
                  ENHANCED HERO HEADER
              ═══════════════════════════════════════════════════════════ */}
              <div className="relative h-64 w-full shrink-0 overflow-hidden">

                {/* ── Background Layer ── */}
                {showBgTrailer ? (
                  /* Trailer background */
                  <video
                    ref={bgVideoRef}
                    key={trailer.url}
                    src={trailer.url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  /* Cycling images */
                  <AnimatePresence mode="sync">
                    <motion.img
                      key={`${gameId}-img-${headerImageIdx}`}
                      src={headerImages[headerImageIdx] ?? ""}
                      alt=""
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </AnimatePresence>
                )}

                {/* ── Gradient overlays ── */}
                {/* Bottom-heavy gradient for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/50 to-transparent" />
                {/* Subtle left vignette */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0b]/30 via-transparent to-transparent" />

                {/* ── Top bar: controls ── */}
                <div className="absolute top-3 right-3 left-3 flex items-center justify-between">
                  {/* Image dots indicator (only when showing images) */}
                  {!showBgTrailer && headerImages.length > 1 && (
                    <div className="flex items-center gap-1">
                      {headerImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setHeaderImageIdx(i)}
                          className={`h-1 rounded-full transition-all ${
                            i === headerImageIdx
                              ? "w-4 bg-white/70"
                              : "w-1 bg-white/25 hover:bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Trailer playing badge */}
                  {showBgTrailer && (
                    <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 backdrop-blur-sm">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-400" />
                      </span>
                      <span className="text-[9px] font-semibold tracking-widest text-white/60 uppercase">
                        Trailer
                      </span>
                    </div>
                  )}

                  {/* Settings gear */}
                  <div className="ml-auto">
                    <HeaderSettingsPopover
                      showTrailer={showTrailerInHeader}
                      hasTrailer={!!trailer}
                      onToggle={toggleTrailerInHeader}
                    />
                  </div>
                </div>

                {/* ── Bottom content ── */}
                <div className="absolute right-0 bottom-0 left-0 px-5 pb-4">
                  <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {/* Platform chips */}
                      {game.platforms.length > 0 && (
                        <div className="mb-1.5 flex flex-wrap items-center gap-1">
                          {game.platforms.slice(0, 3).map((p) => (
                            <span
                              key={p.id}
                              className="rounded-sm border border-white/10 bg-white/5 px-1.5 py-0.5 text-[8px] font-semibold tracking-widest text-zinc-400 uppercase backdrop-blur-sm"
                            >
                              {p.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Title */}
                      <h2 className="truncate text-[22px] leading-tight font-bold tracking-tight text-white drop-shadow-sm">
                        {game.title}
                      </h2>

                      {/* Genre dots */}
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        {game.genres.slice(0, 4).map((g, i) => (
                          <React.Fragment key={g.id}>
                            {i > 0 && (
                              <span className="text-[9px] text-zinc-700">·</span>
                            )}
                            <span className="text-[10px] text-zinc-500">
                              {g.name}
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Right column: price + ratings + watch button */}
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {/* Price + Age Rating */}
                      <div className="text-right">
                        {game.priceAmount != null && (
                          <div className="text-base font-bold leading-none text-white">
                            {game.priceCurrency ?? "$"}
                            {game.priceAmount.toFixed(2)}
                          </div>
                        )}
                        {game.ageRating && (
                          <div className="mt-0.5 text-[9px] tracking-widest text-zinc-600 uppercase">
                            {game.ageRating}
                          </div>
                        )}
                      </div>

                      {/* Watch Trailer button — always visible if trailer exists */}
                      {trailer && (
                        <button
                          onClick={() => setTrailerModalOpen(true)}
                          className="group flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/50 px-3 py-1.5 text-[10px] font-semibold tracking-wider text-white/80 uppercase backdrop-blur-sm transition-all hover:border-white/30 hover:bg-black/70 hover:text-white"
                        >
                          <Play className="h-3 w-3 fill-current transition-transform group-hover:scale-110" />
                          Watch Trailer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* ═══════════════════════════════════════════════════════════ */}

              {/* Nav strip */}
              <div className="scrollbar-none flex shrink-0 items-center gap-0.5 overflow-x-auto border-b border-zinc-800/80 px-4 py-2">
                {navItems.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => scrollTo(n.id)}
                    className="rounded-md px-2.5 py-1.5 text-[10px] font-medium tracking-wider whitespace-nowrap text-zinc-500 uppercase transition-colors hover:bg-zinc-800/60 hover:text-zinc-200"
                  >
                    {n.label}
                  </button>
                ))}
              </div>

              {/* Sections */}
              <div className="scrollbar-custom flex-1 space-y-8 overflow-y-auto px-6 py-6">
                {/* ── INFO ── */}
                <div id="sec-info">
                  <Section icon={Layers} title="Overview">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[9px] tracking-widest text-zinc-600 uppercase">
                          Description
                        </span>
                        <InlineField
                          value={game.description}
                          multiline
                          placeholder="No description yet…"
                          onSave={handleDescriptionSave}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-1">
                        {[
                          {
                            label: "Release Date",
                            value: formatDate(game.releaseDate),
                            Icon: Calendar,
                          },
                          {
                            label: "Age Rating",
                            value: String(game.ageRating ?? "—"),
                            Icon: Shield,
                          },
                          {
                            label: "Install Size",
                            value: game.installSizeBytes
                              ? formatBytes(game.installSizeBytes)
                              : "—",
                            Icon: HardDrive,
                          },
                          {
                            label: "Price",
                            value:
                              game.priceAmount != null
                                ? `${game.priceCurrency ?? "$"}${game.priceAmount}`
                                : "—",
                            Icon: DollarSign,
                          },
                        ].map(({ label, value, Icon }) => (
                          <div key={label} className="flex items-center gap-2">
                            <Icon className="h-3 w-3 shrink-0 text-zinc-700" />
                            <div>
                              <div className="text-[9px] tracking-widest text-zinc-600 uppercase">
                                {label}
                              </div>
                              <div className="mt-0.5 font-mono text-xs text-zinc-300">
                                {value}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 pt-1">
                        <RatingBar
                          label="Critic"
                          value={game.criticRating}
                          onSave={handleRatingSave("criticRating")}
                        />
                        <RatingBar
                          label="User"
                          value={game.userRating}
                          onSave={handleRatingSave("userRating")}
                        />
                      </div>
                    </div>
                  </Section>
                </div>

                <div className="h-px bg-zinc-800/60" />

                {/* ── MEDIA ── */}
                <div id="sec-media">
                  <Section
                    icon={Film}
                    title="Media Assets"
                    action={
                      <AddFormToggle
                        fields={MEDIA_ASSET_FIELDS}
                        onSave={handleAddMediaAsset}
                      />
                    }
                  >
                    {game.mediaAssets.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic">
                        No media assets
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {game.mediaAssets.map((a) => (
                          <div
                            key={a.id}
                            className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900"
                          >
                            {a.type === 3 ? (
                              /* Trailer thumbnail with play overlay */
                              <div
                                className="relative h-full w-full cursor-pointer"
                                onClick={() => setTrailerModalOpen(true)}
                              >
                                <video
                                  src={a.url}
                                  className="h-full w-full object-cover"
                                  muted
                                  preload="metadata"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                  <Play className="h-6 w-6 fill-white text-white" />
                                </div>
                              </div>
                            ) : a.url ? (
                              <img
                                src={handleMediaAssetsPath({
                                  gameId: game.id,
                                  url: a.url,
                                  type: a.type as AssetType,
                                })}
                                alt={a.type.toString()}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-[10px] tracking-wider text-zinc-600 uppercase">
                                {a.type}
                              </span>
                            )}
                            <div className="absolute inset-0 flex items-end justify-between bg-black/50 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <span className="truncate text-[10px] text-zinc-300">
                                {a.type === 3 ? "Trailer" : a.type === 2 ? "Screenshot" : a.type === 1 ? "Cover" : a.type}
                              </span>
                              <button
                                onClick={() =>
                                  handleDeleteMediaAssets({
                                    gameId: game.id,
                                    url: a.url,
                                    type: a.type as AssetType,
                                  })
                                }
                                className="shrink-0 text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                </div>

                <div className="h-px bg-zinc-800/60" />

                {/* ── GENRES / PLATFORMS / MOD MANAGERS ── */}
                <div id="sec-genres" className="space-y-5">
                  <Section
                    icon={Layers}
                    title="Genres"
                    action={
                      <EntityPicker
                        fetchFn={listGenres}
                        linkedNames={game.genres.map((g) => g.name)}
                        onSelect={addGenre}
                      />
                    }
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {game.genres.length === 0 ? (
                        <p className="text-xs text-zinc-600 italic">None added</p>
                      ) : (
                        game.genres.map((g) => (
                          <Chip
                            key={g.id}
                            label={g.name}
                            onRemove={() =>
                              removeAssociation(g.associationId, "genres")
                            }
                          />
                        ))
                      )}
                    </div>
                  </Section>

                  <Section
                    icon={Gamepad2}
                    title="Platforms"
                    action={
                      <EntityPicker
                        fetchFn={listPlatforms}
                        linkedNames={game.platforms.map((p) => p.name)}
                        onSelect={addPlatform}
                      />
                    }
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {game.platforms.length === 0 ? (
                        <p className="text-xs text-zinc-600 italic">None added</p>
                      ) : (
                        game.platforms.map((p) => (
                          <Chip
                            key={p.id}
                            label={p.name}
                            onRemove={() =>
                              removeAssociation(p.associationId, "platforms")
                            }
                          />
                        ))
                      )}
                    </div>
                  </Section>

                  <Section
                    icon={Puzzle}
                    title="Mod Managers"
                    action={
                      <EntityPicker
                        fetchFn={fetchModManagers}
                        linkedNames={game.modManagers.map((m) => m.name)}
                        onSelect={addModManager}
                      />
                    }
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {game.modManagers.length === 0 ? (
                        <p className="text-xs text-zinc-600 italic">None added</p>
                      ) : (
                        game.modManagers.map((m) => (
                          <Chip
                            key={m.id}
                            label={m.name}
                            onRemove={() =>
                              removeAssociation(m.associationId, "modManagers")
                            }
                          />
                        ))
                      )}
                    </div>
                  </Section>
                </div>

                <div className="h-px bg-zinc-800/60" />

                {/* ── COMPANIES ── */}
                <div id="sec-companies">
                  <Section
                    icon={Building2}
                    title="Companies"
                    action={
                      <CompanyPicker
                        linkedCompanies={game.companies.map((c) => ({
                          name: c.name,
                          type: c.type as AssociationType,
                        }))}
                        onSelect={addCompany}
                      />
                    }
                  >
                    {game.companies.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic">
                        No companies linked
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {game.companies.map((c) => (
                          <div
                            key={c.id + c.type}
                            className="group flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-zinc-800/40"
                          >
                            <div>
                              <div className="text-xs text-zinc-200">{c.name}</div>
                              <div className="mt-0.5 ml-2 text-[9px] tracking-widest text-zinc-600 uppercase">
                                {AssociationType[c.type as AssociationType]}
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                removeAssociation(c.associationId, "companies")
                              }
                              className="text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                </div>

                <div className="h-px bg-zinc-800/60" />

                {/* ── MISSIONS ── */}
                <div id="sec-missions">
                  <Section
                    icon={Map}
                    title="Missions"
                    action={
                      <AddFormToggle
                        fields={MISSION_FIELDS}
                        onSave={handleAddMission}
                      />
                    }
                  >
                    {game.missions.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic">No missions</p>
                    ) : (
                      <div className="space-y-0.5">
                        {game.missions.map((m) => {
                          const isOpen = missionsRowIsOpen === m.id
                          return (
                            <div
                              key={m.id}
                              className="group flex flex-col rounded-lg px-2 py-2 transition-colors hover:bg-zinc-800/40"
                            >
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() =>
                                    setMissionsRowIsOpen(isOpen ? null : m.id)
                                  }
                                >
                                  <motion.div
                                    animate={{ rotate: isOpen ? 90 : 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronRight className="h-3 w-3 shrink-0 text-zinc-500" />
                                  </motion.div>
                                </button>

                                <div
                                  className="min-w-0 flex-1 cursor-pointer"
                                  onClick={() =>
                                    setMissionsRowIsOpen(isOpen ? null : m.id)
                                  }
                                >
                                  <div className="truncate text-xs font-medium text-zinc-200">
                                    {m.title}
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleDeleteMission(m.id)}
                                  className="text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-red-400"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <AnimatePresence>
                                {isOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{
                                      duration: 0.3,
                                      ease: "easeInOut",
                                    }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-1 ml-6 border-l border-zinc-800 pr-4 pb-2 pl-2 text-[11px] leading-relaxed text-zinc-400">
                                      {m.description || (
                                        <span className="text-zinc-600 italic">
                                          No description
                                        </span>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </Section>
                </div>

                <div className="h-px bg-zinc-800/60" />

                {/* ── CHARACTERS ── */}
                <div id="sec-chars">
                  <Section
                    icon={Users}
                    title="Characters"
                    action={
                      <AddFormToggle
                        fields={CHARACTER_FIELDS}
                        onSave={handleAddCharacter}
                      />
                    }
                  >
                    {game.characterProfiles.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic">No characters</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {game.characterProfiles.map((c) => (
                          <div
                            key={c.id}
                            className="group relative flex flex-col gap-1.5 rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-3 transition-all hover:border-zinc-700"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-[11px] font-semibold text-zinc-400">
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                              <button
                                onClick={() => handleDeleteCharacter(c.id)}
                                className="text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="text-xs font-medium text-zinc-200">
                              {c.name}
                            </div>
                            <div className="text-[9px] tracking-widest text-zinc-600 uppercase">
                              {c.role}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                </div>

                <div className="h-px bg-zinc-800/60" />

                {/* ── DLCs ── */}
                <div id="sec-dlcs">
                  <Section
                    icon={Package}
                    title="DLCs"
                    action={
                      <AddFormToggle
                        fields={DLC_FIELDS}
                        onSave={handleAddDlc}
                      />
                    }
                  >
                    {game.dlcs.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic">No DLCs</p>
                    ) : (
                      <div className="space-y-1.5">
                        {game.dlcs.map((d) => (
                          <div
                            key={d.id}
                            className="group flex items-center justify-between gap-3 rounded-lg border border-zinc-800/40 bg-zinc-900/40 px-2.5 py-2 transition-all hover:border-zinc-700/60"
                          >
                            <div>
                              <div className="text-xs text-zinc-200">
                                {d.title}
                              </div>
                              <div className="mt-0.5 font-mono text-[9px] text-zinc-600">
                                {formatDate(d.releaseDate)}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteDlc(d.id)}
                              className="text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                </div>

                <div className="h-px bg-zinc-800/60" />

                {/* ── PERFORMANCE ── */}
                <div id="sec-perf">
                  <Section
                    icon={Cpu}
                    title="Performance Profiles"
                    action={
                      <AddFormToggle
                        fields={PERF_PROFILE_FIELDS}
                        onSave={handleAddPerfProfile}
                      />
                    }
                  >
                    {game.performanceProfiles.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic">No profiles</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {game.performanceProfiles.map((p) => (
                          <div
                            key={p.id}
                            className="group relative flex flex-col items-center gap-1 rounded-xl border border-zinc-800/50 bg-zinc-900/40 px-2 py-3 text-center transition-all hover:border-zinc-700"
                          >
                            <div className="text-[9px] tracking-widest text-zinc-600 uppercase">
                              {p.settingsPreset}
                            </div>
                            <div className="mt-1 font-mono text-xl leading-none font-bold text-zinc-200">
                              {p.targetFps}
                              <span className="ml-0.5 text-[10px] font-normal text-zinc-600">
                                fps
                              </span>
                            </div>
                            <div className="mt-0.5 text-[10px] text-zinc-500">
                              {p.resolution}
                            </div>
                            <button
                              onClick={() => handleDeletePerfProfile(p.id)}
                              className="absolute top-1.5 right-1.5 text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                </div>

                <div className="h-px bg-zinc-800/60" />

                {/* ── REQUIREMENTS ── */}
                <div id="sec-req">
                  <Section
                    icon={HardDrive}
                    title="System Requirements"
                    action={
                      <AddFormToggle
                        fields={REQUIREMENT_FIELDS}
                        onSave={handleAddRequirement}
                      />
                    }
                  >
                    {game.requirements.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic">
                        No requirements
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-[72px_1fr_1fr_20px] gap-2 border-b border-zinc-800/60 px-1 pb-1">
                          {["Type", "CPU", "GPU", ""].map((h) => (
                            <span
                              key={h}
                              className="text-[9px] tracking-widest text-zinc-600 uppercase"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                        {game.requirements.map((r) => (
                          <div
                            key={r.id}
                            className="group grid grid-cols-[72px_1fr_1fr_20px] items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-zinc-800/30"
                          >
                            <span className="font-mono text-[10px] text-zinc-500 uppercase">
                              {r.type}
                            </span>
                            <span className="truncate text-[11px] text-zinc-400">
                              {r.cpu || "—"}
                            </span>
                            <span className="truncate text-[11px] text-zinc-300">
                              {r.gpu || "—"}
                            </span>
                            <button
                              onClick={() => handleDeleteRequirement(r.id)}
                              className="text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                </div>

                <div className="h-px bg-zinc-800/60" />

                {/* ── CONTROLS ── */}
                <div id="sec-controls">
                  <Section
                    icon={Gamepad2}
                    title="Control Mappings"
                    action={
                      <AddFormToggle
                        fields={CONTROL_FIELDS}
                        onSave={handleAddControlMapping}
                      />
                    }
                  >
                    {game.controlMappings.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic">
                        No controls mapped
                      </p>
                    ) : (
                      <div className="space-y-0.5">
                        {game.controlMappings.map((c) => (
                          <div
                            key={c.id}
                            className="group flex items-center justify-between rounded-md px-1 py-1.5 transition-colors hover:bg-zinc-800/30"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              {c.device && (
                                <span className="shrink-0 text-[9px] tracking-widest text-zinc-600 uppercase">
                                  {c.device}
                                </span>
                              )}
                              <span className="truncate text-xs text-zinc-400">
                                {c.action}
                              </span>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <kbd className="rounded-md border border-zinc-700/80 bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-300">
                                {c.key}
                              </kbd>
                              <button
                                onClick={() => handleDeleteControlMapping(c.id)}
                                className="text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                </div>

                <div className="h-8" />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}