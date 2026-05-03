import { z } from "zod"

import { Tag, TagSchema } from "@/lib/schemas/game"
import { request } from "@/lib/services/http"
import { ApiRoot } from "@/components/root/root"

const ApiTagSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    title: z.string().optional(),
  })
  .passthrough()

const ApiTagListSchema = z.union([
  z.array(ApiTagSchema),
  z.object({ items: z.array(ApiTagSchema) }),
])

const ApiTagListResponse = ApiTagListSchema.nullable()
const ApiTagResponse = ApiTagSchema.nullable()
const EmptyResponseSchema = z.unknown().nullable()

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const toTag = (apiTag: z.infer<typeof ApiTagSchema>): Tag =>
  TagSchema.parse({
    id: apiTag.id ?? slugify(apiTag.name ?? apiTag.title ?? "tag"),
    name: apiTag.name ?? apiTag.title ?? "Unknown",
  })

export async function listTags() {
  const data = await request(
    `${ApiRoot}/api/v1/tags`,
    { method: "GET" },
    ApiTagListResponse
  )
  if (!data) return []
  const list = Array.isArray(data) ? data : data.items
  return list.map((item) => toTag(item))
}

export type CreateTagRequest = { name?: string }

export async function createTag(input: CreateTagRequest) {
  const data = await request(
    `${ApiRoot}/api/v1/tags`,
    { method: "POST", body: input },
    ApiTagResponse
  )
  return data ? toTag(data) : null
}

export async function getTag(id: string) {
  const data = await request(
    `${ApiRoot}/api/v1/tags/${id}`,
    { method: "GET" },
    ApiTagResponse
  )
  return data ? toTag(data) : null
}

export type UpdateTagRequest = { name?: string }

export async function updateTag(id: string, input: UpdateTagRequest) {
  try {
    await request(
      `${ApiRoot}/api/v1/tags/${id}`,
      { method: "PUT", body: input },
      EmptyResponseSchema
    )
  } catch (err) {
    if (!isEmptyBodyError(err)) throw err
  }
}

export async function deleteTag(id: string) {
  try {
    await request(
      `${ApiRoot}/api/v1/tags/${id}`,
      { method: "DELETE" },
      EmptyResponseSchema
    )
  } catch (err) {
    if (!isEmptyBodyError(err)) throw err
  }
}

function isEmptyBodyError(err: unknown): boolean {
  if (!(err instanceof SyntaxError)) return false
  const msg = err.message.toLowerCase()
  return (
    msg.includes("unexpected end") ||
    msg.includes("unexpected token") ||
    msg.includes("is not valid json")
  )
}
