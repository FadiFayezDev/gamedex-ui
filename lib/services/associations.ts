import { z } from "zod"

import { request } from "@/lib/services/http"
import { ApiRoot } from "@/components/root/root"

const EmptyResponseSchema = z.unknown().nullable()

export type CreateGameAssociationRequest = {
  gameId?: string
  associatedEntityId?: string
  type?: number
  roleOrMeta?: string
}

export async function createAssociation(input: CreateGameAssociationRequest) {
  await request(
    `${ApiRoot}/api/v1/associations`,
    { method: "POST", body: input },
    EmptyResponseSchema
  )
}

export async function deleteAssociation(id: string) {
  await request(
    `${ApiRoot}/api/v1/associations/${id}`,
    { method: "DELETE" },
    EmptyResponseSchema
  )
}
