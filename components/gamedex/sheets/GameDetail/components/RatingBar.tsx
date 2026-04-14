import { Pencil } from "lucide-react"
import { useState } from "react"

export function RatingBar({
  label,
  value,
  onSave,
}: {
  label: string
  value: number | null
  onSave?: (v: number | null) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")

  const commit = () => {
    const n = parseFloat(draft)
    const clamped = isNaN(n) ? null : Math.max(0, Math.min(10, n))
    onSave?.(clamped)
    setEditing(false)
  }

  const startEdit = () => {
    setDraft(String(value ?? ""))
    setEditing(true)
  }

  return (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 text-[10px] tracking-wider text-zinc-500 uppercase">
        {label}
      </span>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-zinc-400 transition-all duration-300"
          style={{ width: `${value !== null ? value * 10 : 0}%` }}
        />
      </div>
      {editing ? (
        <input
          autoFocus
          type="number"
          min="0"
          max="10"
          step="0.1"
          className="w-12 rounded bg-zinc-800 px-1 py-0.5 text-right font-mono text-xs text-zinc-300 focus:outline-none"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit()
            if (e.key === "Escape") setEditing(false)
          }}
        />
      ) : (
        <div className="flex items-center gap-1">
          <button
            onClick={startEdit}
            disabled={!onSave}
            className="w-8 text-right font-mono text-xs text-zinc-400 tabular-nums transition-colors hover:text-zinc-200 disabled:cursor-default"
            title={onSave ? "Click to edit" : undefined}
          >
            {value ?? "—"}
          </button>
          {onSave && (
            <button
              onClick={startEdit}
              className="rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
              title="Edit rating"
            >
              <Pencil className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
