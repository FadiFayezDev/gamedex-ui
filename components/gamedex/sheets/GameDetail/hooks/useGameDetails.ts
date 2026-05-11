"use client"

import * as React from "react"
import { useToast } from "@/components/contexts/ToastContext"
import type { GameDetails } from "@/components/models/gameCatalog/game"
import {
  addCharacterProfile,
  addControlMapping,
  addDlc,
  addMission,
  addPerformanceProfile,
  addRequirement,
  deleteCharacterProfile,
  deleteControlMapping,
  deleteDlc,
  deleteMission,
  deletePerformanceProfile,
  deleteRequirement,
  setGameInstallSize,
  setGamePrice,
  setGameRatings,
  updateGameDetails,
} from "@/lib/services/games"
import {
  addSongToAlbum,
  deleteAlbum,
  deleteAlbumSong,
  publishAlbum,
} from "@/lib/services/albums"
import type { GameSectionProps } from "../gameDetail.shared"

export function useGameDetails({
  game,
  gameId,
  patch,
  refresh,
}: GameSectionProps) {
  const { toast } = useToast()
  const [openMissionId, setOpenMissionId] = React.useState<string | null>(null)
  const [openAlbumId, setOpenAlbumId] = React.useState<string | null>(null)

  const optimisticDelete = React.useCallback(
    async <K extends keyof GameDetails>(
      key: K,
      itemId: string,
      apiFn: () => Promise<void>
    ) => {
      const original = game[key] as unknown as Array<{ id: string }>
      patch({
        [key]: original.filter((item) => item.id !== itemId),
      } as Partial<GameDetails>)

      try {
        await apiFn()
      } catch (error) {
        console.error(`Delete ${String(key)} failed:`, error)
        await refresh()
      }
    },
    [game, patch, refresh]
  )

  const handleDescriptionSave = React.useCallback(
    (description: string) => {
      patch({ description })
      updateGameDetails(gameId, { description }).catch(console.error)
    },
    [gameId, patch]
  )

  const handleTitleSave = React.useCallback(
    (title: string) => {
      if (!title.trim()) return
      patch({ title })
      updateGameDetails(gameId, { title }).catch(console.error)
    },
    [gameId, patch]
  )

  const handleReleaseDateSave = React.useCallback(
    (releaseDate: string) => {
      const next = releaseDate.trim() ? releaseDate : null
      patch({ releaseDate: next })
      updateGameDetails(gameId, { releaseDate: next ?? undefined }).catch(
        console.error
      )
    },
    [gameId, patch]
  )

  const handleAgeRatingSave = React.useCallback(
    (value: string) => {
      const next = Number.parseInt(value, 10)
      if (Number.isNaN(next)) return

      patch({ ageRating: next as GameDetails["ageRating"] })
      updateGameDetails(gameId, { ageRating: next }).catch(console.error)
    },
    [gameId, patch]
  )

  const handleInstallSizeSave = React.useCallback(
    (gbString: string) => {
      if (!gbString.trim()) {
        patch({ installSizeGb: null })
        setGameInstallSize(gameId, { installSizeGb: null }).catch(console.error)
        return
      }

      const size = Number.parseFloat(gbString)
      if (Number.isNaN(size) || size < 0) return

      patch({ installSizeGb: size })
      setGameInstallSize(gameId, { installSizeGb: size }).catch(console.error)
    },
    [gameId, patch]
  )

  const handlePriceSave = React.useCallback(
    (amount: string) => {
      const currency = game.priceCurrency?.trim() || "USD"

      if (!amount.trim()) {
        patch({ priceAmount: null, priceCurrency: currency })
        setGamePrice(gameId, { amount: null, currency }).catch(console.error)
        return
      }

      const next = Number.parseFloat(amount)
      if (Number.isNaN(next) || next < 0) return

      patch({ priceAmount: next, priceCurrency: currency })
      setGamePrice(gameId, { amount: next, currency }).catch(console.error)
    },
    [game.priceCurrency, gameId, patch]
  )

  const handleCurrencySave = React.useCallback(
    (currency: string) => {
      const next = currency.trim() || "USD"
      patch({ priceCurrency: next })
      setGamePrice(gameId, {
        amount: game.priceAmount,
        currency: next,
      }).catch(console.error)
    },
    [game.priceAmount, gameId, patch]
  )

  const handleRatingSave = React.useCallback(
    (field: "criticRating" | "userRating") => (value: number | null) => {
      patch({ [field]: value } as Partial<GameDetails>)
      setGameRatings(gameId, {
        criticRating: field === "criticRating" ? value : game.criticRating,
        userRating: field === "userRating" ? value : game.userRating,
      }).catch(console.error)
    },
    [game.criticRating, game.userRating, gameId, patch]
  )

  const handleAddMission = React.useCallback(
    async (values: Record<string, string>) => {
      if (
        game.missions.some(
          (mission) =>
            mission.title.toLowerCase() === values.title.toLowerCase()
        )
      ) {
        toast(
          "Mission already exists",
          "error",
          "The mission title must be unique."
        )
        return
      }

      try {
        await addMission(gameId, {
          title: values.title,
          description: values.description || undefined,
        })
        await refresh()
      } catch (error) {
        toast("Failed to add mission", "error")
        console.error(error)
      }
    },
    [game.missions, gameId, refresh, toast]
  )

  const handleAddCharacter = React.useCallback(
    async (values: Record<string, string>) => {
      if (
        game.characterProfiles.some(
          (character) =>
            character.name.toLowerCase() === values.name.toLowerCase()
        )
      ) {
        toast(
          "Character already exists",
          "error",
          "The character name must be unique."
        )
        return
      }

      try {
        await addCharacterProfile(gameId, {
          name: values.name,
          role: values.role,
        })
        await refresh()
      } catch (error) {
        toast("Failed to add character", "error")
        console.error(error)
      }
    },
    [game.characterProfiles, gameId, refresh, toast]
  )

  const handleAddDlc = React.useCallback(
    async (values: Record<string, string>) => {
      if (
        game.dlcs.some(
          (dlc) => dlc.title.toLowerCase() === values.title.toLowerCase()
        )
      ) {
        toast("DLC already exists", "error", "The DLC title must be unique.")
        return
      }

      try {
        await addDlc(gameId, {
          title: values.title,
          releaseDate: values.releaseDate || undefined,
        })
        await refresh()
      } catch (error) {
        toast("Failed to add DLC", "error")
        console.error(error)
      }
    },
    [game.dlcs, gameId, refresh, toast]
  )

  const handleAddPerfProfile = React.useCallback(
    async (values: Record<string, string>) => {
      if (
        game.performanceProfiles.some(
          (profile) =>
            profile.resolution?.toLowerCase() ===
              values.resolution?.toLowerCase() &&
            profile.settingsPreset?.toLowerCase() ===
              values.settingsPreset?.toLowerCase()
        )
      ) {
        toast(
          "Profile already exists",
          "error",
          "A profile with this resolution and preset already exists."
        )
        return
      }

      try {
        await addPerformanceProfile(gameId, {
          resolution: values.resolution || undefined,
          targetFps: Number.parseInt(values.targetFps, 10) || undefined,
          settingsPreset: values.settingsPreset || undefined,
        })
        await refresh()
      } catch (error) {
        toast("Failed to add profile", "error")
        console.error(error)
      }
    },
    [game.performanceProfiles, gameId, refresh, toast]
  )

  const handleAddRequirement = React.useCallback(
    async (values: Record<string, string>) => {
      const type = Number.parseInt(values.type, 10)

      if (game.requirements.some((requirement) => requirement.type === type)) {
        toast(
          "Requirement already exists",
          "error",
          "You already have a requirement of this type."
        )
        return
      }

      try {
        await addRequirement(gameId, {
          type,
          os: values.os || undefined,
          cpu: values.cpu || undefined,
          gpu: values.gpu || undefined,
          ramBytes: values.ramGb
            ? Math.round(Number.parseFloat(values.ramGb) * 1073741824)
            : undefined,
          storageBytes: values.storageBytes
            ? Number.parseInt(values.storageBytes, 10)
            : undefined,
          additionalNotes: values.additionalNotes || undefined,
        })
        await refresh()
      } catch (error) {
        toast("Failed to add requirement", "error")
        console.error(error)
      }
    },
    [game.requirements, gameId, refresh, toast]
  )

  const handleAddControlMapping = React.useCallback(
    async (values: Record<string, string>) => {
      if (
        game.controlMappings.some(
          (mapping) =>
            mapping.action?.toLowerCase() === values.action?.toLowerCase() &&
            mapping.key?.toLowerCase() === values.key?.toLowerCase()
        )
      ) {
        toast(
          "Mapping already exists",
          "error",
          "A mapping for this action and key already exists."
        )
        return
      }

      try {
        await addControlMapping(gameId, {
          device: values.device || undefined,
          action: values.action || undefined,
          key: values.key || undefined,
        })
        await refresh()
      } catch (error) {
        toast("Failed to add control mapping", "error")
        console.error(error)
      }
    },
    [game.controlMappings, gameId, refresh, toast]
  )

  const handleAddAlbum = React.useCallback(
    async (values: Record<string, string>) => {
      if (
        game.albums?.some(
          (album) => album.title?.toLowerCase() === values.title?.toLowerCase()
        )
      ) {
        toast(
          "Album already exists",
          "error",
          "The album title must be unique."
        )
        return
      }

      try {
        await publishAlbum({ ...values, gameId: game.id })
        await refresh()
      } catch (error) {
        toast("Failed to add album", "error")
        console.error(error)
      }
    },
    [game.albums, game.id, refresh, toast]
  )

  const handleDeleteAlbum = React.useCallback(
    async (albumId: string) => {
      try {
        await deleteAlbum(albumId)
        await refresh()
      } catch (error) {
        toast("Failed to delete album", "error")
        console.error(error)
      }
    },
    [refresh, toast]
  )

  const handleAddSong = React.useCallback(
    async (albumId: string, values: Record<string, string>) => {
      const album = game.albums?.find((entry) => entry.id === albumId)
      const trackNumber = Number.parseInt(values.trackNumber, 10) || 0

      if (
        album?.songs?.some(
          (song) => song.title?.toLowerCase() === values.title?.toLowerCase()
        )
      ) {
        toast(
          "Song title exists",
          "error",
          "A song with this title already exists in this album."
        )
        return
      }

      if (album?.songs?.some((song) => song.trackNumber === trackNumber)) {
        toast(
          "Track number exists",
          "error",
          `Track #${trackNumber} already exists in this album.`
        )
        return
      }

      try {
        await addSongToAlbum(albumId, {
          ...values,
          trackNumber,
          durationSeconds: Number.parseInt(values.durationSeconds, 10) || 0,
        })
        await refresh()
      } catch (error) {
        toast("Failed to add song", "error")
        console.error(error)
      }
    },
    [game.albums, refresh, toast]
  )

  const handleDeleteSong = React.useCallback(
    async (albumId: string, songId: string) => {
      try {
        await deleteAlbumSong(albumId, songId)
        await refresh()
      } catch (error) {
        toast("Failed to delete song", "error")
        console.error(error)
      }
    },
    [refresh, toast]
  )

  return {
    openMissionId,
    openAlbumId,
    setOpenMissionId,
    setOpenAlbumId,
    handleDescriptionSave,
    handleTitleSave,
    handleReleaseDateSave,
    handleAgeRatingSave,
    handleInstallSizeSave,
    handlePriceSave,
    handleCurrencySave,
    handleRatingSave,
    handleAddMission,
    handleAddCharacter,
    handleAddDlc,
    handleAddPerfProfile,
    handleAddRequirement,
    handleAddControlMapping,
    handleAddAlbum,
    handleDeleteAlbum,
    handleAddSong,
    handleDeleteSong,
    handleDeleteMission: (id: string) =>
      optimisticDelete("missions", id, () => deleteMission(gameId, id)),
    handleDeleteCharacter: (id: string) =>
      optimisticDelete("characterProfiles", id, () =>
        deleteCharacterProfile(gameId, id)
      ),
    handleDeleteDlc: (id: string) =>
      optimisticDelete("dlcs", id, () => deleteDlc(gameId, id)),
    handleDeletePerfProfile: (id: string) =>
      optimisticDelete("performanceProfiles", id, () =>
        deletePerformanceProfile(gameId, id)
      ),
    handleDeleteRequirement: (id: string) =>
      optimisticDelete("requirements", id, () => deleteRequirement(gameId, id)),
    handleDeleteControlMapping: (id: string) =>
      optimisticDelete("controlMappings", id, () =>
        deleteControlMapping(gameId, id)
      ),
  }
}
