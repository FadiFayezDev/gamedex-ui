"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Download, Film, Loader2, Pencil, Play, Trash2 } from "lucide-react"
import { AgeRating } from "@/components/enums/AgeRating"
import { AssetType } from "@/components/enums/AssetType"
import { AddFormToggle } from "../components/AddFormToggle"
import { HeaderSettingsPopover } from "../components/HeaderSettingsPopover"
import { ImageGalleryModal } from "../components/ImageGalleryModal"
import { Section } from "../components/Section"
import { TrailerModal } from "../components/TrailerModal"
import {
  getAgeRatingLabel,
  resolveMediaAssetUrl,
  type GameSectionProps,
  type MediaAssetFormValues,
} from "../gameDetail.shared"
import { useGameMedia } from "../hooks/useGameMedia"

type GameMediaSectionProps = GameSectionProps & {
  isExporting: boolean
  onExport: () => void
}

export function GameMediaSection({
  game,
  gameId,
  refresh,
  isExporting,
  onExport,
}: GameMediaSectionProps) {
  const {
    bgVideoRef,
    galleryImages,
    galleryIndex,
    galleryOpen,
    headerImageIdx,
    headerImages,
    mediaCollapsed,
    mediaFieldConfigs,
    setGalleryOpen,
    setHeaderImageIdx,
    setMediaCollapsed,
    setTrailerModalOpen,
    showBgTrailer,
    showTrailerInHeader,
    toggleTrailerInHeader,
    trailer,
    trailerModalOpen,
    handleAddMediaAsset,
    handleDeleteMediaAsset,
    handleReplaceCurrentHeaderAsset,
    handleUpdateMediaAsset,
    openAsset,
  } = useGameMedia({ game, gameId, refresh })

  return (
    <>
      <div id="sec-media" className="space-y-8">
        <div className="relative -mx-6 -mt-6 h-64 overflow-hidden border-b border-zinc-800/80">
          {showBgTrailer ? (
            <video
              ref={bgVideoRef}
              key={game.trailerUrl}
              src={game.trailerUrl ?? ""}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : headerImages.length > 0 ? (
            <AnimatePresence mode="sync">
              <motion.img
                key={`${gameId}-img-${headerImageIdx}`}
                src={headerImages[headerImageIdx] ?? ""}
                alt=""
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-zinc-900 via-zinc-950 to-black" />
          )}

          <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0b] via-[#0a0a0b]/50 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-[#0a0a0b]/30 via-transparent to-transparent" />

          <div className="absolute top-3 right-3 left-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!showBgTrailer && headerImages.length > 1 && (
                <div className="flex items-center gap-1">
                  {headerImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setHeaderImageIdx(index)}
                      className={`h-1 rounded-full transition-all ${
                        index === headerImageIdx
                          ? "w-4 bg-white/70"
                          : "w-1 bg-white/25 hover:bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              )}

              {!showBgTrailer && headerImages.length > 0 && (
                <label className="group/edit flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-black/40 text-white/50 backdrop-blur-sm transition-all hover:border-white/20 hover:text-white/80">
                  <Pencil className="h-3 w-3 transition-transform group-hover/edit:scale-110" />
                  <input
                    type="file"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        handleReplaceCurrentHeaderAsset(file)
                      }
                    }}
                  />
                </label>
              )}
            </div>

            <div className="flex items-center gap-2">
              {showBgTrailer && (
                <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 backdrop-blur-sm">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-400" />
                  </span>
                  <span className="text-[9px] font-semibold tracking-widest text-white/60 uppercase">
                    Trailer
                  </span>
                </div>
              )}

              <button
                onClick={onExport}
                disabled={isExporting}
                className="group flex h-7 items-center gap-1.5 rounded-lg border border-white/10 bg-black/40 px-2.5 text-white/50 backdrop-blur-sm transition-all hover:border-white/20 hover:text-white/80 disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Download className="h-3 w-3 transition-transform group-hover:scale-110" />
                )}
                <span className="text-[10px] font-semibold tracking-wider uppercase">
                  Export
                </span>
              </button>

              <HeaderSettingsPopover
                showTrailer={showTrailerInHeader}
                hasTrailer={!!trailer}
                onToggle={toggleTrailerInHeader}
              />
            </div>
          </div>

          <div className="absolute right-0 bottom-0 left-0 px-5 pb-4">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0 flex-1">
                {game.platforms.length > 0 && (
                  <div className="mb-1.5 flex flex-wrap items-center gap-1">
                    {game.platforms.slice(0, 3).map((platform) => (
                      <span
                        key={platform.id}
                        className="rounded-sm border border-white/10 bg-white/5 px-1.5 py-0.5 text-[8px] font-semibold tracking-widest text-zinc-400 uppercase backdrop-blur-sm"
                      >
                        {platform.name}
                      </span>
                    ))}
                  </div>
                )}

                <h2 className="truncate text-[22px] leading-tight font-bold tracking-tight text-white drop-shadow-sm">
                  {game.title || "Untitled"}
                </h2>

                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  {game.genres.slice(0, 4).map((genre, index) => (
                    <div key={genre.id} className="flex items-center gap-2">
                      {index > 0 && (
                        <span className="text-[9px] text-zinc-700">·</span>
                      )}
                      <span className="text-[10px] text-zinc-500">
                        {genre.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <div className="text-right">
                  {game.priceAmount != null && (
                    <div className="text-base leading-none font-bold text-white">
                      {game.priceAmount === 0
                        ? "Free"
                        : `${game.priceCurrency ?? "$"}${game.priceAmount.toFixed(2)}`}
                    </div>
                  )}
                  {game.ageRating !== null && game.ageRating !== undefined && (
                    <div className="mt-0.5 text-[9px] tracking-widest text-zinc-600 uppercase">
                      {getAgeRatingLabel(game.ageRating) ||
                        AgeRating[game.ageRating] ||
                        "Unrated"}
                    </div>
                  )}
                </div>

                {trailer && (
                  <button
                    onClick={() => setTrailerModalOpen(true)}
                    className="group flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/50 px-3 py-1.5 text-[10px] font-semibold tracking-wider text-white/80 uppercase backdrop-blur-sm transition-all hover:border-white/30 hover:bg-black/70 hover:text-white"
                  >
                    <Play className="h-3 w-3 fill-current transition-transform group-hover:scale-110" />
                    Watch Trailer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <Section
          icon={Film}
          title="Media Assets"
          count={game.mediaAssets.length}
          collapsible
          isCollapsed={mediaCollapsed}
          onToggle={() => setMediaCollapsed(!mediaCollapsed)}
          action={
            <AddFormToggle<MediaAssetFormValues>
              fields={mediaFieldConfigs}
              onSave={handleAddMediaAsset}
            />
          }
        >
          {game.mediaAssets.length === 0 ? (
            <p className="text-xs text-zinc-600 italic">No media assets</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {game.mediaAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="group relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900"
                  onClick={() => openAsset(asset.id, asset.type)}
                >
                  {Number(asset.type) === Number(AssetType.VideoTrailer) ? (
                    <div className="relative h-full w-full">
                      <video
                        src={game.trailerUrl ?? ""}
                        className="h-full w-full object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
                        muted
                        preload="metadata"
                      />
                    </div>
                  ) : asset.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        Number(asset.type) === Number(AssetType.CoverImage) &&
                        game.coverUrl
                          ? game.coverUrl
                          : resolveMediaAssetUrl({
                              gameId: game.id,
                              url: asset.url,
                              type: asset.type as AssetType,
                            })
                      }
                      alt={String(asset.type)}
                      className="h-full w-full object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-[10px] tracking-wider text-zinc-600 uppercase">
                      {asset.type}
                    </span>
                  )}

                  <div className="absolute inset-0 flex items-end justify-between bg-black/40 p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="truncate text-[10px] font-medium text-zinc-300 drop-shadow-md">
                      {Number(asset.type) === Number(AssetType.VideoTrailer)
                        ? "Trailer"
                        : Number(asset.type) === Number(AssetType.Screenshot)
                          ? "Screenshot"
                          : Number(asset.type) === Number(AssetType.CoverImage)
                            ? "Cover"
                            : asset.type}
                    </span>
                    <div
                      className="flex items-center gap-2"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <label className="cursor-pointer shrink-0 text-zinc-400 transition-colors hover:text-white">
                        <Pencil className="h-3 w-3" />
                        <input
                          type="file"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (file) {
                              handleUpdateMediaAsset(asset, file)
                            }
                          }}
                        />
                      </label>
                      <button
                        onClick={() =>
                          handleDeleteMediaAsset({
                            url: asset.url,
                            type: asset.type as AssetType,
                          })
                        }
                        className="shrink-0 text-red-400 transition-colors hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      <AnimatePresence>
        {trailerModalOpen && trailer && (
          <TrailerModal
            url={game.trailerUrl ?? ""}
            title={game.title ?? ""}
            onClose={() => setTrailerModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {galleryOpen && (
          <ImageGalleryModal
            images={galleryImages.map((image) => image.url)}
            initialIndex={galleryIndex}
            onClose={() => setGalleryOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
