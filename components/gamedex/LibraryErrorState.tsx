"use client"

type Props = {
  error: Error
  onRetry: () => void
}

export function LibraryErrorState({ error, onRetry }: Props) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[#09090b] px-6 text-zinc-100">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 text-center shadow-2xl">
        <div className="text-[10px] font-semibold tracking-[0.3em] text-red-400 uppercase">
          Runtime Error
        </div>
        <h1 className="mt-3 text-xl font-semibold text-zinc-50">
          Something went wrong in your library
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          The page hit an unexpected error. You can retry without losing the
          rest of the app shell.
        </p>
        <div className="mt-4 rounded-xl border border-zinc-800 bg-black/30 px-3 py-2 text-left font-mono text-xs text-zinc-500">
          {error.message || "Unknown error"}
        </div>
        <div className="mt-5 flex justify-center">
          <button
            onClick={onRetry}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
