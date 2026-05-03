"use client"

import * as React from "react"
import Image from "next/image"
import {
  CheckCircle2,
  HardDrive,
  Heart,
  MonitorSmartphone,
  Star,
  Shield,
} from "lucide-react"

import { AddToPlaylistButton } from "@/components/gamedex/AddToPlaylistButton"
import { GameDetailSheet } from "@/components/gamedex/sheets/GameDetail/GameDetailSheet"
import { ViewMode } from "@/components/gamedex/types"
import { Game } from "@/lib/schemas/game"
import { getGameCoverUrl } from "@/lib/services/games"
import { cn } from "@/lib/utils"

type GameCardProps = {
  game: Game
  view: ViewMode
  genreNames: string[]
  tagNames: string[]
  platformNames: string[]
  onUpdateGame: (updated: Partial<Game> & { id: string }) => void
}

export function GameCard({
  game,
  view,
  genreNames,
  tagNames,
  platformNames,
  onUpdateGame,
}: GameCardProps) {
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [imgError, setImgError] = React.useState(false)

  const displayRating = game.userRating ?? game.rating ?? game.criticRating ?? 0
  const hasRating = displayRating > 0
  const hasCover = !imgError
  const sizeLabel = formatSize(game.installSizeGb)
  const priceLabel = formatPrice(game.priceAmount, game.priceCurrency)
  
  const condensedPlatforms = platformNames.filter(Boolean).slice(0, 3)
  const condensedGenres = genreNames.filter(Boolean).slice(0, 4)
  const condensedTags = tagNames.filter(Boolean).slice(0, 4)
  const ageLabel = formatAgeRating(game.ageRating)
  const openSheet = () => setSheetOpen(true)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openSheet()
    }
  }

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={openSheet}
        onKeyDown={handleKeyDown}
        className={getContainerClassName(view)}
      >
        {view === "grid" && (
          <GridPresentation
            game={game}
            genreNames={condensedGenres}
            tagNames={condensedTags}
            hasCover={hasCover}
            hasRating={hasRating}
            platformNames={condensedPlatforms}
            priceLabel={priceLabel}
            sizeLabel={sizeLabel}
            ageLabel={ageLabel}
            displayRating={displayRating}
            onImageError={() => setImgError(true)}
          />
        )}

        {view === "tiles" && (
          <TilesPresentation
            game={game}
            genreNames={condensedGenres}
            tagNames={condensedTags}
            hasCover={hasCover}
            hasRating={hasRating}
            platformNames={condensedPlatforms}
            priceLabel={priceLabel}
            sizeLabel={sizeLabel}
            ageLabel={ageLabel}
            displayRating={displayRating}
            onImageError={() => setImgError(true)}
          />
        )}

        {view === "list" && (
          <ListPresentation
            game={game}
            genreNames={condensedGenres}
            tagNames={condensedTags}
            hasCover={hasCover}
            hasRating={hasRating}
            platformNames={condensedPlatforms}
            priceLabel={priceLabel}
            sizeLabel={sizeLabel}
            ageLabel={ageLabel}
            displayRating={displayRating}
            onImageError={() => setImgError(true)}
          />
        )}

        {view === "details" && (
          <DetailsPresentation
            game={game}
            genreNames={condensedGenres}
            tagNames={condensedTags}
            hasCover={hasCover}
            hasRating={hasRating}
            platformNames={condensedPlatforms}
            priceLabel={priceLabel}
            sizeLabel={sizeLabel}
            ageLabel={ageLabel}
            displayRating={displayRating}
            onImageError={() => setImgError(true)}
          />
        )}
      </article>

      <GameDetailSheet
        gameId={game.id}
        coverUrl={game.coverUrl ?? undefined}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUpdate={(updated) => {
          onUpdateGame({
            id: updated.id,
            title: updated.title,
            coverUrl: updated.coverUrl,
            priceAmount: updated.priceAmount,
            priceCurrency: updated.priceCurrency,
            userRating: updated.userRating,
            criticRating: updated.criticRating,
            rating: updated.rating,
            isFavorite: updated.isFavorite,
            isPlayed: updated.isPlayed,
          })
        }}
      />
    </>
  )
}

