"use client"

import { Button } from "@/components/ui/button"
import { LibraryStats } from "@/lib/schemas/game"
import { Building2, Gamepad2, MonitorSmartphone, PackageSearch, Plus } from "lucide-react"

type LibraryHeaderProps = {
  stats: LibraryStats
  onAddClick: () => void
  onGenresClick: () => void
  onPlatformsClick?: () => void
  onCompaniesClick?: () => void
  onModManagerClick?: () => void
}

export function LibraryHeader({ stats, onAddClick, onGenresClick, onPlatformsClick, onCompaniesClick, onModManagerClick }: LibraryHeaderProps) {
  return (
    <header className="p-8 pb-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-end justify-between gap-6 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-20">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div
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
          </div>
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
      <div className="flex items-center gap-3">
    <Plus 
    size={20} 
    className="cursor-pointer text-zinc-400 transition-all duration-200 hover:text-white hover:scale-110" 
    onClick={onAddClick}
  />

  {/* Genres Button */}
  <Gamepad2 
    size={20} 
    className="cursor-pointer text-zinc-400 transition-all duration-200 hover:text-white hover:scale-110" 
    onClick={onGenresClick}
  />

  {/* Platforms Button */}
  <MonitorSmartphone 
    size={20} 
    className="cursor-pointer text-zinc-400 transition-all duration-200 hover:text-white hover:scale-110" 
    onClick={onPlatformsClick}
  />

  {/* Companies Button */}
  <Building2 
    size={20} 
    className="cursor-pointer text-zinc-400 transition-all duration-200 hover:text-white hover:scale-110" 
    onClick={onCompaniesClick}
  />

  {/* Mod Manager Button */}
  <PackageSearch 
    size={20} 
    className="cursor-pointer text-zinc-400 transition-all duration-200 hover:text-white hover:scale-110" 
    onClick={onModManagerClick}
  />
        <div className="ml-4 h-10 w-10 rounded-full border border-zinc-800 p-0.5 overflow-hidden">
          <img
            alt="User profile"
            className="w-full h-full object-cover rounded-full"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjzv6r1sIWmZKaV_2Wm1dQkdXjYPwo1M10unGaiUXEMusUQ73HPANLLoqCfp4U0m4VHOLDS6-a-RrF95Tbl3ecSJ0Z8mb-OVZem4tOJSSSsnxIQQKgUgQ-h-ziRA23s2TMcAIfxxhsx05KJzcvOtnh5KEpEwic4qFzur5eq1k9MGJ1SmQd8r05ywnZ6Zn7qGeCYW39KMmZNkDltzeOLRuhkAEXXw4R0FNtUfJrqFCsE1ji0xWGDTvyDuKDuH8R9sQ5zqPH7nouA1t5"
          />
        </div>
      </div>
    </header>
  )
}
