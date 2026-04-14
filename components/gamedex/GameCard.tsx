"use client"

import * as React from "react"
import { Game } from "@/lib/schemas/game"
import { cn } from "@/lib/utils"
import { ViewMode } from "@/components/gamedex/types"
import { GameDetailSheet } from "@/components/gamedex/sheets/GameDetail/GameDetailSheet"
import { getGameCoverUrl } from "@/lib/services/games"
import { AddToPlaylistButton } from "@/components/gamedex/AddToPlaylistButton"
import { useEffect, useState } from "react"
import { Star, DollarSign } from "lucide-react"

type GameCardProps = {
  game: Game
  view: ViewMode
}

export function GameCard({ game, view }: GameCardProps) {
  const isList = view === "list"
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [imgError, setImgError] = useState(false)

  const priceFormatted =
    game.priceAmount != null
      ? `${game.priceCurrency ?? "$"}${game.priceAmount.toFixed(2)}`
      : "Free"

  // Use userRating as primary, rating as secondary, criticRating as fallback, or NR
  const displayRating = game.userRating ?? game.rating ?? game.criticRating ?? 0
  const hasRating = displayRating > 0

  // The cover exists if we have a URL/Path, or if it was previously set
  const hasCover = !!game.coverUrl && !imgError

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={() => setSheetOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && setSheetOpen(true)}
        className={cn(
          "game-item group flex cursor-pointer gap-3",
          isList
            ? "flex-row items-center border-b border-zinc-800 pb-4"
            : "flex-col"
        )}
      >
        <div
          className={cn(
            "game-cover relative overflow-hidden rounded-md border border-zinc-800 bg-zinc-900 transition-all duration-300 group-hover:border-zinc-100",
            isList ? "size-20 shrink-0" : "aspect-3/4"
          )}
        >
          {hasCover ? (
            <img
              alt={game.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={getGameCoverUrl(game.id)}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-zinc-800 via-zinc-900 to-black flex items-center justify-center">
               <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-700">No Cover</span>
            </div>
          )}
          {/* Playlist button — only in grid view */}
          {!isList && (
            <div className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
              <AddToPlaylistButton gameId={game.id} />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                "truncate text-sm font-semibold text-zinc-100 underline-offset-4 group-hover:underline",
                isList && "text-base"
              )}
            >
              {game.title}
            </h3>
            {isList && (
              <div className="flex items-center gap-6 shrink-0">
                 <div className="flex items-center gap-1.5">
                  <Star className={cn("h-3.5 w-3.5", hasRating ? "fill-yellow-500 text-yellow-500" : "text-zinc-600")} />
                  <span className={cn("text-xs font-medium", hasRating ? "text-zinc-200" : "text-zinc-500")}>
                    {hasRating ? displayRating.toFixed(1) : "NR"}
                  </span>
                </div>
                <span className="text-sm font-medium text-zinc-100">{priceFormatted}</span>
              </div>
            )}
          </div>
          
          {!isList && (
            <div className="mt-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className={cn("h-3 w-3", hasRating ? "fill-yellow-500 text-yellow-500" : "text-zinc-600")} />
                <span className={cn("text-[10px] font-medium", hasRating ? "text-zinc-300" : "text-zinc-500")}>
                  {hasRating ? displayRating.toFixed(1) : "No Rating"}
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-400">{priceFormatted}</span>
            </div>
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
