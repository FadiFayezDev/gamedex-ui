"use client"

import * as React from "react"
import { AssetType } from "@/components/enums/AssetType"
import {
  addMediaAsset,
  deleteGameCover,
  deleteScreenshot,
  deleteTrailer,
  updateGameCover,
  uploadGameScreenshot,
  uploadGameTrailer,
} from "@/lib/services/games"
import type { GameSectionProps } from "../gameDetail.shared"
import {
  MEDIA_ASSET_FIELDS,
  resolveMediaAssetUrl,
} from "../gameDetail.shared"

export function useGameMedia({
  game,
  gameId,
  refresh,
}: Omit<GameSectionProps, "patch">) {
  const [showTrailerInHeader, setShowTrailerInHeader] =
    React.useState<boolean>(() => {
      if (typeof window === "undefined") return false
      return localStorage.getItem("gamedex-header-trailer") === "true"
    })
  const [headerImageIdx, setHeaderImageIdx] = React.useState(0)
  const [trailerModalOpen, setTrailerModalOpen] = React.useState(false)
  const [galleryOpen, setGalleryOpen] = React.useState(false)
  const [galleryIndex, setGalleryIndex] = React.useState(0)
  const [mediaCollapsed, setMediaCollapsed] = React.useState(false)
  const bgVideoRef = React.useRef<HTMLVideoElement>(null)

  const trailer =
    game.mediaAssets.find(
      (asset) => Number(asset.type) === Number(AssetType.VideoTrailer)
    ) ?? null
  const cover =
    game.mediaAssets.find(
      (asset) => Number(asset.type) === Number(AssetType.CoverImage)
    ) ?? null
  const screenshots = game.mediaAssets.filter(
    (asset) => Number(asset.type) === Number(AssetType.Screenshot)
  )

  const headerImages = React.useMemo(
    () => [
      ...(cover
        ? [
            Number(cover.type) === Number(AssetType.CoverImage) && game.coverUrl
              ? game.coverUrl
              : resolveMediaAssetUrl({
                  gameId,
                  url: cover.url,
                  type: cover.type as AssetType,
                }),
          ]
        : []),
      ...screenshots.map((asset) =>
        resolveMediaAssetUrl({
          gameId,
          url: asset.url,
          type: asset.type as AssetType,
        })
      ),
    ],
    [cover, game.coverUrl, gameId, screenshots]
  )

  const galleryImages = React.useMemo(
    () =>
      game.mediaAssets
        .filter(
          (asset) => Number(asset.type) !== Number(AssetType.VideoTrailer)
        )
        .map((asset) => ({
          id: asset.id,
          url:
            Number(asset.type) === Number(AssetType.CoverImage) && game.coverUrl
              ? game.coverUrl
              : resolveMediaAssetUrl({
                  gameId: game.id,
                  url: asset.url,
                  type: asset.type as AssetType,
                }),
        })),
    [game]
  )

  const showBgTrailer = showTrailerInHeader && !!trailer

  React.useEffect(() => {
    setHeaderImageIdx(0)
  }, [game.id])

  React.useEffect(() => {
    if (!bgVideoRef.current) return

    if (galleryOpen || trailerModalOpen) {
      bgVideoRef.current.pause()
      return
    }

    bgVideoRef.current.play().catch(() => {})
  }, [galleryOpen, trailerModalOpen])

  React.useEffect(() => {
    if (showTrailerInHeader && trailer) return
    if (headerImages.length <= 1) return

    const intervalId = window.setInterval(() => {
      setHeaderImageIdx((current) => (current + 1) % headerImages.length)
    }, 4000)

    return () => window.clearInterval(intervalId)
  }, [headerImages.length, showTrailerInHeader, trailer])

  const toggleTrailerInHeader = React.useCallback(() => {
    const next = !showTrailerInHeader
    setShowTrailerInHeader(next)

    if (typeof window !== "undefined") {
      localStorage.setItem("gamedex-header-trailer", String(next))
    }
  }, [showTrailerInHeader])

  const handleAddMediaAsset = React.useCallback(
    async (values: { type: string; file?: File }) => {
      if (!values.file) return

      const type = Number.parseInt(values.type, 10)
      try {
        switch (type) {
          case AssetType.CoverImage:
            await updateGameCover(gameId, values.file)
            break
          case AssetType.Screenshot:
            await uploadGameScreenshot(gameId, values.file)
            break
          case AssetType.VideoTrailer:
            await uploadGameTrailer(gameId, values.file)
            break
          default:
            await addMediaAsset(gameId, { type, file: values.file })
        }
        await refresh()
      } catch (error) {
        console.error("Upload failed:", error)
      }
    },
    [gameId, refresh]
  )

  const handleUpdateMediaAsset = React.useCallback(
    async (asset: { type: number; url: string }, file: File) => {
      try {
        switch (asset.type) {
          case AssetType.CoverImage:
            await updateGameCover(gameId, file)
            break
          case AssetType.Screenshot:
            await deleteScreenshot(gameId, asset.url)
            await uploadGameScreenshot(gameId, file)
            break
          case AssetType.VideoTrailer:
            await uploadGameTrailer(gameId, file)
            break
          default:
            return
        }
        await refresh()
      } catch (error) {
        console.error("Update failed:", error)
      }
    },
    [gameId, refresh]
  )

  const handleDeleteMediaAsset = React.useCallback(
    async ({ url, type }: { url: string; type: AssetType }) => {
      try {
        switch (type) {
          case AssetType.CoverImage:
            await deleteGameCover(gameId)
            break
          case AssetType.Screenshot:
            await deleteScreenshot(gameId, url)
            break
          case AssetType.VideoTrailer:
            await deleteTrailer(gameId)
            break
          default:
            return
        }
        await refresh()
      } catch (error) {
        console.error("Delete failed:", error)
      }
    },
    [gameId, refresh]
  )

  const handleReplaceCurrentHeaderAsset = React.useCallback(
    async (file: File) => {
      const currentUrl = headerImages[headerImageIdx]

      const asset = game.mediaAssets.find(
        (entry) =>
          resolveMediaAssetUrl({
            gameId,
            url: entry.url,
            type: entry.type as AssetType,
          }) === currentUrl
      )

      if (asset) {
        await handleUpdateMediaAsset(asset, file)
        return
      }

      await updateGameCover(gameId, file)
      await refresh()
    },
    [game.mediaAssets, gameId, handleUpdateMediaAsset, headerImageIdx, headerImages, refresh]
  )

  const openAsset = React.useCallback(
    (assetId: string, type: number) => {
      if (Number(type) === Number(AssetType.VideoTrailer)) {
        setTrailerModalOpen(true)
        return
      }

      const nextIndex = galleryImages.findIndex((image) => image.id === assetId)
      setGalleryIndex(nextIndex >= 0 ? nextIndex : 0)
      setGalleryOpen(true)
    },
    [galleryImages]
  )

  return {
    bgVideoRef,
    cover,
    galleryImages,
    galleryIndex,
    galleryOpen,
    headerImageIdx,
    headerImages,
    mediaCollapsed,
    mediaFieldConfigs: MEDIA_ASSET_FIELDS,
    screenshots,
    showBgTrailer,
    showTrailerInHeader,
    trailer,
    trailerModalOpen,
    setGalleryOpen,
    setHeaderImageIdx,
    setMediaCollapsed,
    setTrailerModalOpen,
    toggleTrailerInHeader,
    handleAddMediaAsset,
    handleDeleteMediaAsset,
    handleReplaceCurrentHeaderAsset,
    handleUpdateMediaAsset,
    openAsset,
  }
}
