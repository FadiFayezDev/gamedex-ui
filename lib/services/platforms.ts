import { z } from "zod"

import { Platform, PlatformSchema } from "@/lib/schemas/game"
import { request } from "@/lib/services/http"
import { ApiRoot } from "@/components/root/root"

const ApiPlatformSchema = z
  .object({
    id: z.coerce.string().optional(),
    name: z.string().optional(),
    title: z.string().optional(),
  })
  .passthrough()

const ApiPlatformListSchema = z.union([
  z.array(ApiPlatformSchema),
  z.object({ items: z.array(ApiPlatformSchema) }),
])

const ApiPlatformListResponse = ApiPlatformListSchema.nullable()
const ApiPlatformResponse = ApiPlatformSchema.nullable()
const EmptyResponseSchema = z.unknown().nullable()

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const toPlatform = (apiPlatform: z.infer<typeof ApiPlatformSchema>): Platform =>
  PlatformSchema.parse({
    id:
      apiPlatform.id ??
      slugify(apiPlatform.name ?? apiPlatform.title ?? "platform"),
    name: apiPlatform.name ?? apiPlatform.title ?? "Unknown",
  })

export async function listPlatforms() {
  const data = await request(
    `${ApiRoot}/api/v1/platforms`,
    { method: "GET" },
    ApiPlatformListResponse
  )
  if (!data) return []
  const list = Array.isArray(data) ? data : data.items
  return list.map((item) => toPlatform(item))
}

export type CreatePlatformRequest = { name?: string }

export async function createPlatform(input: CreatePlatformRequest) {
  const data = await request(
    `${ApiRoot}/api/v1/platforms`,
    { method: "POST", body: input },
    ApiPlatformResponse
  )
  return data ? toPlatform(data) : null
}

export async function getPlatform(id: string) {
  const data = await request(
    `${ApiRoot}/api/v1/platforms/${id}`,
    { method: "GET" },
    ApiPlatformResponse
  )
  return data ? toPlatform(data) : null
}

export type UpdatePlatformNameRequest = { newName?: string }

export async function updatePlatformName(
  id: string,
  input: UpdatePlatformNameRequest
) {
  await request(
    `${ApiRoot}/api/v1/platforms/${id}`,
    { method: "PUT", body: input },
    EmptyResponseSchema
  )
}

export async function deletePlatform(id: string) {
  await request(
    `${ApiRoot}/api/v1/platforms/${id}`,
    { method: "DELETE" },
    EmptyResponseSchema
  )
}