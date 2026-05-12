"use client"

import * as React from "react"

import dynamic from "next/dynamic"

const AddGameSheet = dynamic(
  () => import("@/components/gamedex/AddGameSheet").then((mod) => mod.AddGameSheet),
  { ssr: false }
)
import { GameGrid } from "@/components/gamedex/GameGrid"
import { LibraryHeader } from "@/components/gamedex/LibraryHeader"
import SidebarFilters from "@/components/gamedex/SidebarFilters"
import { ViewToggle } from "@/components/gamedex/ViewToggle"
import { LibraryFilters, ViewMode } from "@/components/gamedex/types"
import { AddGameInput } from "@/lib/schemas/add-game"
import { Game } from "@/lib/schemas/game"
import { createGame } from "@/lib/services"
import { FilterContext } from "../contexts/FilterContext"
import { useToast } from "@/components/contexts/ToastContext"
import GenreManageSheet from "./GenreManageSheet"
import PlatformManageSheet from "./PlatformManageSheet"
import CompanyManageSheet from "./CompanyManageSheet"
import ModManagerManageSheet from "./Modmanagermanagesheet"
import TagManageSheet from "./TagManageSheet"
import { useContext, useEffect } from "react"
import { sendFilterData, importGame, normalizeGame } from "@/lib/services/games"
import { PlaylistSelector } from "@/components/gamedex/PlaylistSelector"
import { getPlaylist } from "@/lib/services/playlist"
import { cn } from "@/lib/utils"
import { usePlaylistContext } from "@/components/contexts/PlaylistContext"

const defaultFilters: LibraryFilters = {
  query: "",
  priceMax: 120,
  storage: "all",
  genreIds: [],
  platformId: "all",
  minRating: 0,
  playlistId: null,
}

