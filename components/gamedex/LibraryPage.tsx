"use client"

import * as React from "react"

import { AddGameSheet } from "@/components/gamedex/AddGameSheet"
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
  const { filterModel } = useContext(FilterContext)
  const [games, setGames] = React.useState<Game[]>([])
  const [filters, setFilters] = React.useState<LibraryFilters>(defaultFilters)
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid")
  const { toast } = useToast()

  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [genreSheetOpen, setGenreSheetOpen] = React.useState(false)
  const [platformSheetOpen, setPlatformSheetOpen] = React.useState(false)
  const [companiesSheetOpen, setCompaniesSheetOpen] = React.useState(false)
  const [modManagerSheetOpen, setModManagerSheetOpen] = React.useState(false)
  const [tagsSheetOpen, setTagsSheetOpen] = React.useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // سنطبع في الكونسول لنرى ما الذي يقرأه المتصفح فعلياً عند الضغط
      console.log(
        "Key pressed:",
        event.key,
        "Ctrl:",
        event.ctrlKey,
        "Alt:",
        event.altKey
      )

      // الاختصار: Alt + S (أقل تعارضاً من Ctrl)
      if (event.altKey && event.key.toLowerCase() === "n") {
        event.preventDefault()
        event.stopPropagation() // لمنع الحدث من الصعود لأي عنصر آخر

        console.log("Success! Shortcut triggered.")
        setIsSheetOpen(true)
      }
    }

    // نستخدم capture: true لضمان التقاط الحدث في مرحلة البداية
    window.addEventListener("keydown", handleKeyDown, true)

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true)
    }
  }, [])

  const fetchGames = React.useCallback(async () => {
    try {
      if (filters.playlistId) {
        const playlist = await getPlaylist(filters.playlistId)
        const playlistGames = (playlist.games ?? []).map((game) =>
          normalizeGame(game)
        )
        setGames(playlistGames)
      } else {
        const gamesData = await sendFilterData(filterModel)
        setGames(gamesData)
      }
    } catch (error) {
      console.error("Failed to fetch games:", error)
      setGames([])
    }
  }, [filterModel, filters.playlistId])

  useEffect(() => {
    fetchGames();
    const handler = () => fetchGames();
    window.addEventListener("playlist-updated", handler);
    return () => window.removeEventListener("playlist-updated", handler);
  }, [fetchGames]);

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      toast("Importing...", "info", "Your library is being updated.")
      await importGame(file)
      toast("Import Successful", "success", "Your library has been updated.")
      await fetchGames()
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
            onGenresClick={() => setGenreSheetOpen(true)} // Placeholder for genre management
            onPlatformsClick={() => setPlatformSheetOpen(true)} // Placeholder for platform management
            onCompaniesClick={() => setCompaniesSheetOpen(true)} // Placeholder for company management
            onModManagerClick={() => setModManagerSheetOpen(true)} // Placeholder for mod manager management
            onTagsClick={() => setTagsSheetOpen(true)} // Placeholder for tag management
            onImportClick={() => fileInputRef.current?.click()}
          />

          <div className="flex-1 overflow-y-auto">
            <div className="sticky z-10 flex items-center justify-between bg-[#09090b]/80 px-8 py-4 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-zinc-400">
                  Showing {filters.playlistId ? "Playlist" : "Entire Library"}
                </h2>
                <PlaylistSelector
                  selectedPlaylistId={filters.playlistId}
                  onSelect={(id) =>
                    setFilters((prev) => ({ ...prev, playlistId: id }))
                  }
                />
              </div>
              <ViewToggle value={viewMode} onChange={setViewMode} />
            </div>

            <div className="px-8 py-2 pb-10">
              <GameGrid
                games={filteredGames}
                view={viewMode}
                onAddClick={() => setIsSheetOpen(true)}
                onUpdateGame={handleUpdateGame}
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
        open={genreSheetOpen} // Placeholder, should be controlled by state
        onOpenChange={setGenreSheetOpen} // Placeholder for genre sheet control
      />

      <PlatformManageSheet
        open={platformSheetOpen} // Placeholder, should be controlled by state
        onOpenChange={setPlatformSheetOpen} // Placeholder for platform sheet control
      />

      <CompanyManageSheet
        open={companiesSheetOpen} // Placeholder, should be controlled by state
        onOpenChange={setCompaniesSheetOpen} // Placeholder for company sheet control
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
