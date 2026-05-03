"use client"

import { Button } from "@/components/ui/button"
import { LibraryStats } from "@/lib/schemas/game"
import { Building2, Gamepad2, MonitorSmartphone, PackageSearch, Plus, UploadCloud, Tags } from "lucide-react"
import { cn } from "@/lib/utils"

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

export function LibraryHeader({ stats, onAddClick, onGenresClick, onPlatformsClick, onCompaniesClick, onModManagerClick, onTagsClick, onImportClick }: LibraryHeaderProps) {
  return (
    <header className="p-8 pb-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-end justify-between gap-6 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-20">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {/* <div
            aria-hidden="true"
            className="w-10 h-10 bg-zinc-100 flex items-center justify-center rounded-lg shadow-sm"
          >
            <svg
              className="text-zinc-950"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              width="24"
            >
              <circle cx="12" cy="12" r="8" />
              <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
            </svg>
          </div> */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">GameDex</h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                <span className="text-[#3b82f6] font-bold">{stats.total}</span>{" "}
                Total
              </span>
              <span aria-hidden="true" className="w-1 h-1 rounded-full bg-zinc-800" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                <span className="text-[#3b82f6] font-bold">
                  {stats.favorites}
                </span>{" "}
                Favorites
              </span>
              <span aria-hidden="true" className="w-1 h-1 rounded-full bg-zinc-800" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                <span className="text-[#3b82f6] font-bold">{stats.played}</span>{" "}
                Played
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Actions Toolbar */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl shadow-xl shadow-black/20">
          <HeaderButton 
            icon={<Plus className="w-5 h-5" />} 
            label="Add Game" 
            onClick={onAddClick}
            variant="primary"
          />
          
          <div className="w-px h-6 bg-zinc-800 mx-1" />

          <HeaderButton 
            icon={<Gamepad2 className="w-5 h-5" />} 
            label="Genres" 
            onClick={onGenresClick} 
          />
          <HeaderButton 
            icon={<MonitorSmartphone className="w-5 h-5" />} 
            label="Platforms" 
            onClick={onPlatformsClick} 
          />
          <HeaderButton 
            icon={<Building2 className="w-5 h-5" />} 
            label="Companies" 
            onClick={onCompaniesClick} 
          />
          <HeaderButton 
            icon={<PackageSearch className="w-5 h-5" />} 
            label="Mods" 
            onClick={onModManagerClick} 
          />
          <HeaderButton 
            icon={<Tags className="w-5 h-5" />} 
            label="Tags" 
            onClick={onTagsClick} 
          />
          <HeaderButton 
            icon={<UploadCloud className="w-5 h-5" />} 
            label="Import" 
            onClick={onImportClick} 
          />
        </div>

        {/* <div className="h-10 w-10 rounded-full border-2 border-zinc-800 p-0.5 overflow-hidden hover:border-zinc-700 transition-colors cursor-pointer ring-offset-2 ring-offset-[#09090b] hover:ring-2 ring-zinc-800">
          <img
            alt="User profile"
            className="w-full h-full object-cover rounded-full"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjzv6r1sIWmZKaV_2Wm1dQkdXjYPwo1M10unGaiUXEMusUQ73HPANLLoqCfp4U0m4VHOLDS6-a-RrF95Tbl3ecSJ0Z8mb-OVZem4tOJSSSsnxIQQKgUgQ-h-ziRA23s2TMcAIfxxhsx05KJzcvOtnh5KEpEwic4qFzur5eq1k9MGJ1SmQd8r05ywnZ6Zn7qGeCYW39KMmZNkDltzeOLRuhkAEXXw4R0FNtUfJrqFCsE1ji0xWGDTvyDuKDuH8R9sQ5zqPH7nouA1t5"
          />
        </div> */}
      </div>
    </header>
  )
}

function HeaderButton({ 
  icon, 
  label, 
  onClick, 
  variant = "secondary" 
}: { 
  icon: React.ReactNode, 
  label: string, 
  onClick?: () => void,
  variant?: "primary" | "secondary"
}) {
  if (!onClick) return null;

  return (
    <button
      title={label}
      onClick={onClick}
      className={cn(
        "relative group p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center",
        "active:scale-90",
        variant === "primary" 
          ? "text-sky-400 hover:text-sky-300 hover:bg-sky-500/10" 
          : "text-zinc-400 hover:text-white hover:bg-white/5"
      )}
    >
      <div className="transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <span className="sr-only">{label}</span>
      
      {/* Subtle indicator for primary action */}
      {variant === "primary" && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-sky-500 rounded-full border-2 border-[#09090b] shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
      )}
    </button>
  )
}
