import { z } from "zod"

import { Genre, GenreSchema } from "@/lib/schemas/game"
import { request } from "@/lib/services/http"
import { ApiRoot } from "@/components/root/root"

const ApiGenreSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    title: z.string().optional(),
  })
  .passthrough()

const ApiGenreListSchema = z.union([
  z.array(ApiGenreSchema),
  z.object({ items: z.array(ApiGenreSchema) }),
])

const ApiGenreListResponse = ApiGenreListSchema.nullable()
const ApiGenreResponse = ApiGenreSchema.nullable()
const EmptyResponseSchema = z.unknown().nullable()

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const toGenre = (apiGenre: z.infer<typeof ApiGenreSchema>): Genre =>
  GenreSchema.parse({
    id: apiGenre.id ?? slugify(apiGenre.name ?? apiGenre.title ?? "genre"),
    name: apiGenre.name ?? apiGenre.title ?? "Unknown",
  })

export async function listGenres() {
  const data = await request(
    `${ApiRoot}/api/v1/genres`,
    { method: "GET" },
    ApiGenreListResponse
  )
  if (!data) return []
  const list = Array.isArray(data) ? data : data.items
  return list.map((item) => toGenre(item))
}

export type CreateGenreRequest = { name?: string }

export async function createGenre(input: CreateGenreRequest) {
  const data = await request(
    `${ApiRoot}/api/v1/genres`,
    { method: "POST", body: input },
    ApiGenreResponse
  )
  return data ? toGenre(data) : null
}

export async function getGenre(id: string) {
  const data = await request(
    `${ApiRoot}/api/v1/genres/${id}`,
    { method: "GET" },
    ApiGenreResponse
  )
  return data ? toGenre(data) : null
}

export type UpdateGenreRequest = { name?: string }

export async function updateGenre(id: string, input: UpdateGenreRequest) {
  // PUT/PATCH endpoints often return 204 No Content — swallow parse errors
  try {
    await request(
      `${ApiRoot}/api/v1/genres/${id}`,
      { method: "PUT", body: input },
      EmptyResponseSchema
    )
  } catch (err) {
    // Re-throw only real errors, not empty-body parse failures
    if (!isEmptyBodyError(err)) throw err
  }
}

export async function deleteGenre(id: string) {
  // DELETE typically returns 204 No Content — swallow parse errors
  try {
    await request(
      `${ApiRoot}/api/v1/genres/${id}`,
      { method: "DELETE" },
      EmptyResponseSchema
    )
  } catch (err) {
    if (!isEmptyBodyError(err)) throw err
  }
}

/**
 * Returns true if the error is caused by trying to parse an empty body
 * (common with 204 No Content responses).
 */
function isEmptyBodyError(err: unknown): boolean {
  if (!(err instanceof SyntaxError)) return false
  const msg = err.message.toLowerCase()
  return (
    msg.includes("unexpected end") ||
    msg.includes("unexpected token") ||
    msg.includes("is not valid json")
  )
}