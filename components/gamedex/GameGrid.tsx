"use client"

import * as React from "react"
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

export function GameGrid({
  games,
  view,
  onAddClick,
  onUpdateGame,
}: GameGridProps) {
  const { options } = React.useContext(FilterContext)

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

  const layoutClassName = cn(
    view === "grid" &&
      "grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6",
    view === "tiles" && "grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3",
    view === "list" && "flex flex-col gap-3",
    view === "details" && "flex flex-col gap-2"
  )

  return (
    <section aria-label="Game Gallery" className={layoutClassName}>
      <AddGameEntry view={view} onAddClick={onAddClick} />

      {view === "details" && (
        <div className="hidden items-center rounded-2xl border border-zinc-800/60 bg-zinc-950/30 px-4 py-3 text-[11px] font-bold tracking-[0.24em] text-zinc-500 uppercase md:grid md:grid-cols-[minmax(0,2.4fr)_1fr_1.25fr_0.75fr_0.7fr_0.8fr_0.85fr_auto]">
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

      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          view={view}
          platformNames={
            uniqueNames(
              game.platforms?.length
                ? game.platforms.map(getDisplayName)
                : game.platformId
                  ? [platformMap.get(game.platformId)]
                  : []
            )
          }
          genreNames={
            uniqueNames(
              game.genres?.length
                ? game.genres.map(getDisplayName)
                : (game.genreIds ?? []).map((id) => genreMap.get(id) ?? id)
            )
          }
          tagNames={
            uniqueNames(
              game.tags?.length
                ? game.tags.map(getDisplayName)
                : (game.tagIds ?? []).map((id) => tagMap.get(id) ?? id)
            )
          }
          onUpdateGame={onUpdateGame}
        />
      ))}
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
        <div className="relative aspect-3/4 overflow-hidden rounded-[1.6rem] border border-dashed border-zinc-700 bg-[radial-gradient(circle_at_top,#1f2937_0%,#111827_35%,#09090b_100%)] p-3 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/60 hover:shadow-[0_18px_50px_rgba(14,165,233,0.14)]">
          <div className="flex h-full flex-col rounded-[1.1rem] border border-white/6 bg-white/4 p-4">
            <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.24em] text-zinc-500 uppercase">
              <span>New Slot</span>
              <span>Alt + N</span>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-sky-300 transition-colors group-hover:text-white">
                <IconPlus size={30} strokeWidth={1.7} />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-white">
                  Add a new game
                </p>
                <p className="text-sm leading-6 text-zinc-400">
                  Start a fresh entry with cover, price, tags, and library data.
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
        className="group grid min-h-54 grid-cols-[132px_minmax(0,1fr)] gap-4 overflow-hidden rounded-[1.75rem] border border-dashed border-zinc-700 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(17,24,39,0.92),rgba(3,7,18,0.98))] p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-400/60 hover:shadow-[0_18px_50px_rgba(14,165,233,0.14)]"
        type="button"
        onClick={onAddClick}
      >
        <div className="flex h-full items-center justify-center rounded-[1.2rem] border border-white/8 bg-white/5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-sky-400/10 text-sky-300 transition-colors group-hover:bg-sky-400/20 group-hover:text-white">
            <IconPlus size={32} strokeWidth={1.7} />
          </div>
        </div>
        <div className="flex min-w-0 flex-col justify-between py-2">
          <div>
            <span className="text-[10px] font-bold tracking-[0.26em] text-zinc-500 uppercase">
              Quick Create
            </span>
            <h3 className="mt-2 text-xl font-semibold text-white">
              Add a game card
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
              Perfect for fast importing or manual curation when you want the
              new title visible immediately.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-zinc-300">
            <span className="rounded-full border border-zinc-700 bg-zinc-900/70 px-3 py-1">
              Cover-ready
            </span>
            <span className="rounded-full border border-zinc-700 bg-zinc-900/70 px-3 py-1">
              Smart metadata
            </span>
            <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-sky-200">
              Alt + N
            </span>
          </div>
        </div>
      </button>
    )
  }

  if (view === "list") {
    return (
      <button
        aria-label="Add New Game"
        className="group flex items-center gap-4 rounded-[1.4rem] border border-dashed border-zinc-700 bg-zinc-950/55 px-4 py-4 text-left transition-all duration-300 hover:border-sky-400/60 hover:bg-zinc-950 hover:shadow-[0_18px_50px_rgba(14,165,233,0.1)]"
        type="button"
        onClick={onAddClick}
      >
        <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-sky-400/10 text-sky-300 transition-colors group-hover:text-white">
          <IconPlus size={28} strokeWidth={1.7} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-white">
                Add a new library entry
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Create a title with metadata, ratings, playlists, and cover art.
              </p>
            </div>
            <span className="hidden rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold text-sky-200 md:inline-flex">
              Alt + N
            </span>
          </div>
        </div>
      </button>
    )
  }

  return (
    <button
      aria-label="Add New Game"
      className="grid rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/55 px-4 py-4 text-left transition-all duration-300 hover:border-sky-400/60 hover:bg-zinc-950 hover:shadow-[0_18px_50px_rgba(14,165,233,0.08)] md:grid-cols-[minmax(0,2.4fr)_1fr_1.25fr_0.75fr_0.7fr_0.8fr_0.85fr_auto] md:items-center"
      type="button"
      onClick={onAddClick}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-sky-400/10 text-sky-300">
          <IconPlus size={22} strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            Add a new game
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Create a fresh library record
          </p>
        </div>
      </div>
      <span className="mt-3 text-xs text-zinc-500 md:mt-0">Manual</span>
      <span className="hidden text-xs text-zinc-500 md:block">
        Cover, rating, tags
      </span>
      <span className="hidden text-xs text-zinc-500 md:block">Now</span>
      <span className="hidden text-xs text-zinc-500 md:block">—</span>
      <span className="hidden text-xs text-zinc-500 md:block">Ready</span>
      <span className="hidden text-xs font-medium text-sky-200 md:block">
        Alt + N
      </span>
      <span className="mt-3 text-right text-xs text-zinc-500 md:mt-0">
        Quick create
      </span>
    </button>
  )
}
