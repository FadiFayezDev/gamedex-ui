"use client"

import * as React from "react"
import { Game } from "@/lib/schemas/game"
import { cn } from "@/lib/utils"
import { ViewMode } from "@/components/gamedex/types"
import { GameDetailSheet } from "@/components/gamedex/GameDetailSheet"
import { getGameCoverUrl } from "@/lib/services/games"
import { useEffect, useState } from "react"

type GameCardProps = {
  game: Game
  view: ViewMode
}

export function GameCard({ game, view }: GameCardProps) {

  const [coverUrl, setCoverUrl] = useState<string>("");

// في الـ Render:
<img src={coverUrl || "/fallback-image.png"} />

  const isList = view === "list"
  const [sheetOpen, setSheetOpen] = React.useState(false)
  game.coverUrl = 'witcher_cover.jpg';
  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={() => setSheetOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && setSheetOpen(true)}
        className={cn(
          "game-item flex gap-3 group cursor-pointer",
          isList
            ? "flex-row items-center border-b border-zinc-800 pb-4"
            : "flex-col"
        )}
      >
        <div
          className={cn(
            "game-cover relative overflow-hidden bg-zinc-900 rounded-md border border-zinc-800 group-hover:border-zinc-100 transition-all duration-300",
            isList ? "size-20 shrink-0" : "aspect-3/4"
          )}
        >
          {game.coverUrl ? (
            <img
              alt={game.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src={getGameCoverUrl(game.id)}
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-zinc-800 via-zinc-900 to-black" />
          )}
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <h3
            className={cn(
              "text-sm font-medium text-zinc-100 group-hover:underline underline-offset-4 truncate",
              isList && "text-base"
            )}
          >
            {game.title}
          </h3>
          {!isList && game.priceUsd != null && (
            <span className="text-xs text-zinc-500 mt-1">${game.priceUsd}</span>
          )}
        </div>
      </article>

      {/* Sheet يتعمل render دايمًا لما الكرت يتضغط — هو اللي بيعمل fetch */}
      <GameDetailSheet
        gameId={game.id}
        coverUrl={game.coverUrl ?? undefined}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  )
}