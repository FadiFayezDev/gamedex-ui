"use client"

import { IconPlus } from "@tabler/icons-react"

import { Game } from "@/lib/schemas/game"
import { cn } from "@/lib/utils"
import { GameCard } from "@/components/gamedex/GameCard"
import { ViewMode } from "@/components/gamedex/types"

type GameGridProps = {
  games: Game[]
  view: ViewMode
  onAddClick: () => void
  onUpdateGame: (updated: Partial<Game> & { id: string }) => void
}

export function GameGrid({ games, view, onAddClick, onUpdateGame }: GameGridProps) {
  return (
    <section
      aria-label="Game Gallery"
      className={cn(
        "grid gap-x-6 gap-y-10",
        view === "grid"
          ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
          : "grid-cols-1"
      )}
    >
      {games.map((game) => (
        <GameCard key={game.id} game={game} view={view} onUpdateGame={onUpdateGame} />
      ))}

      {view === "grid" && (
        <article className="flex flex-col group gap-3">
          <button
            aria-label="Add New Game"
            className="w-full aspect-3/4 relative overflow-hidden bg-zinc-900/40 rounded-md border border-dashed border-zinc-800 hover:border-zinc-100 group-hover:bg-zinc-900/60 transition-all duration-300 flex flex-col items-center justify-center"
            type="button"
            onClick={onAddClick}
          >
            <IconPlus
              className="text-zinc-600 group-hover:text-zinc-100 transition-colors"
              size={32}
              strokeWidth={1.5}
            />
          </button>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-100 transition-colors text-center">
            New Collection
          </h3>
        </article>
      )}
    </section>
  )
}
