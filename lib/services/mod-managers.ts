import { z } from "zod"

import { request } from "@/lib/services/http"
import { ApiRoot } from "@/components/root/root"

// ─── Schema ────────────────────────────────────────────────────────────────────

const ApiModManagerSchema = z
  .object({
    id: z.coerce.string().optional(),
    name: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
  })
  .passthrough()

const ApiModManagerListSchema = z.union([
  z.array(ApiModManagerSchema),
  z.object({ items: z.array(ApiModManagerSchema) }),
])

const ApiModManagerListResponse = ApiModManagerListSchema.nullable()
const ApiModManagerResponse = ApiModManagerSchema.nullable()
const EmptyResponseSchema = z.unknown().nullable()

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ModManager = {
  id: string
  name: string
  description?: string
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const toModManager = (
  api: z.infer<typeof ApiModManagerSchema>
): ModManager => ({
  id: api.id ?? slugify(api.name ?? api.title ?? "mod-manager"),
  name: api.name ?? api.title ?? "Unknown",
  description: api.description,
})

// ─── Service ───────────────────────────────────────────────────────────────────

export async function listModManagers() {
  const data = await request(
    `${ApiRoot}/api/v1/mod-managers`,
    { method: "GET" },
    ApiModManagerListResponse
  )
  if (!data) return []
  const list = Array.isArray(data) ? data : data.items
  return list.map(toModManager)
}

export type CreateModManagerRequest = {
  name?: string
  description?: string
}

export async function createModManager(input: CreateModManagerRequest) {
  const data = await request(
    `${ApiRoot}/api/v1/mod-managers`,
    { method: "POST", body: input },
    ApiModManagerResponse
  )
  return data ? toModManager(data) : null
}

export async function getModManager(id: string) {
  const data = await request(
    `${ApiRoot}/api/v1/mod-managers/${id}`,
    { method: "GET" },
    ApiModManagerResponse
  )
  return data ? toModManager(data) : null
}

export type UpdateModManagerRequest = {
  name?: string
  description?: string
}

export async function updateModManager(
  id: string,
  input: UpdateModManagerRequest
) {
  await request(
    `${ApiRoot}/api/v1/mod-managers/${id}`,
    { method: "PUT", body: input },
    EmptyResponseSchema
  )
}

export async function deleteModManager(id: string) {
  await request(
    `${ApiRoot}/api/v1/mod-managers/${id}`,
    { method: "DELETE" },
    EmptyResponseSchema
  )
}