function GridPresentation({
  game,
  genreNames,
  tagNames,
  hasCover,
  hasRating,
  platformNames,
  priceLabel,
  sizeLabel,
  ageLabel,
  displayRating,
  onImageError,
}: PresentationProps) {
  return (
    <>
      <div className="relative aspect-3/4 overflow-hidden rounded-[1.35rem] border border-zinc-800 bg-zinc-950">
        {hasCover ? (
          <Image
            alt={game.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            fill
            onError={onImageError}
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 16vw"
            src={getGameCoverUrl(game.id)}
            unoptimized
          />
        ) : (
          <FallbackCover title={game.title} />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black via-black/35 to-transparent" />

        <div className="absolute top-3 right-3 left-3 flex items-start justify-between gap-2">
          <StatusBadges game={game} />
          <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <AddToPlaylistButton gameId={game.id} />
          </div>
        </div>

        <div className="absolute right-3 bottom-3 left-3 flex items-end justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {platformNames.length > 0 && platformNames.map(platform => (
              <MetaChip key={platform} icon={<MonitorSmartphone className="h-3 w-3" />}>
                {platform}
              </MetaChip>
            ))}
            {sizeLabel !== "Unknown" && (
              <MetaChip icon={<HardDrive className="h-3 w-3" />}>
                {sizeLabel}
              </MetaChip>
            )}
            {ageLabel !== "Unknown" && ageLabel !== "Unrated" && (
              <MetaChip icon={<Shield className="h-3 w-3" />}>
                {ageLabel}
              </MetaChip>
            )}
          </div>
          {priceLabel !== "Unknown" && (
            <div className="shrink-0 rounded-full border border-white/10 bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 backdrop-blur-md">
              {priceLabel}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 px-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-zinc-100">
              {game.title}
            </h3>
          </div>
          <RatingPill hasRating={hasRating} rating={displayRating} />
        </div>

        <div className="flex flex-wrap gap-2">
          {genreNames.length > 0 || tagNames.length > 0 ? (
            <>
              {genreNames.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[9px] font-medium text-zinc-400"
                >
                  {genre}
                </span>
              ))}
              {tagNames.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-sky-900/30 bg-sky-950/20 px-2 py-0.5 text-[9px] font-medium text-sky-400/80"
                >
                  #{tag}
                </span>
              ))}
            </>
          ) : (
            <span className="rounded-full border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[9px] font-medium text-zinc-500">
              Untagged
            </span>
          )}
        </div>
      </div>
    </>
  )
}

