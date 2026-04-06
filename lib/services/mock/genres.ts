import { Genre, GenreSchema } from "@/lib/schemas/game"

const seedGenres: Genre[] = [
  { id: "action", name: "Action" },
  { id: "rpg", name: "RPG" },
  { id: "adventure", name: "Adventure" },
  { id: "simulation", name: "Simulation" },
  { id: "racing", name: "Racing" },
]

export const genres = seedGenres.map((genre) => GenreSchema.parse(genre))

export async function listGenres() {
  return genres
}
