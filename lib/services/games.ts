import { z } from "zod"
import { AddGameInput } from "@/lib/schemas/add-game"
import { GameDetails } from "@/components/models/gameCatalog/game"
import { Game, GameSchema } from "@/lib/schemas/game"
import { request } from "@/lib/services/http"
import { ApiRoot } from "@/components/root/root"
import { FilterModel } from "@/components/models/filterModel"

//#region Schemas & Helpers
const ApiGameSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().optional(),
    name: z.string().optional(),
    coverUrl: z.string().optional().nullable(),
    cover: z.string().optional().nullable(),
    priceAmount: z.number().optional().nullable(),
    priceCurrency: z.string().optional().nullable(),
    installSizeGb: z.number().optional().nullable(),
    genreIds: z.array(z.string()).optional(),
    platformId: z.string().optional().nullable(),
    rating: z.number().optional().nullable(),
    criticRating: z.number().optional().nullable(),
    userRating: z.number().optional().nullable(),
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

const toGame = (apiGame: any): Game => {
  const getString = (v: any) => (typeof v === "string" ? v : undefined)
  const getNumber = (v: any) => (typeof v === "number" ? v : undefined)

  return GameSchema.parse({
    id: apiGame.id ?? apiGame.Id ?? makeId(),
    title: getString(apiGame.title) ?? getString(apiGame.Title) ?? getString(apiGame.name) ?? getString(apiGame.Name) ?? "Untitled Game",
    coverUrl: getString(apiGame.coverUrl) ?? getString(apiGame.CoverUrl) ?? getString(apiGame.cover) ?? getString(apiGame.Cover) ?? null,
    priceAmount: getNumber(apiGame.priceAmount) ?? getNumber(apiGame.PriceAmount) ?? getNumber(apiGame.price) ?? getNumber(apiGame.Price) ?? getNumber(apiGame.amount) ?? getNumber(apiGame.Amount) ?? null,
    priceCurrency: getString(apiGame.priceCurrency) ?? getString(apiGame.PriceCurrency) ?? getString(apiGame.currency) ?? getString(apiGame.Currency) ?? null,
    installSizeGb: getNumber(apiGame.installSizeGb) ?? getNumber(apiGame.InstallSizeGb) ?? getNumber(apiGame.installSize) ?? getNumber(apiGame.InstallSize) ?? null,
    genreIds: Array.isArray(apiGame.genreIds) ? apiGame.genreIds : (Array.isArray(apiGame.GenreIds) ? apiGame.GenreIds : []),
    platformId: getString(apiGame.platformId) ?? getString(apiGame.PlatformId) ?? getString(apiGame.platform?.id) ?? getString(apiGame.Platform?.Id) ?? null,
    rating: getNumber(apiGame.rating) ?? getNumber(apiGame.Rating) ?? null,
    criticRating: getNumber(apiGame.criticRating) ?? getNumber(apiGame.CriticRating) ?? null,
    userRating: getNumber(apiGame.userRating) ?? getNumber(apiGame.UserRating) ?? null,
    isFavorite: !!(apiGame.isFavorite ?? apiGame.IsFavorite ?? false),
    isPlayed: !!(apiGame.isPlayed ?? apiGame.IsPlayed ?? false),
  })
}
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
  if (input.price !== undefined) formData.append("Price", String(input.price))
  if (input.currency) formData.append("Currency", input.currency)
  if (input.cover) formData.append("Cover", input.cover)

  const data = await request(
    `${ApiRoot}/api/v1/games`,
    { method: "POST", body: formData },
    ApiGameResponse
  )
  
  // Merge server response with user input to ensure we don't lose data
  // if the server returns a partial object (like just the Id).
  const mergedData = {
    ...input,
    // AddGameInput uses 'price', toGame handles 'price' or 'priceAmount'
    // AddGameInput uses 'currency', toGame handles 'currency' or 'priceCurrency'
    ...(data || {})
  }

  return toGame(mergedData)
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

export type SetGamePriceRequest = {
  amount?: number | null
  currency?: string | null
}
export async function setGamePrice(id: string, input: SetGamePriceRequest) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/price`,
    { method: "PUT", body: input },
    EmptyResponseSchema
  )
}

export type SetGameInstallSizeRequest = { installSizeBytes?: number | null }
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

export async function deletePerformanceProfile(id: string, profileId: string) {
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
  const formData = new FormData()
  formData.append("Cover", file) // الـ Key اللي الـ API مستنيه

  await request(
    `${ApiRoot}/api/v1/games/${id}/media/cover`,
    { method: "PUT", body: formData },
    EmptyResponseSchema
  )
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
export async function addMediaAsset(
  id: string,
  input: { type: number; file?: File }
) {
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

//#region
export async function sendFilterData(filterData: FilterModel | null) {
  if (!filterData) return [];

  const data = await request(
    `${ApiRoot}/api/v1/games/filters`,
    { 
      method: "POST", 
      body: filterData, // ← مش JSON.stringify، خلّي request() تتعامل معاه
    },
    ApiGameListResponse
  );

  if (!data) return [];
  const list = Array.isArray(data) ? data : data.items;
  return list.map((item) => toGame(item));
}

export async function exportGame(id: string, title: string = "game") {
  const res = await fetch(`${ApiRoot}/api/GamePackage/export/${id}`, {
    method: "POST",
  })

  if (!res.ok) throw new Error("Export failed")

  // If the backend handles the picker and saving, it might return 200 OK with no body.
  // We check if there's a blob to download (fallback/legacy).
  const contentType = res.headers.get("content-type")
  if (!contentType || !contentType.includes("application/octet-stream")) {
    return
  }

  const blob = await res.blob()
  const downloadUrl = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = downloadUrl
  a.download = `${title}.gamedex`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(downloadUrl)
  document.body.removeChild(a)
}

export async function importGame(file: File) {
  const formData = new FormData()
  formData.append("package", file)

  const res = await fetch(`${ApiRoot}/api/GamePackage/import`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    if (res.status === 409) {
      throw new Error("ALREADY_EXISTS")
    }
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || "Import failed")
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}
//#endregion
