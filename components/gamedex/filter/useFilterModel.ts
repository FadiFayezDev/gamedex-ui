"use client"

import * as React from "react"

import { FilterModel } from "@/components/gamedex/filter/types"
import { listGenres } from "@/lib/services"

const defaultFilterModel: FilterModel = {
  search: "",
  sortBy: "name",
  checkboxes: {
    genres: [],
  },
  range: {
    price: { min: 0, max: 120 },
    size: { min: 0, max: 100 },
  },
  platformId: "all",
  minRating: 0,
}

export function useFilterModel() {
  const [model, setModel] = React.useState<FilterModel>(defaultFilterModel)

  React.useEffect(() => {
    let isActive = true

    async function loadGenres() {
      try {
        const genres = await listGenres()
        if (!isActive) {
          return
        }
        setModel((prev) => ({
          ...prev,
          checkboxes: {
            ...prev.checkboxes,
            genres: genres.map((genre) => genre.name),
          },
        }))
      } catch {
        if (!isActive) {
          return
        }
        setModel((prev) => ({
          ...prev,
          checkboxes: {
            ...prev.checkboxes,
            genres: [],
          },
        }))
      }
    }

    loadGenres()

    return () => {
      isActive = false
    }
  }, [])

  return model
}
