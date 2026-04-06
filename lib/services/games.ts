import { z } from "zod"
import { AddGameInput } from "@/lib/schemas/add-game"
import { GameDetails } from "@/components/models/gameCatalog/game"
import { Game, GameSchema } from "@/lib/schemas/game"
import { request } from "@/lib/services/http"
import { ApiRoot } from "@/components/root/root"

//#region Schemas & Helpers
const ApiGameSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().optional(),
    name: z.string().optional(),
    coverUrl: z.string().url().optional().nullable(),
    priceUsd: z.number().optional().nullable(),
    installSizeGb: z.number().optional().nullable(),
    genreIds: z.array(z.string()).optional(),
    platformId: z.string().optional().nullable(),
    rating: z.number().optional().nullable(),
    isFavorite: z.boolean().optional(),
    isPlayed: z.boolean().optional(),
  })
  .passthrough()

const ApiGameListSchema = z.union([
  z.array(ApiGameSchema),
  z.object({ items: z.array(ApiGameSchema) }),
])

const ApiGameListResponse = ApiGameListSchema.nullable()
const ApiGameResponse = ApiGameSchema.nullable()
const EmptyResponseSchema = z.unknown().nullable()

const makeId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `game-${Math.random().toString(36).slice(2, 10)}`

const toGame = (apiGame: z.infer<typeof ApiGameSchema>): Game =>
  GameSchema.parse({
    id: apiGame.id ?? makeId(),
    title: apiGame.title ?? apiGame.name ?? "Untitled Game",
    coverUrl: apiGame.coverUrl ?? null,
    priceUsd: apiGame.priceUsd ?? null,
    installSizeGb: apiGame.installSizeGb ?? null,
    genreIds: apiGame.genreIds ?? [],
    platformId: apiGame.platformId ?? null,
    rating: apiGame.rating ?? null,
    isFavorite: apiGame.isFavorite ?? false,
    isPlayed: apiGame.isPlayed ?? false,
  })
//#endregion

//#region Core Game Services (CRUD)
export async function listGames() {
  const data = await request(
    `${ApiRoot}/api/v1/games`,
    { method: "GET" },
    ApiGameListResponse
  )
  if (!data) return []
  const list = Array.isArray(data) ? data : data.items
  return list.map((item) => toGame(item))
}

export async function getGame(id: string) {
  const res = await fetch(`${ApiRoot}/api/v1/games/${id}`, { method: "GET" })
  if (!res.ok) throw new Error("Game not found")
  return (await res.json()) as GameDetails
}

export async function createGame(input: AddGameInput) {
  const formData = new FormData()
  formData.append("Title", input.title)
  if (input.description) formData.append("Description", input.description)
  if (input.releaseDate) formData.append("ReleaseDate", input.releaseDate)
  formData.append("AgeRating", String(input.ageRating ?? 0))
  if (input.cover) formData.append("Cover", input.cover)

  const data = await request(
    `${ApiRoot}/api/v1/games`,
    { method: "POST", body: formData },
    ApiGameResponse
  )
  return data ? toGame(data) : toGame({ id: makeId(), title: input.title })
}

export async function deleteGame(id: string) {
  await request(
    `${ApiRoot}/api/v1/games/${id}`,
    { method: "DELETE" },
    EmptyResponseSchema
  )
}
//#endregion

//#region Game Details & Settings
export type UpdateGameDetailsRequest = {
  title?: string
  description?: string
  releaseDate?: string
  ageRating?: number
}
export async function updateGameDetails(
  id: string,
  input: UpdateGameDetailsRequest
) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/details`,
    { method: "PUT", body: input },
    EmptyResponseSchema
  )
}

export type SetGameRatingsRequest = {
  criticRating?: number | null
  userRating?: number | null
}
export async function setGameRatings(id: string, input: SetGameRatingsRequest) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/ratings`,
    { method: "PUT", body: input },
    EmptyResponseSchema
  )
}

export type SetGamePriceRequest = { amount?: number; currency?: string }
export async function setGamePrice(id: string, input: SetGamePriceRequest) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/price`,
    { method: "PUT", body: input },
    EmptyResponseSchema
  )
}

export type SetGameInstallSizeRequest = { installSizeBytes?: number }
export async function setGameInstallSize(
  id: string,
  input: SetGameInstallSizeRequest
) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/install-size`,
    { method: "PUT", body: input },
    EmptyResponseSchema
  )
}
//#endregion

