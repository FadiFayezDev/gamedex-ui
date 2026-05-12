"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/contexts/ToastContext"
import type { GameDetails } from "@/components/models/gameCatalog/game"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { exportGame, getGame } from "@/lib/services/games"
import { LoadingSkeleton } from "./components/LoadingSkeleton"

type Props = {
  gameId: string
  coverUrl?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: (updated: GameDetails) => void
}

const GameInfoSection = dynamic(
  () =>
    import("./sections/GameInfoSection").then((module) => ({
      default: module.GameInfoSection,
    })),
  {
    loading: () => <SectionChunkFallback label="Loading game info" />,
  }
)

const GameMediaSection = dynamic(
  () =>
    import("./sections/GameMediaSection").then((module) => ({
      default: module.GameMediaSection,
    })),
  {
    loading: () => <SectionChunkFallback label="Loading media" />,
  }
)

const GameAssociationsSection = dynamic(
  () =>
    import("./sections/GameAssociationsSection").then((module) => ({
      default: module.GameAssociationsSection,
    })),
  {
    loading: () => <SectionChunkFallback label="Loading associations" />,
  }
)

const GameDangerZone = dynamic(
  () =>
    import("./sections/GameDangerZone").then((module) => ({
      default: module.GameDangerZone,
    })),
  {
    loading: () => <SectionChunkFallback label="Loading actions" />,
  }
)

const NAV_ITEMS = [
  { id: "sec-media", label: "Media" },
  { id: "sec-info", label: "Info" },
  { id: "sec-associations", label: "Associations" },
  { id: "sec-danger", label: "Danger Zone" },
]

function SectionChunkFallback({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 px-4 py-5">
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {label}
      </div>
    </div>
  )
}

export function GameDetailSheet({
  gameId,
  coverUrl,
  open,
  onOpenChange,
  onUpdate,
}: Props) {
  const { toast } = useToast()
  const [game, setGame] = React.useState<GameDetails | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [reloadNonce, setReloadNonce] = React.useState(0)
  const [isExporting, setIsExporting] = React.useState(false)

  const patch = React.useCallback(
    (partial: Partial<GameDetails>) => {
      setGame((current) => {
        if (!current) return current
        const updated = { ...current, ...partial }
        onUpdate?.(updated)
        return updated
      })
    },
    [onUpdate]
  )

  const refresh = React.useCallback(async () => {
    try {
      const data = await getGame(gameId)
      const next = {
        ...data,
        coverUrl: coverUrl ?? data.coverUrl,
      }
      setGame(next)
      onUpdate?.(next)
    } catch (refreshError) {
      console.error("Refresh failed:", refreshError)
    }
  }, [coverUrl, gameId, onUpdate])

  React.useEffect(() => {
    if (!open) return

    let cancelled = false
    setLoading(true)
    setError(null)

    getGame(gameId)
      .then((data) => {
        if (cancelled) return

        setGame({
          ...data,
          coverUrl: coverUrl ?? data.coverUrl,
        })
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError?.message ?? "Failed to load game details")
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [coverUrl, gameId, open, reloadNonce])

  const handleExport = React.useCallback(async () => {
    if (!game) return

    setIsExporting(true)
    try {
      await exportGame(game.id, game.title)
      toast(
        "Export started",
        "success",
        `"${game.title}" is being exported. Check your system dialog.`
      )
    } catch (exportError) {
      console.error("Failed to export game:", exportError)
      toast("Export failed", "error", "Something went wrong during export.")
    } finally {
      setIsExporting(false)
    }
  }, [game, toast])

  const scrollTo = React.useCallback((id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden border-l border-zinc-800 bg-[#0a0a0b] p-0 sm:max-w-142.5 lg:min-w-150">
        {loading && (
          <div className="flex flex-1 flex-col">
            <LoadingSkeleton />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <span className="text-sm text-red-400">{error}</span>
            <button
              onClick={() => setReloadNonce((current) => current + 1)}
              className="text-xs text-zinc-500 underline underline-offset-4 transition-colors hover:text-zinc-200"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && game && (
          <>
            <div className="scrollbar-none flex shrink-0 items-center gap-0.5 overflow-x-auto border-b border-zinc-800/80 px-4 py-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="rounded-md px-2.5 py-1.5 text-[10px] font-medium tracking-wider whitespace-nowrap text-zinc-500 uppercase transition-colors hover:bg-zinc-800/60 hover:text-zinc-200"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="scrollbar-custom flex-1 space-y-8 overflow-y-auto px-6 py-6">
              <GameMediaSection
                game={game}
                gameId={gameId}
                patch={patch}
                refresh={refresh}
                isExporting={isExporting}
                onExport={handleExport}
              />

              <div className="h-px bg-zinc-800/60" />

              <GameInfoSection
                game={game}
                gameId={gameId}
                patch={patch}
                refresh={refresh}
              />

              <div className="h-px bg-zinc-800/60" />

              <GameAssociationsSection
                game={game}
                gameId={gameId}
                patch={patch}
                refresh={refresh}
              />

              <GameDangerZone
                gameId={game.id}
                title={game.title}
                onDeleted={() => onOpenChange(false)}
              />

              <div className="h-8" />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
