import { Check, Loader2, X } from "lucide-react"
import { useState } from "react"
import type { AddFormValues, FormFieldConfig } from "../gameDetail.shared"

type AddFormProps<TValues extends AddFormValues> = {
  fields: FormFieldConfig<Extract<keyof TValues, string>>[]
  onSave: (values: TValues) => Promise<void>
  onCancel: () => void
}

export function AddForm<TValues extends AddFormValues>({
  fields,
  onSave,
  onCancel,
}: AddFormProps<TValues>) {
  const [values, setValues] = useState<TValues>(
    () =>
      Object.fromEntries(
        fields.map((field) => [
          field.key,
          field.type === "file" ? undefined : field.options?.[0]?.value ?? "",
        ])
      ) as TValues
  )
  const [saving, setSaving] = useState(false)
  const firstTextKey = fields.find((field) => !field.options && field.type !== "file")
    ?.key

  const commit = async () => {
    if (
      firstTextKey &&
      typeof values[firstTextKey] === "string" &&
      !values[firstTextKey]?.trim()
    ) {
      return
    }

    setSaving(true)
    try {
      await onSave(values)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-700/40 bg-zinc-900/60 p-2.5">
      {fields.map((field, index) => {
        const fieldValue =
          typeof values[field.key] === "string"
            ? (values[field.key] as string)
            : ""

        if (field.options) {
          return (
            <select
              key={field.key}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 focus:ring-1 focus:ring-zinc-600 focus:outline-none"
              value={fieldValue}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [field.key]: event.target.value as TValues[typeof field.key],
                }))
              }
            >
              {field.options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-zinc-900"
                >
                  {option.label}
                </option>
              ))}
            </select>
          )
        }

        if (field.type === "file") {
          return (
            <input
              key={field.key}
              type="file"
              className="w-full text-[10px] text-zinc-400 file:mr-2 file:rounded file:border-0 file:bg-zinc-800 file:px-2 file:py-1 file:text-[10px] file:text-zinc-200 hover:file:bg-zinc-700"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  setValues((current) => ({
                    ...current,
                    [field.key]: file as TValues[typeof field.key],
                  }))
                }
              }}
            />
          )
        }

        return (
          <input
            key={field.key}
            autoFocus={index === 0}
            type={field.type ?? "text"}
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 placeholder-zinc-600 focus:ring-1 focus:ring-zinc-600 focus:outline-none"
            placeholder={field.placeholder}
            value={fieldValue}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                [field.key]: event.target.value as TValues[typeof field.key],
              }))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" && index === fields.length - 1) {
                void commit()
              }
              if (event.key === "Escape") onCancel()
            }}
          />
        )
      })}

      <div className="flex gap-2 pt-0.5">
        <button
          onClick={() => void commit()}
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
