"use client"

import * as React from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { IconPlus } from "@tabler/icons-react"

import { FilterContext } from "@/components/contexts/FilterContext"
import { GameCard } from "@/components/gamedex/GameCard"
import { ViewMode } from "@/components/gamedex/types"
import { Game } from "@/lib/schemas/game"
import { cn } from "@/lib/utils"

type GameGridProps = {
  games: Game[]
  view: ViewMode
  onAddClick: () => void
  onUpdateGame: (updated: Partial<Game> & { id: string }) => void
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
}

const GRID_BREAKPOINTS = {
  lg: 1024,
  xl: 1280,
  xxl: 1536,
}

const getDisplayName = (value: unknown) => {
  if (typeof value === "string") return value.trim()
  if (!value || typeof value !== "object") return undefined

  const name =
    ("name" in value && typeof value.name === "string" ? value.name : undefined) ??
    ("Name" in value && typeof value.Name === "string" ? value.Name : undefined)

  return name?.trim()
}

const uniqueNames = (values: Array<string | undefined>) =>
  Array.from(new Set(values.filter((value): value is string => Boolean(value))))

function getItemsPerRow(view: ViewMode, viewportWidth: number) {
  if (view === "grid") {
    if (viewportWidth >= GRID_BREAKPOINTS.xxl) return 6
    if (viewportWidth >= GRID_BREAKPOINTS.xl) return 4
    if (viewportWidth >= GRID_BREAKPOINTS.lg) return 3
    return 2
  }

  if (view === "tiles") {
    if (viewportWidth >= GRID_BREAKPOINTS.xxl) return 3
    if (viewportWidth >= GRID_BREAKPOINTS.xl) return 2
    return 1
  }

  return 1
}

function getEstimatedRowSize(view: ViewMode) {
  switch (view) {
    case "grid":
      return 430
    case "tiles":
      return 250
    case "list":
      return 130
    case "details":
      return 88
    default:
      return 200
  }
}

function useViewportWidth() {
  const [viewportWidth, setViewportWidth] = React.useState(() =>
    typeof window === "undefined" ? 0 : window.innerWidth
  )

  React.useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return viewportWidth
}