export function LibraryPage() {
  const { filterModel, refreshOptions } = useContext(FilterContext)
  const { version: playlistsVersion } = usePlaylistContext()
  const [games, setGames] = React.useState<Game[]>([])
  const [filters, setFilters] = React.useState<LibraryFilters>(defaultFilters)
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid")
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()

  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [genreSheetOpen, setGenreSheetOpen] = React.useState(false)
  const [platformSheetOpen, setPlatformSheetOpen] = React.useState(false)
  const [companiesSheetOpen, setCompaniesSheetOpen] = React.useState(false)
  const [modManagerSheetOpen, setModManagerSheetOpen] = React.useState(false)
  const [tagsSheetOpen, setTagsSheetOpen] = React.useState(false)
  const activeRequestRef = React.useRef<AbortController | null>(null)
  const requestIdRef = React.useRef(0)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const selectedPlaylistVersion = filters.playlistId ? playlistsVersion : 0

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === "n") {
        event.preventDefault()
        event.stopPropagation()
        setIsSheetOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown, true)
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true)
    }
  }, [])

  const fetchGames = React.useCallback(async () => {
    activeRequestRef.current?.abort()
    const controller = new AbortController()
    const requestId = ++requestIdRef.current
    activeRequestRef.current = controller
    setIsLoading(true)

    try {
      if (filters.playlistId) {
        const playlist = await getPlaylist(filters.playlistId, controller.signal)
        const playlistGames = (playlist.games ?? []).map((game) =>
          normalizeGame(game)
        )
        if (controller.signal.aborted || requestId !== requestIdRef.current) {
          return
        }
        setGames(playlistGames)
      } else {
        const gamesData = await sendFilterData(filterModel, controller.signal)
        if (controller.signal.aborted || requestId !== requestIdRef.current) {
          return
        }
        setGames(gamesData)
      }
    } catch (error) {
      if (controller.signal.aborted || requestId !== requestIdRef.current) {
        return
      }
      console.error("Failed to fetch games:", error)
      setGames([])
    } finally {
      if (!controller.signal.aborted && requestId === requestIdRef.current) {
        setIsLoading(false)
      }
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null
      }
    }
  }, [filterModel, filters.playlistId])

  useEffect(() => {
    void fetchGames()

    return () => {
      activeRequestRef.current?.abort()
      activeRequestRef.current = null
    }
  }, [fetchGames, selectedPlaylistVersion])

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      toast("Importing...", "info", "Your library is being updated.")
      await importGame(file)
      toast("Import Successful", "success", "Your library has been updated.")
      await Promise.all([fetchGames(), refreshOptions()])
    } catch (error: unknown) {
      console.error("Import failed:", error)
      const message =
        error instanceof Error ? error.message : "Something went wrong."
      if (message === "ALREADY_EXISTS") {
        toast(
          "Game Already Exists",
          "warning",
          "This game is already in your library collection."
        )
      } else {
        toast("Import Failed", "error", message)
      }
    } finally {
      if (e.target) e.target.value = ""
    }
  }

  const stats = React.useMemo(() => {
    const favorites = games.filter((game) => game.isFavorite).length
    const played = games.filter((game) => game.isPlayed).length
    return {
      total: games.length,
      favorites,
      played,
    }
  }, [games])

  const filteredGames = React.useMemo(() => {
    const result = games.filter((game) => {
      const query = filters.query.trim().toLowerCase()
      if (query && !game.title.toLowerCase().includes(query)) {
        return false
      }

      const price = game.priceAmount ?? 0
      if (price > filters.priceMax) {
        return false
      }

      if (filters.storage !== "all") {
        const size = game.installSizeGb ?? 0
        if (filters.storage === "lt10" && size >= 10) {
          return false
        }
        if (filters.storage === "10-50" && (size < 10 || size > 50)) {
          return false
        }
        if (filters.storage === "50-100" && (size < 50 || size > 100)) {
          return false
        }
      }

      if (filters.genreIds.length > 0) {
        const matchesGenre = filters.genreIds.some((id) =>
          game.genreIds.includes(id)
        )
        if (!matchesGenre) {
          return false
        }
      }

      if (
        filters.platformId !== "all" &&
        game.platformId !== filters.platformId
      ) {
        return false
      }

      if (filters.minRating > 0 && (game.rating ?? 0) < filters.minRating) {
        return false
      }

      return true
    })

    // Sorting logic
    const sortBy = filterModel?.sortBy ?? "name"
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title)
        case "priceLowerToHigher":
          return (a.priceAmount ?? 0) - (b.priceAmount ?? 0)
        case "priceHigherToLower":
          return (b.priceAmount ?? 0) - (a.priceAmount ?? 0)
        case "sizeLowerToHigher":
          return (a.installSizeGb ?? 0) - (b.installSizeGb ?? 0)
        case "sizeHigherToLower":
          return (b.installSizeGb ?? 0) - (a.installSizeGb ?? 0)
        default:
          return 0
      }
    })
  }, [games, filters, filterModel?.sortBy])

  const handleCreateGame = async (input: AddGameInput) => {
    try {
      const newGame = await createGame(input)
      setGames((prev) => [newGame, ...prev])
      toast("Game Added", "success", `"${input.title}" was successfully added.`)
    } catch (error) {
      console.error("Failed to create game:", error)
      toast("Error", "error", "Failed to create new game.")
    }
  }

  const handleUpdateGame = React.useCallback(
    (updatedFields: Partial<Game> & { id: string }) => {
      setGames((prev) =>
        prev.map((g) =>
          g.id === updatedFields.id ? { ...g, ...updatedFields } : g
        )
      )
      toast("Library Updated", "info")
    },
    [toast]
  )

  return (
    <div className="min-h-svh bg-[#09090b] text-zinc-100">
      <div className="flex h-svh overflow-hidden">
        {/* Sidebar Filters */}
        <SidebarFilters />

        {/* Main */}
        <main className="flex h-full flex-1 flex-col overflow-hidden">
          <LibraryHeader
            stats={stats}
            onAddClick={() => setIsSheetOpen(true)}
            onGenresClick={() => setGenreSheetOpen(true)}
            onPlatformsClick={() => setPlatformSheetOpen(true)}
            onCompaniesClick={() => setCompaniesSheetOpen(true)}
            onModManagerClick={() => setModManagerSheetOpen(true)}
            onTagsClick={() => setTagsSheetOpen(true)}
            onImportClick={() => fileInputRef.current?.click()}
          />

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto relative"
          >
            {/* Loading Indicator Bar */}
            {isLoading && (
              <div className="absolute top-0 left-0 right-0 z-50 h-[2px] overflow-hidden bg-sky-500/10">
                <div className="h-full w-full bg-sky-500 animate-loading-bar" />
              </div>
            )}

            <div className="sticky top-0 z-20 flex h-10 items-center justify-between border-b border-zinc-800/60 bg-[#09090b]/80 px-5 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-600">
                  {filters.playlistId ? "Playlist" : "Library"}
                </span>
                <span className="h-0.5 w-0.5 rounded-full bg-zinc-800" />
                <PlaylistSelector
                  selectedPlaylistId={filters.playlistId}
                  onSelect={(id) =>
                    setFilters((prev) => ({ ...prev, playlistId: id }))
                  }
                />
              </div>
              <ViewToggle value={viewMode} onChange={setViewMode} />
            </div>

            <div className={cn("px-5 py-4 pb-10 transition-opacity duration-500", isLoading ? "opacity-40" : "opacity-100")}>
              <GameGrid
                games={filteredGames}
                view={viewMode}
                onAddClick={() => setIsSheetOpen(true)}
                onUpdateGame={handleUpdateGame}
                scrollContainerRef={scrollContainerRef}
              />
            </div>
          </div>
        </main>
      </div>

      <AddGameSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onCreate={handleCreateGame}
      />

      <GenreManageSheet
        open={genreSheetOpen}
        onOpenChange={setGenreSheetOpen}
      />

      <PlatformManageSheet
        open={platformSheetOpen}
        onOpenChange={setPlatformSheetOpen}
      />

      <CompanyManageSheet
        open={companiesSheetOpen}
        onOpenChange={setCompaniesSheetOpen}
      />

      <ModManagerManageSheet
        open={modManagerSheetOpen}
        onOpenChange={setModManagerSheetOpen}
      />

      <TagManageSheet
        open={tagsSheetOpen}
        onOpenChange={setTagsSheetOpen}
      />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        className="hidden"
        accept=".gdex"
      />
    </div>
  )
}
