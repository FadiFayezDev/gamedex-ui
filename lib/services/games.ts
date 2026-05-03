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

const getString = (value: unknown) =>
  typeof value === "string" ? value : undefined

const getNumber = (value: unknown) => {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = parseFloat(value)
    if (!Number.isNaN(parsed)) return parsed
  }
  return undefined
}

const getRelatedEntityId = (value: unknown) => {
  if (!value || typeof value !== "object") return undefined
  return getString((value as { id?: unknown; Id?: unknown }).id) ??
    getString((value as { id?: unknown; Id?: unknown }).Id)
}

const getRelatedEntityName = (value: unknown) => {
  if (typeof value === "string") return value
  if (!value || typeof value !== "object") return undefined
  return getString((value as { name?: unknown; Name?: unknown }).name) ??
    getString((value as { name?: unknown; Name?: unknown }).Name)
}

const mapRelatedEntityIds = (values: unknown[]) =>
  values.map(getRelatedEntityId).filter((value): value is string => Boolean(value))

const mapRelatedEntityNames = (values: unknown[]) =>
  values
    .map(getRelatedEntityName)
    .filter((value): value is string => Boolean(value))

export const normalizeGame = (apiGame: unknown): Game => {
  const source = apiGame as Record<string, unknown>

  const rawGenres = Array.isArray(source.genres)
    ? source.genres
    : Array.isArray(source.Genres)
      ? source.Genres
      : []
  const mappedGenreIds = mapRelatedEntityIds(rawGenres)
  const mappedGenres = mapRelatedEntityNames(rawGenres)

  const rawPlatforms = Array.isArray(source.platforms)
    ? source.platforms
    : Array.isArray(source.Platforms)
      ? source.Platforms
      : []
  const firstPlatformId =
    rawPlatforms.length > 0
      ? typeof rawPlatforms[0] === "string"
        ? rawPlatforms[0]
        : getRelatedEntityId(rawPlatforms[0]) ?? null
      : null
  const mappedPlatforms = mapRelatedEntityNames(rawPlatforms)

  const rawTags = Array.isArray(source.tags)
    ? source.tags
    : Array.isArray(source.Tags)
      ? source.Tags
      : []
  const mappedTagIds = mapRelatedEntityIds(rawTags)
  const mappedTags = mapRelatedEntityNames(rawTags)

  return GameSchema.parse({
    id: getString(source.id) ?? getString(source.Id) ?? makeId(),
    title:
      getString(source.title) ??
      getString(source.Title) ??
      getString(source.name) ??
      getString(source.Name) ??
      "Untitled Game",
    coverUrl:
      getString(source.coverUrl) ??
      getString(source.CoverUrl) ??
      getString(source.cover) ??
      getString(source.Cover) ??
      null,
    priceAmount:
      getNumber(source.priceAmount) ??
      getNumber(source.PriceAmount) ??
      getNumber(source.price) ??
      getNumber(source.Price) ??
      getNumber(source.amount) ??
      getNumber(source.Amount) ??
      null,
    priceCurrency:
      getString(source.priceCurrency) ??
      getString(source.PriceCurrency) ??
      getString(source.currency) ??
      getString(source.Currency) ??
      null,
    installSizeGb:
      getNumber(source.installSizeBytes) ??
      getNumber(source.InstallSizeBytes) ??
      getNumber(source.installSizeGb) ??
      getNumber(source.InstallSizeGb) ??
      getNumber(source.installSize) ??
      getNumber(source.InstallSize) ??
      null,
    genreIds:
      Array.isArray(source.genreIds) && source.genreIds.length > 0
        ? source.genreIds.filter((value): value is string => typeof value === "string")
        : mappedGenreIds,
    genres: mappedGenres.length > 0 ? mappedGenres : undefined,
    platformId:
      getString(source.platformId) ??
      getString(source.PlatformId) ??
      getRelatedEntityId(source.platform) ??
      getRelatedEntityId(source.Platform) ??
      firstPlatformId,
    platforms: mappedPlatforms.length > 0 ? mappedPlatforms : undefined,
    tagIds: mappedTagIds,
    tags: mappedTags.length > 0 ? mappedTags : undefined,
    rating: getNumber(source.rating) ?? getNumber(source.Rating) ?? null,
    criticRating:
      getNumber(source.criticRating) ?? getNumber(source.CriticRating) ?? null,
    userRating:
      getNumber(source.userRating) ?? getNumber(source.UserRating) ?? null,
    ageRating: getNumber(source.ageRating) ?? getNumber(source.AgeRating) ?? null,
    isFavorite: !!(source.isFavorite ?? source.IsFavorite ?? false),
    isPlayed: !!(source.isPlayed ?? source.IsPlayed ?? false),
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
  return list.map((item) => normalizeGame(item))
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

  return normalizeGame(mergedData)
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

// تحديث الـ Type والـ Function
export type SetGameInstallSizeRequest = { installSizeGb?: number | null }

export async function setGameInstallSize(
  id: string,
  input: SetGameInstallSizeRequest
) {
  await request(
    `${ApiRoot}/api/v1/games/${id}/install-size`,
    { method: "PUT", body: input }, // هتبعت { "installSizeGb": 50 }
    EmptyResponseSchema
  )
}
//#endregion

//#region Requirements & Technical Profiles
export async function addRequirement(id: string, input: unknown) {
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

export async function addPerformanceProfile(id: string, input: unknown) {
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
export async function addMission(id: string, input: unknown) {
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

export async function addCharacterProfile(id: string, input: unknown) {
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

export async function addDlc(id: string, input: unknown) {
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

export async function addControlMapping(id: string, input: unknown) {
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
  return list.map((item) => normalizeGame(item));
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
