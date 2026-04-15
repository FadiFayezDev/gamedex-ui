import { AnimatePresence, motion } from "framer-motion"
import { Film, Play, Volume2, VolumeX, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

// ─── Trailer Fullscreen Modal ─────────────────────────────────────────────────
export function TrailerModal({
  url,
  title,
  onClose,
}: {
  url: string
  title: string
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(false)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    setMounted(true)
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setMuted(videoRef.current.muted)
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
        setPlaying(true)
      } else {
        videoRef.current.pause()
        setPlaying(false)
      }
    }
  }

  if (!mounted) return null

  return createPortal(
    <motion.div
      data-trailer-modal
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm pointer-events-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-4xl px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Film className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-xs font-medium tracking-wider text-zinc-400 uppercase">
              {title} — Trailer
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-1.5 text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Video */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-black shadow-2xl shadow-black">
          <video
            ref={videoRef}
            src={url}
            autoPlay
            controls
            className="aspect-video w-full"
            onEnded={() => setPlaying(false)}
          />
        </div>

        {/* Controls row */}
        <div className="mt-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-[10px] font-medium tracking-wider text-zinc-400 uppercase transition-all hover:border-zinc-700 hover:text-zinc-200"
            >
              {playing ? (
                <>
                  <span className="flex h-2.5 w-2.5 items-center justify-between gap-px">
                    <span className="h-full w-px bg-current" />
                    <span className="h-full w-px bg-current" />
                  </span>
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-2.5 w-2.5 fill-current" />
                  Play
                </>
              )}
            </button>
            <button
              onClick={toggleMute}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-[10px] font-medium tracking-wider text-zinc-400 uppercase transition-all hover:border-zinc-700 hover:text-zinc-200"
            >
              {muted ? (
                <VolumeX className="h-3 w-3" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
              {muted ? "Unmute" : "Mute"}
            </button>
          </div>
          <span className="text-[10px] text-zinc-600">
            Press Esc to close
          </span>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}