function TilesPresentation({
  game,
  genreNames,
  tagNames,
  hasCover,
  hasRating,
  platformNames,
  priceLabel,
  sizeLabel,
  ageLabel,
  displayRating,
  onImageError,
}: PresentationProps) {
  return (
    <>
      <div className="relative overflow-hidden rounded-[1.35rem] border border-zinc-800 bg-zinc-950">
        {hasCover ? (
          <Image
            alt={game.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            fill
            onError={onImageError}
            sizes="(max-width: 1280px) 132px, 200px"
            src={getGameCoverUrl(game.id)}
            unoptimized
          />
        ) : (
          <FallbackCover title={game.title} />
        )}
        <div className="absolute inset-0 bg-linear-to-br from-transparent via-transparent to-black/55" />
      </div>

      <div className="flex min-w-0 flex-col justify-between py-2">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-1">
                {platformNames.length > 0 ? platformNames.map(p => (
                  <span key={p} className="text-[9px] font-bold tracking-[0.1em] text-zinc-500 uppercase">
                    {p}
                  </span>
                )) : (
                  <span className="text-[9px] font-bold tracking-[0.1em] text-zinc-500 uppercase">Unknown Platform</span>
                )}
              </div>
              <h3 className="mt-2 truncate text-xl font-semibold text-white">
                {game.title}
              </h3>
            </div>
            <AddToPlaylistButton gameId={game.id} />
          </div>

          <div className="flex flex-wrap gap-2">
            {genreNames.length > 0 || tagNames.length > 0 ? (
              <>
                {genreNames.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-zinc-700 bg-zinc-900/70 px-2 py-0.5 text-[9px] font-medium text-zinc-300"
                  >
                    {genre}
                  </span>
                ))}
                {tagNames.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-sky-800/40 bg-sky-900/20 px-2 py-0.5 text-[9px] font-medium text-sky-300/80"
                  >
                    #{tag}
                  </span>
                ))}
              </>
            ) : (
              <span className="rounded-full border border-zinc-700 bg-zinc-900/70 px-2 py-0.5 text-[9px] font-medium text-zinc-500">
                No tags yet
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-3">
          <TileStat
            label="Rating"
            value={hasRating ? displayRating.toFixed(1) : "NR"}
          />
          <TileStat label="Price" value={priceLabel !== "Unknown" ? priceLabel : "N/A"} />
          <TileStat label="Size" value={sizeLabel !== "Unknown" ? sizeLabel : "N/A"} />
          <TileStat label="Age Rating" value={ageLabel !== "Unknown" ? ageLabel : "Unrated"} />
          <TileStat
            label="State"
            value={
              game.isPlayed ? "Played" : game.isFavorite ? "Favorite" : "Fresh"
            }
          />
        </div>
      </div>
    </>
  )
}

