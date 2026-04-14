import { z } from "zod"
import { request } from "@/lib/services/http"
import { ApiRoot } from "@/components/root/root"

//#region Schemas & Types
const PlaylistSummarySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  type: z.number().int().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().nullable().optional(),
  gameCount: z.number().int().optional(),
})

const PlaylistSummaryListSchema = z.array(PlaylistSummarySchema).nullable()

const PlaylistDetailsSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  type: z.number().int().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().nullable().optional(),
  games: z.array(z.unknown()).nullable().optional(),
})

const EmptyResponseSchema = z.unknown().nullable()

export type PlaylistSummary = z.infer<typeof PlaylistSummarySchema>
export type PlaylistDetails = z.infer<typeof PlaylistDetailsSchema>
//#endregion

//#region Core Playlist Services (CRUD)
export type CreatePlaylistRequest = {
  name: string
  description?: string
  type?: number
}

export async function createPlaylist(input: CreatePlaylistRequest) {
  await request(
    `${ApiRoot}/api/v1/playlists`,
    { method: "POST", body: input },
    EmptyResponseSchema
  )
}

export async function listPlaylists(): Promise<PlaylistSummary[]> {
  const data = await request(
    `${ApiRoot}/api/v1/playlists`,
    { method: "GET" },
    PlaylistSummaryListSchema
  )
  return data ?? []
}

export async function getPlaylist(id: string): Promise<PlaylistDetails> {
  const res = await fetch(`${ApiRoot}/api/v1/playlists/${id}`, {
    method: "GET",
  })
  if (!res.ok) throw new Error("Playlist not found")
  return (await res.json()) as PlaylistDetails
}

export type UpdatePlaylistRequest = {
  name?: string
  description?: string
}

export async function updatePlaylist(id: string, input: UpdatePlaylistRequest) {
  await request(
    `${ApiRoot}/api/v1/playlists/${id}`,
    { method: "PUT", body: input },
    EmptyResponseSchema
  )
}

export async function deletePlaylist(id: string) {
  await request(
    `${ApiRoot}/api/v1/playlists/${id}`,
    { method: "DELETE" },
    EmptyResponseSchema
  )
}
//#endregion

//#region Playlist Games Management
export async function addGameToPlaylist(id: string, gameId: string) {
  await request(
    `${ApiRoot}/api/v1/playlists/${id}/games`,
    { method: "POST", body: { gameId } },
    EmptyResponseSchema
  )
}

export async function removeGameFromPlaylist(id: string, gameId: string) {
  await request(
    `${ApiRoot}/api/v1/playlists/${id}/games/${gameId}`,
    { method: "DELETE" },
    EmptyResponseSchema
  )
}
//#endregion