import { Check, Pencil, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ InlineField Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
export function InlineField({
  value,
  displayValue,
  onSave,
  multiline = false,
  placeholder = "Ã¢â‚¬â€",
  inputType = "text",
  min,
  max,
  step,
  options,
  validate,
  className,
  valueClassName,
  inputClassName,
  textareaClassName,
}: {
  value: string | null
  displayValue?: string | null
  onSave: (v: string) => void
  multiline?: boolean
  placeholder?: string
  inputType?: "text" | "number" | "date"
  min?: number | string
  max?: number | string
  step?: number | string
  options?: { value: string; label: string }[]
  validate?: (v: string) => string | null
  className?: string
  valueClassName?: string
  inputClassName?: string
  textareaClassName?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? "")
  const [error, setError] = useState<string | null>(null)

  const display = useMemo(() => {
    if (displayValue !== undefined) return displayValue
    return value
  }, [displayValue, value])

  useEffect(() => {
    setDraft(value ?? "")
    setError(null)
  }, [value])

  const commit = () => {
    const issue = validate?.(draft) ?? null
    if (issue) {
      setError(issue)
      return
    }
    onSave(draft)
    setEditing(false)
  }
  const discard = () => {
    setDraft(value ?? "")
    setError(null)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className={`flex w-full flex-col gap-1.5 ${className ?? ""}`}>
        {multiline ? (
          <textarea
            autoFocus
            rows={3}
            className={`w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:ring-1 focus:ring-zinc-500 focus:outline-none ${textareaClassName ?? ""}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        ) : options && options.length > 0 ? (
          <select
            autoFocus
            className={`w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:ring-1 focus:ring-zinc-500 focus:outline-none ${inputClassName ?? ""}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            autoFocus
            type={inputType}
            min={min}
            max={max}
            step={step}
            className={`w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:ring-1 focus:ring-zinc-500 focus:outline-none ${inputClassName ?? ""}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit()
              if (e.key === "Escape") discard()
            }}
          />
        )}
        <div className="flex gap-3">
          <button
            onClick={commit}
            className="flex items-center gap-1 text-[10px] text-emerald-400 transition-colors hover:text-emerald-300"
          >
            <Check className="h-3 w-3" /> Save
          </button>
          <button
            onClick={discard}
            className="flex items-center gap-1 text-[10px] text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
        </div>
        {error && <div className="text-[10px] text-red-400">{error}</div>}
      </div>
    )
  }

  return (
    <div className={`group flex w-full items-start gap-2 ${className ?? ""}`}>
      <span
        className={`flex-1 text-sm leading-relaxed ${display ? "text-zinc-300" : "text-zinc-600 italic"} ${valueClassName ?? ""}`}
      >
        {display ?? placeholder}
      </span>
      <button
        onClick={() => setEditing(true)}
        className="mt-0.5 shrink-0 rounded p-1 text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-zinc-800 hover:text-zinc-300"
      >
        <Pencil className="h-3 w-3" />
      </button>
    </div>
  )
}
