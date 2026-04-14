import { Loader2, Plus, Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"

// ─── EntityPicker ─────────────────────────────────────────────────────────────
export default function EntityPicker({
  fetchFn,
  linkedNames,
  onSelect,
}: {
  fetchFn: () => Promise<PickerEntity[]>
  linkedNames: string[]
  onSelect: (e: PickerEntity) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [entities, setEntities] = useState<PickerEntity[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [adding, setAdding] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetchFn()
      .then(setEntities)
      .catch(() => setEntities([]))
      .finally(() => setLoading(false))
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const available = entities.filter(
    (e) =>
      !linkedNames.includes(e.name) &&
      e.name.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = async (entity: PickerEntity) => {
    setAdding(entity.id)
    try {
      await onSelect(entity)
      setOpen(false)
      setQuery("")
    } finally {
      setAdding(null)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-[10px] text-zinc-600 transition-colors hover:text-zinc-300"
      >
        <Plus className="h-3 w-3" /> Add
      </button>

      {open && (
        <div className="absolute top-6 right-0 z-50 w-52 rounded-xl border border-zinc-700/60 bg-zinc-900 shadow-2xl shadow-black/60">
          <div className="flex items-center gap-2 border-b border-zinc-800 px-2.5 py-2">
            <Search className="h-3 w-3 shrink-0 text-zinc-600" />
            <input
              autoFocus
              className="flex-1 bg-transparent text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-600" />
              </div>
            ) : available.length === 0 ? (
              <p className="px-3 py-3 text-center text-[10px] text-zinc-600">
                {entities.length === 0
                  ? "No options available"
                  : "All items already added"}
              </p>
            ) : (
              available.map((e) => (
                <button
                  key={e.id}
                  onClick={() => handleSelect(e)}
                  disabled={!!adding}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-zinc-300 transition-colors hover:bg-zinc-800/80 disabled:opacity-50"
                >
                  {adding === e.id && (
                    <Loader2 className="h-3 w-3 shrink-0 animate-spin text-zinc-500" />
                  )}
                  {e.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
