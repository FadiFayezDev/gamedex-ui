import { AddGameInput } from "@/lib/schemas/add-game"
import { Game, GameSchema } from "@/lib/schemas/game"

const seedGames: Game[] = [
  {
    id: "game-cyberfall",
    title: "Cyberfall 2099",
    coverUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7Cz9XvDNq97CWCZCWUWLjiPiNMXQRe5RPxfoVYDOaT9I3SrWc0U3BHOX4b0bxBy_Lh9n80-a4MdCaYNBiHL-PyiAXZ9JvjheXySbnCNhQhDRRU8Cpz7Xkfnk_VjMB-PtL2_g3pGnD4WXD5Cs0_r7-NHrw1HBGNY8wVhWpJrDjZbPB0t5CwWhNS4SFmTLnq430aIfy1JXszJgAyWNsy0O2CJlVk01_eNNXr6EX34-SAuVn8GUKolvXCt2dQjJ0FwEkjVPT1B6v57io",
    priceAmount: 59,
    priceCurrency: "USD",
    installSizeGb: 48,
    genreIds: ["action", "adventure"],
    platformId: "pc",
    rating: 4.5,
    isFavorite: true,
    isPlayed: true,
    tagIds: [],
  },
  {
    id: "game-eldritch",
    title: "Eldritch Realms",
    coverUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBTjhj7BWIclXLEcdM6FVDyMD5BVd-Rg18480XnTAN_X_Xu8Qecdr7TAXs1ZQy3gJ46WDnCUn_dxwlptQsbW5POvHmHbxZ_x1SFkd-oPfPbpwUFknCJ0LkIC-HXvzUj8G2315SvbCmw8qpYUcQrtRUiQco1p_3pk9Sn7EFbBCBQTva0xmOGovn7TCDvUDWrhKxBGOLLqksovlAfQOsWGhlomTh34BsvwrF0faOPQ6dKXzJeqNBjTchm9KnumxZffjMPHMoEj--iIQb4",
    priceAmount: 39,
    priceCurrency: "USD",
    installSizeGb: 22,
    genreIds: ["rpg"],
    platformId: "ps5",
    rating: 4.1,
    isFavorite: false,
    isPlayed: true,
    tagIds: [],
  },
  {
    id: "game-velocity",
    title: "Velocity X",
    coverUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAarjKIPJHFgSSoxEmt3S401SnMQyUplEYZmxe6HJ28DyC1kTy86OAN-lZh9wu0hBjv7HtPd3rqwFG5mEs_9LvoLYG4kiDds_27kXwuoG9JHZ9Q4hTtI3Q0s8gzBa0jXUzh9SraoCVwYMmtryD51_0pkTYfnLbtpY2vsjCwBTKqq5_XXxgDEQJDyqosK6qiG68YoSXGwtQQikfiA6KLm4pY79jpFIq0KOx_nJGj0hU0YsiOZapxhiP38W7eXfQYjcphOR7j06MmitPM",
    priceAmount: 24,
    priceCurrency: "USD",
    installSizeGb: 12,
    genreIds: ["racing"],
    platformId: "xbox",
    rating: 3.8,
    isFavorite: true,
    isPlayed: false,
    tagIds: [],
  },
  {
    id: "game-noir",
    title: "Noir Protocol",
    coverUrl: null,
    priceAmount: 29,
    priceCurrency: "USD",
    installSizeGb: 9,
    genreIds: ["action"],
    platformId: "pc",
    rating: 4.0,
    isFavorite: false,
    isPlayed: false,
    tagIds: [],
  },
]

let games = seedGames.map((game) => GameSchema.parse(game))

const makeId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `game-${Math.random().toString(36).slice(2, 10)}`

export async function listGames() {
  return games
}

export async function getGame(id: string) {
  const game = games.find((item) => item.id === id)
  if (!game) {
    throw new Error("Game not found")
  }
  return game
}

export async function createGame(input: AddGameInput) {
  const newGame: Game = GameSchema.parse({
    id: makeId(),
    title: input.title,
    coverUrl: null,
    priceAmount: input.price ?? 0,
    priceCurrency: input.currency ?? "USD",
    installSizeGb: 20,
    genreIds: [input.genreId],
    platformId: input.platformId,
    rating: input.rating ?? 0,
    isFavorite: false,
    isPlayed: false,
    tagIds: [],
  })

  games = [newGame, ...games]
  return newGame
}
