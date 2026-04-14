import { Check, Loader2, X } from "lucide-react"
import { useState } from "react"

// ─── Generic inline AddForm ───────────────────────────────────────────────────
export function AddForm({
  fields,
  onSave,
  onCancel,
}: {
  fields: FormField[]
  onSave: (values: any) => Promise<void>
  onCancel: () => void
}) {
  const [values, setValues] = useState<Record<string, any>>(
    Object.fromEntries(fields.map((f) => [f.key, f.options?.[0]?.value ?? ""]))
  )
  const [saving, setSaving] = useState(false)
  const firstTextKey = fields.find((f) => !f.options && f.type !== "file")?.key

  const commit = async () => {
    if (
      firstTextKey &&
      typeof values[firstTextKey] === "string" &&
      !values[firstTextKey]?.trim()
    )
      return
    setSaving(true)
    try {
      await onSave(values)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-700/40 bg-zinc-900/60 p-2.5">
      {fields.map((f, i) => {
        if (f.options) {
          return (
            <select
              key={f.key}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 focus:ring-1 focus:ring-zinc-600 focus:outline-none"
              value={values[f.key] ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, [f.key]: e.target.value }))
              }
            >
              {f.options.map((o) => (
                <option key={o.value} value={o.value} className="bg-zinc-900">
                  {o.label}
                </option>
              ))}
            </select>
          )
        }

        if (f.type === "file") {
          return (
            <input
              key={f.key}
              type="file"
              className="w-full text-[10px] text-zinc-400 file:mr-2 file:rounded file:border-0 file:bg-zinc-800 file:px-2 file:py-1 file:text-[10px] file:text-zinc-200 hover:file:bg-zinc-700"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setValues((v) => ({ ...v, [f.key]: file }))
              }}
            />
          )
        }

        return (
          <input
            key={f.key}
            autoFocus={i === 0}
            type={f.type ?? "text"}
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 placeholder-zinc-600 focus:ring-1 focus:ring-zinc-600 focus:outline-none"
            placeholder={f.placeholder}
            value={values[f.key] ?? ""}
            onChange={(e) =>
              setValues((v) => ({ ...v, [f.key]: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && i === fields.length - 1) commit()
              if (e.key === "Escape") onCancel()
            }}
          />
        )
      })}

      <div className="flex gap-2 pt-0.5">
        <button
          onClick={commit}
          disabled={
            saving ||
            (!!firstTextKey &&
              typeof values[firstTextKey] === "string" &&
              !values[firstTextKey]?.trim())
          }
          className="flex items-center gap-1 text-[10px] text-emerald-400 transition-colors hover:text-emerald-300 disabled:opacity-40"
        >
          {saving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Check className="h-3 w-3" />
          )}
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 text-[10px] text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <X className="h-3 w-3" /> Cancel
        </button>
      </div>
    </div>
  )
}