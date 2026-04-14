import { AnimatePresence, motion } from "framer-motion"
import { Images, Settings2, Video } from "lucide-react"
import { useEffect, useRef, useState } from "react"

// ─── Header Settings Popover ──────────────────────────────────────────────────
export function HeaderSettingsPopover({
  showTrailer,
  hasTrailer,
  onToggle,
}: {
  showTrailer: boolean
  hasTrailer: boolean
  onToggle: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-white/50 backdrop-blur-sm transition-all hover:border-white/20 hover:text-white/80"
      >
        <Settings2 className="h-3.5 w-3.5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-9 right-0 z-50 w-56 rounded-xl border border-zinc-700/60 bg-zinc-950/95 p-3 shadow-2xl shadow-black/60 backdrop-blur-md"
          >
            <p className="mb-2 text-[9px] font-semibold tracking-widest text-zinc-600 uppercase">
              Header Display
            </p>

            <button
              onClick={() => {
                onToggle()
                setOpen(false)
              }}
              disabled={!hasTrailer}
              className="group flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-zinc-800/60 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <div className="flex items-center gap-2">
                {showTrailer ? (
                  <Video className="h-3.5 w-3.5 text-zinc-400" />
                ) : (
                  <Images className="h-3.5 w-3.5 text-zinc-400" />
                )}
                <div>
                  <div className="text-xs font-medium text-zinc-300">
                    {showTrailer ? "Show Trailer" : "Show Screenshots"}
                  </div>
                  {!hasTrailer && (
                    <div className="text-[9px] text-zinc-600">
                      No trailer available
                    </div>
                  )}
                </div>
              </div>

              {/* Toggle visual */}
              <div
                className={`relative h-4.5 w-8 rounded-full border transition-all ${
                  showTrailer
                    ? "border-zinc-500 bg-zinc-600"
                    : "border-zinc-700 bg-zinc-800"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-all ${
                    showTrailer ? "left-4" : "left-0.5"
                  }`}
                />
              </div>
            </button>

            <p className="mt-2 px-2.5 text-[9px] leading-relaxed text-zinc-600">
              {showTrailer
                ? "Trailer plays muted in the header background"
                : "Screenshots cycle automatically every 4s"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}