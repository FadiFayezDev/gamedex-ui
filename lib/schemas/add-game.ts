import { z } from "zod"
import { AgeRating } from "@/components/enums/AgeRating"

const numberFromInput = (value: unknown) => {
  if (value === "" || value === null || value === undefined) {
    return undefined
  }

  return Number(value)
}

const stringOrEmptyToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined
  }

  return value
}

export const AddGameSchema = z.object({
  title: z.string().min(2, "Game title is required."),
  description: z.string().optional(),
  releaseDate: z.preprocess(stringOrEmptyToUndefined, z.string().optional()),
  ageRating: z.preprocess(numberFromInput, z.nativeEnum(AgeRating).optional()),
  genreId: z.string().min(1, "Genre is required."),
  platformId: z.string().min(1, "Platform is required."),
  priceUsd: z.preprocess(
    numberFromInput,
    z.number().min(0, "Price must be 0 or higher.").optional()
  ),
  rating: z.preprocess(
    numberFromInput,
    z.number().min(0).max(5, "Rating must be between 0 and 5.").optional()
  ),
  cover: z.instanceof(File).optional(),
})

export type AddGameInput = z.infer<typeof AddGameSchema>