function ListPresentation({
  game,
  genreNames,
  tagNames,
  hasCover,
  hasRating,
  platformNames,
  priceLabel,
  sizeLabel,
  ageLabel,
  displayRating,
  onImageError,
}: PresentationProps) {
  return (
    <>
      <div className="relative h-24 w-[4.6rem] shrink-0 overflow-hidden rounded-[1rem] border border-zinc-800 bg-zinc-950">
        {hasCover ? (
          <Image
            alt={game.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            fill
            onError={onImageError}
            sizes="74px"
            src={getGameCoverUrl(game.id)}
            unoptimized
          />
        ) : (
          <FallbackCover title={game.title} compact />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-zinc-100">
              {game.title}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
              <span>{platformNames.length > 0 ? platformNames.join(", ") : "Unknown"}</span>
              <span className="h-1 w-1 rounded-full bg-zinc-700" />
              <span className="truncate">
                {[...genreNames, ...tagNames.map(t => `#${t}`)].length > 0 
                  ? [...genreNames, ...tagNames.map(t => `#${t}`)].join(", ") 
                  : "No tags yet"}
              </span>
            </div>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <StatusBadges game={game} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
          <InlineStat
            icon={
              <Star
                className={cn("h-3.5 w-3.5", hasRating && "fill-yellow-500")}
              />
            }
            value={hasRating ? displayRating.toFixed(1) : "No rating"}
            accent={hasRating ? "text-yellow-300" : "text-zinc-500"}
          />
          {sizeLabel !== "Unknown" && (
            <InlineStat
              icon={<HardDrive className="h-3.5 w-3.5" />}
              value={sizeLabel}
            />
          )}
          {platformNames.length > 0 && platformNames.map(platform => (
            <InlineStat
              key={platform}
              icon={<MonitorSmartphone className="h-3.5 w-3.5" />}
              value={platform}
            />
          ))}
          {ageLabel !== "Unknown" && ageLabel !== "Unrated" && (
            <InlineStat
              icon={<Shield className="h-3.5 w-3.5" />}
              value={ageLabel}
            />
          )}
        </div>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="hidden text-right md:block">
          {priceLabel !== "Unknown" && (
            <p className="text-sm font-semibold text-emerald-300">{priceLabel}</p>
          )}
          {sizeLabel !== "Unknown" && (
            <p className="mt-1 text-xs text-zinc-500">{sizeLabel}</p>
          )}
        </div>
        <AddToPlaylistButton gameId={game.id} />
      </div>
    </>
  )
}

function DetailsPresentation({
  game,
  genreNames,
  tagNames,
  hasCover,
  hasRating,
  platformNames,
  priceLabel,
  sizeLabel,
  ageLabel,
  displayRating,
  onImageError,
}: PresentationProps) {
  return (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
          {hasCover ? (
            <Image
              alt={game.title}
              className="h-full w-full object-cover"
              fill
              onError={onImageError}
              sizes="40px"
              src={getGameCoverUrl(game.id)}
              unoptimized
            />
          ) : (
            <FallbackCover title={game.title} compact />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-100">
            {game.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500 md:hidden">
            {platformNames.length > 0 && <span>{platformNames.join(", ")}</span>}
            {platformNames.length > 0 && priceLabel !== "Unknown" && (
              <span className="h-1 w-1 rounded-full bg-zinc-700" />
            )}
            {priceLabel !== "Unknown" && <span>{priceLabel}</span>}
          </div>
        </div>
      </div>

      <span className="hidden truncate text-sm text-zinc-300 md:block">
        {platformNames.length > 0 ? platformNames.join(", ") : "—"}
      </span>
      <span className="hidden truncate text-sm text-zinc-400 md:block">
        {[...genreNames, ...tagNames.map(t => `#${t}`)].length > 0 
          ? [...genreNames, ...tagNames.map(t => `#${t}`)].join(", ") 
          : "No tags yet"}
      </span>
      <span className="hidden text-sm text-zinc-400 md:block">
        {sizeLabel !== "Unknown" ? sizeLabel : "—"}
      </span>
      <span className="hidden text-sm text-zinc-400 md:block">
        {ageLabel !== "Unknown" && ageLabel !== "Unrated" ? ageLabel : "—"}
      </span>
      <span
        className={cn(
          "hidden text-sm font-medium md:block",
          hasRating ? "text-yellow-300" : "text-zinc-500"
        )}
      >
        {hasRating ? displayRating.toFixed(1) : "NR"}
      </span>
      <span className="hidden text-sm font-medium text-emerald-300 md:block">
        {priceLabel !== "Unknown" ? priceLabel : "—"}
      </span>

      <div className="ml-auto flex items-center gap-2">
        <StatusBadges game={game} compact />
        <AddToPlaylistButton gameId={game.id} />
      </div>
    </>
  )
}

function StatusBadges({ game, compact }: { game: Game; compact?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {game.isFavorite && (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-500/10 text-rose-200",
            compact ? "px-2 py-1 text-[10px]" : "px-2.5 py-1 text-[11px]"
          )}
        >
          <Heart className="h-3 w-3 fill-current" />
          Fav
        </span>
      )}
      {game.isPlayed && (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
            compact ? "px-2 py-1 text-[10px]" : "px-2.5 py-1 text-[11px]"
          )}
        >
          <CheckCircle2 className="h-3 w-3" />
          Played
        </span>
      )}
    </div>
  )
}

function RatingPill({
  rating,
  hasRating,
}: {
  rating: number
  hasRating: boolean
}) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        hasRating
          ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-200"
          : "border-zinc-800 bg-zinc-900 text-zinc-500"
      )}
    >
      <Star className={cn("h-3 w-3", hasRating && "fill-current")} />
      <span>{hasRating ? rating.toFixed(1) : "NR"}</span>
    </div>
  )
}

function MetaChip({
  children,
  icon,
}: {
  children: React.ReactNode
  icon: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[9px] font-medium text-zinc-200 backdrop-blur-md">
      {icon}
      <span>{children}</span>
    </span>
  )
}

function TileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/70 px-3 py-3">
      <p className="text-[10px] font-bold tracking-[0.22em] text-zinc-500 uppercase">
        {label}
      </p>
      <p className="mt-2 truncate text-sm font-medium text-zinc-100">{value}</p>
    </div>
  )
}

function InlineStat({
  icon,
  value,
  accent,
}: {
  icon: React.ReactNode
  value: string
  accent?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs",
        accent ?? "text-zinc-300"
      )}
    >
      {icon}
      <span>{value}</span>
    </span>
  )
}

function FallbackCover({
  title,
  compact,
}: {
  title: string
  compact?: boolean
}) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(160deg,#18181b_0%,#0f172a_45%,#09090b_100%)] p-3">
      <div className="text-center">
        <span className="block text-[10px] font-bold tracking-[0.24em] text-zinc-600 uppercase">
          No Cover
        </span>
        {!compact && (
          <span className="mt-2 block text-xs font-medium text-zinc-500">
            {title}
          </span>
        )}
      </div>
    </div>
  )
}

function getContainerClassName(view: ViewMode) {
  return cn(
    "group cursor-pointer transition-all duration-300 focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] focus-visible:outline-none",
    view === "grid" &&
      "flex flex-col gap-3 rounded-[1.65rem] border border-zinc-800/80 bg-zinc-950/40 p-2 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-950/70 hover:shadow-[0_20px_55px_rgba(0,0,0,0.28)]",
    view === "tiles" &&
      "grid min-h-[216px] grid-cols-[132px_minmax(0,1fr)] gap-4 rounded-[1.75rem] border border-zinc-800/80 bg-[linear-gradient(135deg,rgba(24,24,27,0.92),rgba(9,9,11,0.98))] p-3 hover:border-zinc-700 hover:shadow-[0_22px_50px_rgba(0,0,0,0.3)]",
    view === "list" &&
      "flex items-center gap-4 rounded-[1.4rem] border border-zinc-800/70 bg-zinc-950/45 px-4 py-4 hover:border-zinc-700 hover:bg-zinc-950/70",
    view === "details" &&
      "grid items-center gap-3 rounded-2xl border border-zinc-800/60 bg-zinc-950/35 px-4 py-3 hover:border-zinc-700 hover:bg-zinc-950/60 md:grid-cols-[minmax(0,2.4fr)_1fr_1.25fr_0.75fr_0.7fr_0.8fr_0.85fr_auto]"
  )
}

function formatPrice(amount?: number | null, currency?: string | null) {
  if (amount == null) {
    return "Unknown"
  }
  
  if (amount === 0) {
    return "Free"
  }

  if (currency && currency.length === 3) {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(amount)
    } catch {
      return `${currency} ${amount.toFixed(2)}`
    }
  }

  return `${currency ?? "$"}${amount.toFixed(2)}`
}

function formatSize(size?: number | null) {
  if (size == null || size <= 0) {
    return "Unknown"
  }

  // If size is massive, assume it was saved as bytes
  if (size > 1000000) {
    const gb = size / (1024 * 1024 * 1024)
    return `${gb.toFixed(2)} GB`
  }

  // Formatting decimal sizes cleanly
  const formattedSize = Number.isInteger(size) ? size : size.toFixed(2)
  return `${formattedSize} GB`
}

const AGE_RATING_LABELS: Record<number, string> = {
  0: "Unrated",
  1: "Everyone",
  2: "Everyone 10+",
  3: "Teen",
  4: "Mature",
  5: "Adults Only",
  6: "RP"
};

function formatAgeRating(ageRating?: number | null) {
  if (ageRating == null) return "Unknown";
  return AGE_RATING_LABELS[ageRating] ?? "Unknown";
}

type PresentationProps = {
  game: Game
  genreNames: string[]
  tagNames: string[]
  hasCover: boolean
  hasRating: boolean
  platformNames: string[]
  priceLabel: string
  sizeLabel: string
  ageLabel: string
  displayRating: number
  onImageError: () => void
}
