"use client"

import * as React from "react"
import { IconUpload } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { AddGameInput, AddGameSchema } from "@/lib/schemas/add-game"
import { Genre, Platform } from "@/lib/schemas/game"
import { RatingStars } from "@/components/gamedex/RatingStars"

type AddGameSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  genres: Genre[]
  platforms: Platform[]
  onCreate: (input: AddGameInput) => Promise<void> | void
}

type FormState = {
  title: string
  description: string
  releaseDate: string
  ageRating: string
  genreId: string
  platformId: string
  priceUsd: string
  rating: number
  imageFile: File | null
}

const initialFormState: FormState = {
  title: "",
  description: "",
  releaseDate: "",
  ageRating: "0",
  genreId: "",
  platformId: "",
  priceUsd: "",
  rating: 0,
  imageFile: null,
}

const ageRatingOptions = [
  { value: "0", label: "Unrated" },
  { value: "1", label: "Everyone" },
  { value: "2", label: "Everyone 10+" },
  { value: "3", label: "Teen" },
  { value: "4", label: "Mature" },
  { value: "5", label: "Adults Only" },
  { value: "6", label: "Rating Pending" },
]

export function AddGameSheet({
  open,
  onOpenChange,
  genres,
  platforms,
  onCreate,
}: AddGameSheetProps) {
  const [formState, setFormState] = React.useState<FormState>(initialFormState)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [imageFile, setImageFile] = React.useState<File | null>(null)

  const resetForm = React.useCallback(() => {
    setFormState(initialFormState)
    setErrors({})
    setImageFile(null)
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = AddGameSchema.safeParse({
      title: formState.title,
      description: formState.description,
      releaseDate: formState.releaseDate,
      ageRating: formState.ageRating,
      genreId: formState.genreId,
      platformId: formState.platformId,
      priceUsd: formState.priceUsd,
      rating: formState.rating,
      cover: formState.imageFile,
    })

    if (!result.success) {
      const nextErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (typeof field === "string") {
          nextErrors[field] = issue.message
        }
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

  const setImageFileHandler = (file: File | null) => {
    if (file) {
      setImageFile(file)
      setFormState((prev) => ({
        ...prev,
        imageFile: file,
      }))
      return
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-l border-zinc-800 bg-[#0b0b0c] p-0 sm:max-w-[600px]">
        <div className="flex h-full flex-col p-8">
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

          <form className="flex-1 space-y-10" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <label className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                Key Art
              </label>
              <label className="group relative flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 transition-all duration-300 hover:border-[#3b82f6] hover:bg-zinc-900/80">
                <input
                  onChange={(e) =>
                    setImageFileHandler(
                      e.target.files ? e.target.files[0] : null
                    )
                  }
                  className="sr-only"
                  type="file"
                  accept="image/*"
                />
                {imageFile ? (
                  <div className="px-2 pt-2">
                    <div className="overflow-hidden rounded-xl">
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="image preview"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-full border border-zinc-800 bg-zinc-900 p-4 transition-all group-hover:scale-110 group-hover:border-[#3b82f6]">
                    <IconUpload
                      className="text-zinc-400 group-hover:text-[#3b82f6]"
                      size={24}
                      strokeWidth={1.5}
                    />
                  </div>
                )}
                <p className="mt-4 text-sm font-medium text-zinc-400 transition-colors group-hover:text-white">
                  Upload high-res key art
                </p>
                <p className="mt-1 text-[11px] tracking-widest text-zinc-600 uppercase">
                  3:4 or 16:9 Recommended
                </p>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                  Game Title
                </label>
                <input
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm transition-all placeholder:text-zinc-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] focus:outline-none"
                  placeholder="e.g. Starfield: Shattered Space"
                  value={formState.title}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                />
                {errors.title && (
                  <p className="text-xs text-red-400">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                  Description
                </label>
                <textarea
                  className="min-h-[120px] w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm transition-all placeholder:text-zinc-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] focus:outline-none"
                  placeholder="Add a short game synopsis..."
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                  Release Date
                </label>
                <input
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm transition-all placeholder:text-zinc-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] focus:outline-none"
                  type="date"
                  value={formState.releaseDate}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      releaseDate: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                  Age Rating
                </label>
                <select
                  className="w-full cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] focus:outline-none"
                  value={formState.ageRating}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      ageRating: event.target.value,
                    }))
                  }
                >
                  {ageRatingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                  Genre
                </label>
                <select
                  className="w-full cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] focus:outline-none"
                  value={formState.genreId}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      genreId: event.target.value,
                    }))
                  }
                >
                  <option value="">Select genre</option>
                  {genres.map((genre) => (
                    <option key={genre.id} value={genre.id}>
                      {genre.name}
                    </option>
                  ))}
                </select>
                {errors.genreId && (
                  <p className="text-xs text-red-400">{errors.genreId}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                  Platform
                </label>
                <select
                  className="w-full cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] focus:outline-none"
                  value={formState.platformId}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      platformId: event.target.value,
                    }))
                  }
                >
                  <option value="">Select platform</option>
                  {platforms.map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  ))}
                </select>
                {errors.platformId && (
                  <p className="text-xs text-red-400">{errors.platformId}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                  Price (USD)
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm text-zinc-500">
                    $
                  </span>
                  <input
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-3 pr-4 pl-8 text-sm transition-all placeholder:text-zinc-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] focus:outline-none"
                    placeholder="0.00"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formState.priceUsd}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        priceUsd: event.target.value,
                      }))
                    }
                  />
                </div>
                {errors.priceUsd && (
                  <p className="text-xs text-red-400">{errors.priceUsd}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                  Initial Rating
                </label>
                <div className="flex h-[46px] items-center gap-2">
                  <RatingStars
                    value={formState.rating}
                    onChange={(value) =>
                      setFormState((prev) => ({ ...prev, rating: value }))
                    }
                    activeClassName="text-[#3b82f6]"
                    inactiveClassName="text-zinc-800"
                    size={20}
                  />
                </div>
                {errors.rating && (
                  <p className="text-xs text-red-400">{errors.rating}</p>
                )}
              </div>
            </div>

            <div className="mt-auto flex items-center justify-end gap-4 border-t border-zinc-800 pt-10">
              <button
                className="rounded-lg px-6 py-2.5 text-sm font-bold text-zinc-400 transition-colors hover:text-white"
                type="button"
                onClick={handleDiscard}
                disabled={isSubmitting}
              >
                Discard
              </button>
              <Button
                className="rounded-lg bg-zinc-100 px-8 py-2.5 text-sm font-bold text-zinc-950 shadow-lg shadow-white/5 transition-all hover:bg-white active:scale-[0.98]"
                type="submit"
                disabled={isSubmitting}
              >
                Save Game
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
