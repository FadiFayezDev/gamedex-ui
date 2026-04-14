import { FilterProvider } from "@/components/contexts/FilterContext"
import { LibraryPage } from "@/components/gamedex/LibraryPage"

export default function Page() {
  return (
    <FilterProvider>
      <LibraryPage />
    </FilterProvider>
  )
}