export function GameGrid({
  games,
  view,
  onAddClick,
  onUpdateGame,
  scrollContainerRef,
}: GameGridProps) {
  const { options } = React.useContext(FilterContext)
  const viewportWidth = useViewportWidth()
  const itemsPerRow = React.useMemo(
    () => getItemsPerRow(view, viewportWidth),
    [view, viewportWidth]
  )

  const genreMap = React.useMemo(
    () => new Map(options.genres.map((genre) => [genre.id, genre.name])),
    [options.genres]
  )

  const platformMap = React.useMemo(
    () =>
      new Map(
        options.platforms.map((platform) => [platform.id, platform.name])
      ),
    [options.platforms]
  )

  const tagMap = React.useMemo(
    () => new Map(options.tags.map((tag) => [tag.id, tag.name])),
    [options.tags]
  )

  const rowLayoutClassName = cn(
    view === "grid" &&
      "grid grid-cols-2 gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6",
    view === "tiles" && "grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3",
    view === "list" && "flex flex-col gap-3",
    view === "details" && "flex flex-col gap-2"
  )

  const totalItems = games.length + 1
  const rowCount = Math.ceil(totalItems / itemsPerRow)

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => getEstimatedRowSize(view),
    overscan: view === "grid" ? 2 : 4,
  })

  const renderGridItem = (index: number) => {
    if (index === 0) {
      return <AddGameEntry key="add-game-entry" view={view} onAddClick={onAddClick} />
    }

    const game = games[index - 1]
    if (!game) return null

    const platformNames = uniqueNames(
      game.platforms?.length
        ? game.platforms.map(getDisplayName)
        : game.platformId
          ? [platformMap.get(game.platformId)]
          : []
    )

    const genreNames = uniqueNames(
      game.genres?.length
        ? game.genres.map(getDisplayName)
        : (game.genreIds ?? []).map((id) => genreMap.get(id) ?? id)
    )

    const tagNames = uniqueNames(
      game.tags?.length
        ? game.tags.map(getDisplayName)
        : (game.tagIds ?? []).map((id) => tagMap.get(id) ?? id)
    )

    return (
      <GameCard
        key={game.id}
        game={game}
        view={view}
        platformNames={platformNames}
        genreNames={genreNames}
        tagNames={tagNames}
        onUpdateGame={onUpdateGame}
      />
    )
  }

  return (
    <section aria-label="Game Gallery">
      {view === "details" && (
        <div className="mb-2 hidden items-center rounded-2xl border border-zinc-800/60 bg-zinc-950/30 px-4 py-3 text-[11px] font-bold tracking-[0.24em] text-zinc-500 uppercase md:grid md:grid-cols-[minmax(0,2.4fr)_1fr_1.25fr_0.75fr_0.7fr_0.8fr_0.85fr_auto]">
          <span>Title</span>
          <span>Platform</span>
          <span>Genres</span>
          <span>Size</span>
          <span>Age</span>
          <span>Rating</span>
          <span>Price</span>
          <span className="text-right">Quick</span>
        </div>
      )}

      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * itemsPerRow
          const endIndex = Math.min(startIndex + itemsPerRow, totalItems)

          return (
            <div
              key={virtualRow.key}
              ref={virtualizer.measureElement}
              data-index={virtualRow.index}
              className="absolute left-0 top-0 w-full"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              <div className={rowLayoutClassName}>
                {Array.from({ length: endIndex - startIndex }, (_, offset) =>
                  renderGridItem(startIndex + offset)
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function AddGameEntry({
  view,
  onAddClick,
}: {
  view: ViewMode
  onAddClick: () => void
}) {
  if (view === "grid") {
    return (
      <button
        aria-label="Add New Game"
        className="group flex flex-col gap-3 text-left"
        type="button"
        onClick={onAddClick}
      >
        <div className="relative aspect-3/4 overflow-hidden rounded-[1.35rem] border border-dashed border-zinc-800 bg-zinc-950 p-px transition-all duration-300 hover:-translate-y-1 hover:border-zinc-600 hover:shadow-[0_20px_55px_rgba(0,0,0,0.32)]">
          <div className="flex h-full flex-col rounded-[1.3rem] bg-zinc-950/80">
            <div className="flex items-center justify-between px-3.5 pt-3.5 text-[9px] font-bold tracking-[0.22em] text-zinc-600 uppercase">
              <span>New Slot</span>
              <span>Alt + N</span>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-500 transition-all duration-200 group-hover:border-zinc-600 group-hover:text-zinc-300">
                <IconPlus size={22} strokeWidth={1.6} />
              </div>
              <div className="space-y-1 px-4">
                <p className="text-xs font-semibold text-zinc-300">
                  Add a new game
                </p>
                <p className="text-[10px] leading-relaxed text-zinc-600">
                  Cover, tags, ratings & more
                </p>
              </div>
            </div>
          </div>
        </div>
      </button>
    )
  }

  if (view === "tiles") {
    return (
      <button
        aria-label="Add New Game"
        className="group grid min-h-[216px] grid-cols-[132px_minmax(0,1fr)] gap-4 rounded-[1.75rem] border border-dashed border-zinc-800 bg-zinc-950/40 p-3 text-left transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-950/70 hover:shadow-[0_22px_50px_rgba(0,0,0,0.3)]"
        type="button"
        onClick={onAddClick}
      >
        <div className="flex h-full items-center justify-center rounded-[1.2rem] border border-zinc-800 bg-zinc-950">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-500 transition-all duration-200 group-hover:border-zinc-600 group-hover:text-zinc-300">
            <IconPlus size={22} strokeWidth={1.6} />
          </div>
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-2 py-2">
          <div>
            <span className="text-[9px] font-bold tracking-[0.24em] text-zinc-600 uppercase">
              New Entry
            </span>
            <h3 className="mt-1.5 text-base font-semibold text-zinc-200">
              Add a game
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600">
              Create a record with cover, metadata, ratings, and playlists.
            </p>
          </div>
          <span className="mt-1 w-fit rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-0.5 text-[10px] font-medium text-zinc-500">
            Alt + N
          </span>
        </div>
      </button>
    )
  }

  if (view === "list") {
    return (
      <button
        aria-label="Add New Game"
        className="group flex items-center gap-4 rounded-[1.4rem] border border-dashed border-zinc-800 bg-zinc-950/45 px-4 py-4 text-left transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-950/70"
        type="button"
        onClick={onAddClick}
      >
        <div className="relative h-24 w-[4.6rem] shrink-0 overflow-hidden rounded-[1rem] border border-zinc-800 bg-zinc-950">
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-500 transition-all duration-200 group-hover:border-zinc-600 group-hover:text-zinc-300">
              <IconPlus size={18} strokeWidth={1.6} />
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-200">Add a new game</p>
          <p className="mt-1 text-xs text-zinc-600">
            Cover, tags, ratings, playlists and more
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[10px] font-medium text-zinc-500 md:inline-flex">
          Alt + N
        </span>
      </button>
    )
  }

  return (
    <button
      aria-label="Add New Game"
      className="grid rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/35 px-4 py-3 text-left transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-950/60 md:grid-cols-[minmax(0,2.4fr)_1fr_1.25fr_0.75fr_0.7fr_0.8fr_0.85fr_auto] md:items-center"
      type="button"
      onClick={onAddClick}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-12 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950">
          <IconPlus size={16} strokeWidth={1.6} className="text-zinc-500" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-300">
            Add a new game
          </p>
          <p className="mt-0.5 text-[10px] text-zinc-600">New library entry</p>
        </div>
      </div>
      <span className="mt-2 text-xs text-zinc-600 md:mt-0">â€”</span>
      <span className="hidden text-xs text-zinc-600 md:block">â€”</span>
      <span className="hidden text-xs text-zinc-600 md:block">â€”</span>
      <span className="hidden text-xs text-zinc-600 md:block">â€”</span>
      <span className="hidden text-xs text-zinc-600 md:block">â€”</span>
      <span className="hidden text-xs font-medium text-zinc-500 md:block">â€”</span>
      <span className="mt-2 inline-flex justify-end text-right md:mt-0">
        <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-0.5 text-[10px] font-medium text-zinc-500">
          Alt + N
        </span>
      </span>
    </button>
  )
}
