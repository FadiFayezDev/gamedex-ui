import { z } from "zod"

import { request } from "@/lib/services/http"

const EmptyResponseSchema = z.unknown().nullable()

export type CreateModManagerRequest = {
  name?: string
  description?: string
}

export async function createModManager(input: CreateModManagerRequest) {
  await request(
    "/api/v1/mod-managers",
    { method: "POST", body: input },
    EmptyResponseSchema
  )
}

export async function listModManagers() {
  return request("/api/v1/mod-managers", { method: "GET" }, EmptyResponseSchema)
}

export async function getModManager(id: string) {
  return request(
    `/api/v1/mod-managers/${id}`,
    { method: "GET" },
    EmptyResponseSchema
  )
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
    `/api/v1/mod-managers/${id}`,
    { method: "PUT", body: input },
    EmptyResponseSchema
  )
}
