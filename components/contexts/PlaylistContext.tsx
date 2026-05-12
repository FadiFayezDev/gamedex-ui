"use client"

import {
  useCallback,
  useContext,
  createContext,
  type ReactNode,
} from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getPlaylist,
  listPlaylists,
  type PlaylistSummary,
} from "@/lib/services/playlist"

type PlaylistMembershipMap = Record<string, string[]>

type PlaylistContextType = {
  playlists: PlaylistSummary[]
  playlistIdsByGameId: PlaylistMembershipMap
  isLoading: boolean
  version: number
  refreshPlaylists: () => Promise<PlaylistSummary[]>
}

const PLAYLISTS_QUERY_KEY = ["playlists"] as const
const PLAYLIST_MEMBERSHIP_QUERY_KEY = ["playlist-memberships"] as const

const PlaylistContext = createContext<PlaylistContextType | null>(null)

const buildPlaylistMembershipMap = async (
  playlists: PlaylistSummary[],
  signal?: AbortSignal
) => {
  const results = await Promise.allSettled(
    playlists.map((playlist) => getPlaylist(playlist.id!, signal))
  )

  const membershipMap: PlaylistMembershipMap = {}

  results.forEach((result, index) => {
    if (result.status !== "fulfilled") return

    const playlistId = playlists[index]?.id
    if (!playlistId) return

    const games = result.value.games ?? []

    games.forEach((game) => {
      const gameId =
        typeof game === "object" &&
        game !== null &&
        "id" in game &&
        typeof game.id === "string"
          ? game.id
          : null

      if (!gameId) return

      membershipMap[gameId] ??= []
      membershipMap[gameId].push(playlistId)
    })
  })

  return membershipMap
}

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const playlistsQuery = useQuery({
    queryKey: PLAYLISTS_QUERY_KEY,
    queryFn: ({ signal }) => listPlaylists(signal),
  })

  const playlists = playlistsQuery.data ?? []
  const playlistIds = playlists
    .map((playlist) => playlist.id)
    .filter((playlistId): playlistId is string => Boolean(playlistId))

  const membershipsQuery = useQuery({
    queryKey: [...PLAYLIST_MEMBERSHIP_QUERY_KEY, playlistIds],
    queryFn: ({ signal }) => buildPlaylistMembershipMap(playlists, signal),
    enabled: playlists.length > 0,
  })

  const refreshPlaylists = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: PLAYLISTS_QUERY_KEY })
    await queryClient.invalidateQueries({
      queryKey: PLAYLIST_MEMBERSHIP_QUERY_KEY,
    })

    return queryClient.fetchQuery({
      queryKey: PLAYLISTS_QUERY_KEY,
      queryFn: ({ signal }) => listPlaylists(signal),
    })
  }, [queryClient])

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        playlistIdsByGameId: membershipsQuery.data ?? {},
        isLoading: playlistsQuery.isLoading || membershipsQuery.isLoading,
        version: Math.max(
          playlistsQuery.dataUpdatedAt,
          membershipsQuery.dataUpdatedAt
        ),
        refreshPlaylists,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  )
}

export function usePlaylistContext() {
  const context = useContext(PlaylistContext)

  if (!context) {
    throw new Error("usePlaylistContext must be used within PlaylistProvider")
  }

  return context
}
