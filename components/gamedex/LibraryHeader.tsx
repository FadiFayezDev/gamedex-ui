"use client"

import { LibraryStats } from "@/lib/schemas/game"
import {
  Building2,
  Gamepad2,
  MonitorSmartphone,
  PackageSearch,
  Plus,
  UploadCloud,
  Tags,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

type LibraryHeaderProps = {
  stats: LibraryStats
  onAddClick: () => void
  onGenresClick: () => void
  onPlatformsClick?: () => void
  onCompaniesClick?: () => void
  onModManagerClick?: () => void
  onTagsClick?: () => void
  onImportClick?: () => void
}

export function LibraryHeader({
  stats,
  onAddClick,
  onGenresClick,
  onPlatformsClick,
  onCompaniesClick,
  onModManagerClick,
  onTagsClick,
  onImportClick,
}: LibraryHeaderProps) {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("http://localhost:7231/health")
        const text = await res.text()
        setIsHealthy(text.trim() === "Healthy")
      } catch {
        setIsHealthy(false)
      }
    }
    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="shrink-0 border-b border-zinc-800/70 bg-[#09090b]">
      <div className="flex h-12 items-center justify-between gap-4 px-5">

        {/* Left: Brand + health dot + stats */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-bold tracking-tight text-zinc-100">
              GameDex
            </span>
            <span
              title={
                isHealthy === true
                  ? "API Online"
                  : isHealthy === false
                  ? "API Offline"
                  : "Checking…"
              }
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors duration-500",
                isHealthy === true
                  ? "bg-emerald-500 animate-health-pulse"
                  : isHealthy === false
                  ? "bg-red-500"
                  : "bg-zinc-600"
              )}
            />
          </div>

          {/* Vertical divider */}
          <div className="h-4 w-px bg-zinc-800 shrink-0" />

          {/* Stats */}
          <div className="flex items-center gap-3 min-w-0">
            <Stat label="Total" value={stats.total} />
            <Dot />
            <Stat label="Favorites" value={stats.favorites} />
            <Dot />
            <Stat label="Played" value={stats.played} />
          </div>
        </div>

        {/* Right: Actions toolbar */}
        <div className="flex items-center gap-1 shrink-0 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
          {/* Primary: Add */}
          <ToolbarBtn
            icon={<Plus className="h-3.5 w-3.5" />}
            label="Add Game"
            onClick={onAddClick}
            primary
          />

          <div className="h-4 w-px bg-zinc-800 mx-0.5" />

          <ToolbarBtn icon={<Gamepad2 className="h-3.5 w-3.5" />} label="Genres" onClick={onGenresClick} />
          <ToolbarBtn icon={<MonitorSmartphone className="h-3.5 w-3.5" />} label="Platforms" onClick={onPlatformsClick} />
          <ToolbarBtn icon={<Building2 className="h-3.5 w-3.5" />} label="Companies" onClick={onCompaniesClick} />
          <ToolbarBtn icon={<PackageSearch className="h-3.5 w-3.5" />} label="Mods" onClick={onModManagerClick} />
          <ToolbarBtn icon={<Tags className="h-3.5 w-3.5" />} label="Tags" onClick={onTagsClick} />

          <div className="h-4 w-px bg-zinc-800 mx-0.5" />

          <ToolbarBtn icon={<UploadCloud className="h-3.5 w-3.5" />} label="Import" onClick={onImportClick} />
        </div>
      </div>
    </header>
  )
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex items-baseline gap-1 text-[10px] font-medium text-zinc-500">
      <span className="font-bold tabular-nums text-zinc-200">{value}</span>
      {label}
    </span>
  )
}

function Dot() {
  return <span aria-hidden className="h-0.5 w-0.5 rounded-full bg-zinc-700" />
}

function ToolbarBtn({
  icon,
  label,
  onClick,
  primary = false,
}: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  primary?: boolean
}) {
  if (!onClick) return null
  return (
    <button
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150 active:scale-90",
        primary
          ? "bg-zinc-100 text-zinc-900 hover:bg-white"
          : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
      )}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </button>
  )
}
