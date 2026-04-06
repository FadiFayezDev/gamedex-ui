"use client"

import * as React from "react"

import { FilterModel } from "@/components/gamedex/filter/types"

type FilterContextValue = {
  filterModel: FilterModel | null
  setFilterModel: React.Dispatch<React.SetStateAction<FilterModel | null>>
}

export const FilterContext = React.createContext<FilterContextValue>({
  filterModel: null,
  setFilterModel: () => null,
})

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filterModel, setFilterModel] = React.useState<FilterModel | null>(null)

  return (
    <FilterContext.Provider value={{ filterModel, setFilterModel }}>
      {children}
    </FilterContext.Provider>
  )
}
