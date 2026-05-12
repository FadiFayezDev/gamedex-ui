"use client"

import { FilterProvider } from "@/components/contexts/FilterContext"
import { PlaylistProvider } from "@/components/contexts/PlaylistContext"
import { AppQueryProvider } from "@/components/contexts/QueryProvider"
import { LibraryErrorState } from "@/components/gamedex/LibraryErrorState"
import { LibraryPage } from "@/components/gamedex/LibraryPage"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"
import { logError } from "@/lib/monitoring/log-error"

export default function Page() {
  return (
    <AppQueryProvider>
      <FilterProvider>
        <PlaylistProvider>
          <ErrorBoundary
            onError={(error, errorInfo) => {
              logError(error, "LibraryPage", {
                componentStack: errorInfo.componentStack,
              })
            }}
            fallback={({ error, reset }) => (
              <LibraryErrorState error={error} onRetry={reset} />
            )}
          >
            <LibraryPage />
          </ErrorBoundary>
        </PlaylistProvider>
      </FilterProvider>
    </AppQueryProvider>
  )
}