//#region Requirements & Technical Profiles
export async function addRequirement(id: string, input: any) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/requirements`,
    { method: "POST", body: input },
    EmptyResponseSchema
  )
}

export async function deleteRequirement(id: string, requirementId: string) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/requirements/${requirementId}`,
    { method: "DELETE" },
    EmptyResponseSchema
  )
}

export async function addPerformanceProfile(id: string, input: any) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/performance-profiles`,
    { method: "POST", body: input },
    EmptyResponseSchema
  )
}

export async function deletePerformanceProfile(
  id: string,
  profileId: string
) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/performance-profiles/${profileId}`,
    { method: "DELETE" },
    EmptyResponseSchema
  )
}
//#endregion

//#region Gameplay Content (Missions, DLCs, Characters, Controls)
export async function addMission(id: string, input: any) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/missions`,
    { method: "POST", body: input },
    EmptyResponseSchema
  )
}

export async function deleteMission(id: string, missionId: string) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/missions/${missionId}`,
    { method: "DELETE" },
    EmptyResponseSchema
  )
}

export async function addCharacterProfile(id: string, input: any) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/character-profiles`,
    { method: "POST", body: input },
    EmptyResponseSchema
  )
}

export async function deleteCharacterProfile(
  id: string,
  characterProfileId: string
) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/character-profiles/${characterProfileId}`,
    { method: "DELETE" },
    EmptyResponseSchema
  )
}

export async function addDlc(id: string, input: any) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/dlcs`,
    { method: "POST", body: input },
    EmptyResponseSchema
  )
}

export async function deleteDlc(id: string, dlcId: string) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/dlcs/${dlcId}`,
    { method: "DELETE" },
    EmptyResponseSchema
  )
}

export async function addControlMapping(id: string, input: any) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/control-mappings`,
    { method: "POST", body: input },
    EmptyResponseSchema
  )
}

export async function deleteControlMapping(
  id: string,
  controlMappingId: string
) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/control-mappings/${controlMappingId}`,
    { method: "DELETE" },
    EmptyResponseSchema
  )
}
//#endregion

//#region Media Management (Screenshots, Trailers, Cover, Media Assets)
export function getGameCoverUrl(id: string) {
  return `${ApiRoot}/api/v1/games/${id}/media/cover`
}
export function getGameTrailerUrl(id: string) {
  return `${ApiRoot}/api/v1/games/${id}/media/trailers`
}
export function getGameScreenshotUrl(id: string, screenshotName: string) {
  return `${ApiRoot}/api/v1/games/${id}/media/screenshot/${screenshotName}`
}

export async function updateGameCover(id: string, file: File) {
  const formData = new FormData();
  formData.append("Cover", file); // الـ Key اللي الـ API مستنيه
  
  await request(
    `${ApiRoot}/api/v1/games/${id}/media/cover`,
    { method: "PUT", body: formData },
    EmptyResponseSchema
  );
}

export async function deleteGameCover(id: string) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/media/cover`,
    { method: "DELETE" },
    EmptyResponseSchema
  )
}

export async function uploadGameScreenshot(id: string, file: File) {
  const formData = new FormData()
  formData.append("Screenshot", file)
  
  await request(
    `${ApiRoot}/api/v1/games/${id}/media/screenshots`,
    { method: "POST", body: formData },
    EmptyResponseSchema
  )
}

export async function listScreenshots(id: string) {
  return await request(
    `${ApiRoot}/api/v1/games/${id}/media/screenshots`,
    { method: "GET" },
    z.array(z.string())
  )
}

export async function deleteScreenshot(id: string, screenshotName: string) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/media/screenshots/${screenshotName}`,
    { method: "DELETE" },
    EmptyResponseSchema
  )
}

// 3. رفع Trailer أو إعلان (POST)
export async function uploadGameTrailer(id: string, file: File) {
  const formData = new FormData()
  formData.append("trailer", file)
  
  await request(
    `${ApiRoot}/api/v1/games/${id}/media/trailer`,
    { method: "POST", body: formData },
    EmptyResponseSchema
  )
}

export async function deleteTrailer(id: string) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/media/trailers`,
    { method: "DELETE" },
    EmptyResponseSchema
  )
}

export function getTrailerUrl(id: string) {
  return `${ApiRoot}/api/v1/games/${id}/media/trailer`
}

// Generic media assets (screenshots, videos, artwork stored by URL)
export async function addMediaAsset(id: string, input: { type: number; file?: File }) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/media-assets`,
    { method: "POST", body: input },
    EmptyResponseSchema
  )
}

export async function deleteMediaAsset(id: string, mediaAssetId: string) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/media-assets/${mediaAssetId}`,
    { method: "DELETE" },
    EmptyResponseSchema
  )
}
//#endregion