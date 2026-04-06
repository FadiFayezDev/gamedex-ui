import { Platform, PlatformSchema } from "@/lib/schemas/game"

const seedPlatforms: Platform[] = [
  { id: "pc", name: "PC / Windows" },
  { id: "ps5", name: "PlayStation 5" },
  { id: "xbox", name: "Xbox Series X" },
]

export const platforms = seedPlatforms.map((platform) =>
  PlatformSchema.parse(platform)
)

export async function listPlatforms() {
  return platforms
}
