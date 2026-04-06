"use client"

import * as React from "react"

import { AddGameSheet } from "@/components/gamedex/AddGameSheet"
import { GameGrid } from "@/components/gamedex/GameGrid"
import { LibraryHeader } from "@/components/gamedex/LibraryHeader"
import SidebarFilters from "@/components/gamedex/SidebarFilters"
import { ViewToggle } from "@/components/gamedex/ViewToggle"
import { LibraryFilters, ViewMode } from "@/components/gamedex/types"
import { AddGameInput } from "@/lib/schemas/add-game"
import { Game, Genre, Platform } from "@/lib/schemas/game"
import {
  createGame,
  listGames,
  listGenres,
  listPlatforms,
} from "@/lib/services"
import { FilterContext, FilterProvider } from "../contexts/FilterContext"
import { GameDetailSheet } from "./GameDetailSheet"
import GenreManageSheet from "./GenreManageSheet"
import PlatformManageSheet from "./PlatformManageSheet"
import CompanyManageSheet from "./CompanyManageSheet"

const defaultFilters: LibraryFilters = {
  query: "",
  priceMax: 120,
  storage: "all",
  genreIds: [],
  platformId: "all",
  minRating: 0,
}

export function LibraryPage() {
  const [games, setGames] = React.useState<Game[]>([])
  const [genres, setGenres] = React.useState<Genre[]>([])
  const [platforms, setPlatforms] = React.useState<Platform[]>([])
  const [filters, setFilters] = React.useState<LibraryFilters>(defaultFilters)
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid")

  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [genreSheetOpen, setGenreSheetOpen] = React.useState(false);
  const [platformSheetOpen, setPlatformSheetOpen] = React.useState(false);
  const [companiesSheetOpen, setCompaniesSheetOpen] = React.useState(false);


  React.useEffect(() => {
    let isActive = true

    async function loadData() {
      try {
        const [gamesData, genreData, platformData] = await Promise.all([
          listGames(),
          listGenres(),
          listPlatforms(),
        ])

        if (!isActive) {
          return
        }

        setGames(gamesData)
        setGenres(genreData)
        setPlatforms(platformData)
      } catch (error) {
        if (!isActive) {
          return
        }
        setGames([])
        setGenres([])
        setPlatforms([])
      }
    }

    loadData()

    return () => {
      isActive = false
    }
  }, [])

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
    return games.filter((game) => {
      const query = filters.query.trim().toLowerCase()
      if (query && !game.title.toLowerCase().includes(query)) {
        return false
      }

      const price = game.priceUsd ?? 0
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
  }, [games, filters])

  const handleCreateGame = async (input: AddGameInput) => {
    const newGame = await createGame(input)
    setGames((prev) => [newGame, ...prev])
  }

  return (
    <div className="min-h-svh bg-[#09090b] text-zinc-100">
      <FilterProvider>
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
            />

            <div className="flex-1 overflow-y-auto">
              <div className="sticky z-10 flex items-center justify-between bg-[#09090b]/80 px-8 py-4 backdrop-blur-md">
                <h2 className="text-sm font-medium text-zinc-400">
                  Showing Entire Library
                </h2>
                <ViewToggle value={viewMode} onChange={setViewMode} />
              </div>

              <div className="px-8 pb-10">
                <GameGrid
                  games={filteredGames}
                  view={viewMode}
                  onAddClick={() => setIsSheetOpen(true)}
                />
              </div>
            </div>
          </main>
        </div>
      </FilterProvider>

      <AddGameSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        genres={genres}
        platforms={platforms}
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
    </div>
  )
}