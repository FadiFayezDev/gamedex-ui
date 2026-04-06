import { z } from "zod"

export const GenreSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
})

export type Genre = z.infer<typeof GenreSchema>

export const PlatformSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
})

export type Platform = z.infer<typeof PlatformSchema>

export const GameSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  coverUrl: z.string().url().optional().nullable(),
  priceUsd: z.number().nonnegative().optional().nullable(),
  installSizeGb: z.number().nonnegative().optional().nullable(),
  genreIds: z.array(z.string()),
  platformId: z.string().optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  isFavorite: z.boolean().default(false),
  isPlayed: z.boolean().default(false),
})

export type Game = z.infer<typeof GameSchema>

export const LibraryStatsSchema = z.object({
  total: z.number().int().nonnegative(),
  favorites: z.number().int().nonnegative(),
  played: z.number().int().nonnegative(),
})

export type LibraryStats = z.infer<typeof LibraryStatsSchema>
