"use client"

import * as React from "react"
import { IconUpload, IconX } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { AddGameInput, AddGameSchema } from "@/lib/schemas/add-game"

// ─── Types ────────────────────────────────────────────────────────────────────

type AddGameSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (input: AddGameInput) => Promise<void> | void
}

type FormState = {
  title: string
  description: string
  releaseDate: string
  ageRating: string
  price: string
  currency: string
  cover: File | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_FORM_STATE: FormState = {
  title: "",
  description: "",
  releaseDate: "",
  ageRating: "0",
  price: "0",
  currency: "USD",
  cover: null,
}

const AGE_RATING_OPTIONS = [
  { value: "0", label: "Unrated" },
  { value: "1", label: "Everyone" },
  { value: "2", label: "Everyone 10+" },
  { value: "3", label: "Teen" },
  { value: "4", label: "Mature" },
  { value: "5", label: "Adults Only" },
  { value: "6", label: "Rating Pending" },
] as const

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "EGP", "JPY"] as const

// ─── Sub-components ───────────────────────────────────────────────────────────

type FormFieldProps = {
  label: string
  error?: string
  children: React.ReactNode
  colSpan?: boolean
}

function FormField({ label, error, children, colSpan = true }: FormFieldProps) {
  return (
    <div className={`space-y-2 ${colSpan ? "md:col-span-2" : ""}`}>
      <label className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

const inputClass =
  "w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white transition-all placeholder:text-zinc-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] focus:outline-none"

type CoverUploadProps = {
  file: File | null
  onChange: (file: File | null) => void
}

function CoverUpload({ file, onChange }: CoverUploadProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  return (
    <div className="space-y-4">
      <label className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
        Key Art
      </label>

      <label className="group relative flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 transition-all duration-300 hover:border-[#3b82f6] hover:bg-zinc-900/80">
        <input
          className="sr-only"
          type="file"
          accept="image/*"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />

        {previewUrl ? (
          <>
            <div className="px-2 pt-2 w-full h-full">
              <div className="overflow-hidden rounded-xl w-full h-full">
                <img
                  src={previewUrl}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                onChange(null)
              }}
              className="absolute top-2 right-2 rounded-full bg-zinc-900/80 p-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <IconX size={14} />
            </button>
          </>
        ) : (
          <>
            <div className="rounded-full border border-zinc-800 bg-zinc-900 p-4 transition-all group-hover:scale-110 group-hover:border-[#3b82f6]">
              <IconUpload
                className="text-zinc-400 group-hover:text-[#3b82f6]"
                size={24}
                strokeWidth={1.5}
              />
            </div>
            <p className="mt-4 text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
              Upload high-res key art
            </p>
            <p className="mt-1 text-[11px] tracking-widest text-zinc-600 uppercase">
              3:4 or 16:9 Recommended
            </p>
          </>
        )}
      </label>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AddGameSheet({ open, onOpenChange, onCreate }: AddGameSheetProps) {
  const [form, setForm] = React.useState<FormState>(INITIAL_FORM_STATE)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Generic field updater — يتعامل مع أي field بدون handler منفصل لكل واحدة
  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const resetForm = React.useCallback(() => {
    setForm(INITIAL_FORM_STATE)
    setErrors({})
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const result = AddGameSchema.safeParse({
      ...form,
      cover: form.cover,
    })

    if (!result.success) {
      const nextErrors: Record<string, string> = {}
      result.error.issues.forEach(({ path, message }) => {
        if (typeof path[0] === "string") nextErrors[path[0]] = message
      })
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onCreate(result.data)
      resetForm()
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDiscard = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-l border-zinc-800 bg-[#0b0b0c] p-0 sm:max-w-150">
        <div className="flex h-full flex-col p-8">

          {/* ── Header ── */}
          <SheetHeader className="mb-12 p-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold tracking-tight text-white">
                Add New Game
              </SheetTitle>
              <div className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                Step <span className="text-[#3b82f6]">01</span> of 02
              </div>
            </div>
          </SheetHeader>

          {/* ── Form ── */}
          <form className="flex-1 space-y-10" onSubmit={handleSubmit}>

            <CoverUpload
              file={form.cover}
              onChange={(file) => setField("cover", file)}
            />

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

              <FormField label="Game Title" error={errors.title}>
                <input
                  className={inputClass}
                  placeholder="e.g. Starfield: Shattered Space"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                />
              </FormField>

              <FormField label="Description">
                <textarea
                  className={`${inputClass} min-h-30 resize-none`}
                  placeholder="Add a short game synopsis..."
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                />
              </FormField>

              <FormField label="Release Date">
                <input
                  className={inputClass}
                  type="date"
                  value={form.releaseDate}
                  onChange={(e) => setField("releaseDate", e.target.value)}
                />
              </FormField>

              <FormField label="Age Rating">
                <select
                  className={`${inputClass} cursor-pointer`}
                  value={form.ageRating}
                  onChange={(e) => setField("ageRating", e.target.value)}
                >
                  {AGE_RATING_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Price" error={errors.price ?? errors.currency}>
                <div className="flex overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 transition-all focus-within:border-[#3b82f6] focus-within:ring-1 focus-within:ring-[#3b82f6]">
                  <select
                    className="cursor-pointer border-r border-zinc-800 bg-transparent px-3 py-3 text-sm font-medium text-zinc-400 focus:outline-none"
                    value={form.currency}
                    onChange={(e) => setField("currency", e.target.value)}
                  >
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none"
                    placeholder="0.00"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                  />
                </div>
              </FormField>

            </div>

            {/* ── Footer ── */}
            <div className="mt-auto flex items-center justify-end gap-4 border-t border-zinc-800 pt-10">
              <button
                className="rounded-lg px-6 py-2.5 text-sm font-bold text-zinc-400 transition-colors hover:text-white disabled:opacity-50"
                type="button"
                onClick={handleDiscard}
                disabled={isSubmitting}
              >
                Discard
              </button>
              <Button
                className="rounded-lg bg-zinc-100 px-8 py-2.5 text-sm font-bold text-zinc-950 shadow-lg shadow-white/5 transition-all hover:bg-white active:scale-[0.98] disabled:opacity-50"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Game"}
              </Button>
            </div>

          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}