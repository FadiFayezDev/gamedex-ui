"use client"

import * as React from "react"
import { AlertTriangle, Trash2 } from "lucide-react"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { useToast } from "@/components/contexts/ToastContext"
import { deleteGame } from "@/lib/services/games"

type GameDangerZoneProps = {
  gameId: string
  title: string
  onDeleted: () => void
}

export function GameDangerZone({
  gameId,
  title,
  onDeleted,
}: GameDangerZoneProps) {
  const { toast } = useToast()
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = React.useCallback(async () => {
    setIsDeleting(true)

    try {
      await deleteGame(gameId)
      setConfirmOpen(false)
      onDeleted()
      window.location.reload()
    } catch (error) {
      console.error("Failed to delete game:", error)
      toast("Delete failed", "error", "The game could not be deleted.")
      setIsDeleting(false)
    }
  }, [gameId, onDeleted, toast])

  return (
    <>
      <div id="sec-danger" className="mt-10 mb-8">
        <div className="rounded-xl border border-red-900/20 bg-red-900/5 p-6 transition-all hover:bg-red-900/10">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-red-500/10 p-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-500">Danger Zone</h3>
              <p className="mt-0.5 text-[10px] tracking-widest text-red-400/60 uppercase">
                Critical Actions
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs leading-relaxed text-zinc-400">
                Once you delete this game, there is no going back. Please be
                certain.
              </p>
            </div>
            <button
              onClick={() => setConfirmOpen(true)}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-red-500/10 px-5 py-2.5 text-xs font-bold text-red-500 transition-all hover:bg-red-500 hover:text-white active:scale-95"
            >
              <Trash2 className="h-4 w-4" />
              Delete Game
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        danger
        title="Delete Game"
        message={`Are you absolutely sure you want to delete "${title}"? All associated data will be permanently removed.`}
        confirmLabel="Delete Game"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}
