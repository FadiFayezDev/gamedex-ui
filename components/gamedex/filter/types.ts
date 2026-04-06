export type RangeFilter = {
  price: {
    min: number
    max: number
  }
  size: {
    min: number
    max: number
  }
}

export type FilterModel = {
  search: string
  sortBy: string
  checkboxes: Record<string, string[]>
  range: RangeFilter
  platformId: string
  minRating: number
}
