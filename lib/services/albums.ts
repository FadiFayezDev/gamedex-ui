import { z } from "zod"

import { request } from "@/lib/services/http"
import { ApiRoot } from "@/components/root/root"

const EmptyResponseSchema = z.unknown().nullable()

export type PublishAlbumRequest = {
  title?: string
  gameId?: string
  releaseDate?: string
}

export async function publishAlbum(input: PublishAlbumRequest) {
  await request(
    `${ApiRoot}/api/v1/albums`,
    { method: "POST", body: input },
    EmptyResponseSchema
  )
}

export async function getAlbum(id: string) {
  return request(
    `${ApiRoot}/api/v1/albums/${id}`,
    { method: "GET" },
    EmptyResponseSchema
  )
}

export async function deleteAlbum(id: string) {
  await request(
    `${ApiRoot}/api/v1/albums/${id}`,
    { method: "DELETE" },
    EmptyResponseSchema
  )
}

export type AddSongRequest = {
  title?: string
  trackNumber?: number
  durationSeconds?: number
}

export async function addSongToAlbum(albumId: string, input: AddSongRequest) {
  await request(
    `${ApiRoot}/api/v1/albums/${albumId}/songs`,
    { method: "POST", body: input },
    EmptyResponseSchema
  )
}

export async function deleteAlbumSong(albumId: string, songId: string) {
  await request(
    `${ApiRoot}/api/v1/albums/${albumId}/songs/${songId}`,
    { method: "DELETE" },
    EmptyResponseSchema
  )
}
