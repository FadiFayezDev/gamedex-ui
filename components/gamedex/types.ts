export type ViewMode = "grid" | "list"

export type LibraryFilters = {
  query: string
  priceMax: number
  storage: "all" | "lt10" | "10-50" | "50-100"
  genreIds: string[]
  platformId: string
  minRating: number
}
