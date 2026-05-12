"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  Calendar,
  ChevronRight,
  Clock,
  Cpu,
  Disc,
  DollarSign,
  Gamepad2,
  HardDrive,
  Layers,
  Map,
  Music,
  Package,
  Shield,
  Trash2,
  Users,
} from "lucide-react"
import { AgeRating } from "@/components/enums/AgeRating"
import { AddFormToggle } from "../components/AddFormToggle"
import { InlineField } from "../components/InlineField"
import { RatingBar } from "../components/RatingBar"
import { Section } from "../components/Section"
import {
  AGE_RATING_OPTIONS,
  ALBUM_FIELDS,
  CHARACTER_FIELDS,
  CONTROL_FIELDS,
  DLC_FIELDS,
  PERF_PROFILE_FIELDS,
  REQUIREMENT_FIELDS,
  SONG_FIELDS,
  formatDate,
  formatDuration,
  getAgeRatingLabel,
  MISSION_FIELDS,
  type AlbumFormValues,
  type CharacterFormValues,
  type ControlFormValues,
  type DlcFormValues,
  type MissionFormValues,
  type PerfProfileFormValues,
  type RequirementFormValues,
  type SongFormValues,
  type GameSectionProps,
} from "../gameDetail.shared"
import { useGameDetails } from "../hooks/useGameDetails"

export function GameInfoSection(props: GameSectionProps) {
  const { game } = props
  const {
    handleAddAlbum,
    handleAddCharacter,
    handleAddControlMapping,
    handleAddDlc,
    handleAddMission,
    handleAddPerfProfile,
    handleAddRequirement,
    handleAddSong,
    handleAgeRatingSave,
    handleCurrencySave,
    handleDeleteAlbum,
    handleDeleteCharacter,
    handleDeleteControlMapping,
    handleDeleteDlc,
    handleDeleteMission,
    handleDeletePerfProfile,
    handleDeleteRequirement,
    handleDeleteSong,
    handleDescriptionSave,
    handleInstallSizeSave,
    handlePriceSave,
    handleRatingSave,
    handleReleaseDateSave,
    handleTitleSave,
    openAlbumId,
    openMissionId,
    setOpenAlbumId,
    setOpenMissionId,
  } = useGameDetails(props)

  return (
    <div id="sec-info" className="space-y-8">
      <Section icon={Layers} title="Overview">
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] tracking-widest text-zinc-600 uppercase">
              Title
            </span>
            <InlineField
              value={game.title}
              onSave={handleTitleSave}
              placeholder="Untitled"
              valueClassName="text-base font-semibold text-zinc-100"
              inputClassName="text-base font-semibold text-zinc-100"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[9px] tracking-widest text-zinc-600 uppercase">
              Description
            </span>
            <InlineField
              value={game.description}
              multiline
              placeholder="No description yet..."
              onSave={handleDescriptionSave}
            />
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-1">
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-3 w-3 shrink-0 text-zinc-700" />
              <div className="min-w-0">
                <div className="text-[9px] tracking-widest text-zinc-600 uppercase">
                  Release Date
                </div>
                <InlineField
                  value={game.releaseDate ?? ""}
                  displayValue={formatDate(game.releaseDate)}
                  inputType="date"
                  onSave={handleReleaseDateSave}
                  placeholder="-"
                  valueClassName="mt-0.5 font-mono text-xs text-zinc-300"
                  inputClassName="font-mono text-xs"
                  validate={(value) =>
                    value && Number.isNaN(Date.parse(value))
                      ? "Invalid date"
                      : null
                  }
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Shield className="mt-0.5 h-3 w-3 shrink-0 text-zinc-700" />
              <div className="min-w-0">
                <div className="text-[9px] tracking-widest text-zinc-600 uppercase">
                  Age Rating
                </div>
                <InlineField
                  value={String(game.ageRating ?? "")}
                  displayValue={getAgeRatingLabel(game.ageRating)}
                  options={AGE_RATING_OPTIONS}
                  onSave={handleAgeRatingSave}
                  placeholder="-"
                  valueClassName="mt-0.5 font-mono text-xs text-zinc-300"
                  inputClassName="font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <HardDrive className="mt-0.5 h-3 w-3 shrink-0 text-zinc-700" />
              <div className="min-w-0">
                <div className="text-[9px] tracking-widest text-zinc-600 uppercase">
                  Install Size
                </div>
                <InlineField
                  value={
                    game.installSizeGb != null ? String(game.installSizeGb) : ""
                  }
                  displayValue={
                    game.installSizeGb != null ? String(game.installSizeGb) : "-"
                  }
                  inputType="number"
                  min={0}
                  step="0.01"
                  onSave={handleInstallSizeSave}
                  placeholder="-"
                  valueClassName="mt-0.5 font-mono text-xs text-zinc-300"
                  inputClassName="font-mono text-xs"
                  validate={(value) =>
                    value &&
                    (Number.isNaN(Number.parseFloat(value)) ||
                      Number.parseFloat(value) < 0)
                      ? "Enter GB >= 0"
                      : null
                  }
                />
                <div className="mt-0.5 text-[9px] text-zinc-600">GB</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <DollarSign className="mt-0.5 h-3 w-3 shrink-0 text-zinc-700" />
              <div className="min-w-0 space-y-1">
                <div className="text-[9px] tracking-widest text-zinc-600 uppercase">
                  Price
                </div>
                <InlineField
                  value={game.priceAmount != null ? String(game.priceAmount) : ""}
                  displayValue={
                    game.priceAmount != null
                      ? game.priceAmount === 0
                        ? "Free"
                        : `${game.priceCurrency ?? "$"}${game.priceAmount.toFixed(2)}`
                      : "-"
                  }
                  inputType="number"
                  min={0}
                  step="0.01"
                  onSave={handlePriceSave}
                  placeholder="-"
                  valueClassName="mt-0.5 font-mono text-xs text-zinc-300"
                  inputClassName="font-mono text-xs"
                  validate={(value) =>
                    value &&
                    (Number.isNaN(Number.parseFloat(value)) ||
                      Number.parseFloat(value) < 0)
                      ? "Enter price >= 0"
                      : null
                  }
                />
                <InlineField
                  value={game.priceCurrency ?? ""}
                  displayValue={
                    game.priceCurrency
                      ? `Currency: ${game.priceCurrency}`
                      : "Currency: -"
                  }
                  onSave={handleCurrencySave}
                  placeholder="Currency"
                  valueClassName="text-[10px] text-zinc-500"
                  inputClassName="text-[10px]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <RatingBar
              label="Critic"
              value={game.criticRating}
              onSave={handleRatingSave("criticRating")}
            />
            <RatingBar
              label="User"
              value={game.userRating}
              onSave={handleRatingSave("userRating")}
            />
          </div>
        </div>
      </Section>

      <div className="h-px bg-zinc-800/60" />

      <Section
        icon={Map}
        title="Missions"
        action={
          <AddFormToggle<MissionFormValues>
            fields={MISSION_FIELDS}
            onSave={handleAddMission}
          />
        }
      >
        {game.missions.length === 0 ? (
          <p className="text-xs text-zinc-600 italic">No missions</p>
        ) : (
          <div className="space-y-0.5">
            {game.missions.map((mission) => {
              const isOpen = openMissionId === mission.id

              return (
                <div
                  key={mission.id}
                  className="group flex flex-col rounded-lg px-2 py-2 transition-colors hover:bg-zinc-800/40"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setOpenMissionId(isOpen ? null : mission.id)
                      }
                    >
                      <motion.div
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="h-3 w-3 shrink-0 text-zinc-500" />
                      </motion.div>
                    </button>

                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => setOpenMissionId(isOpen ? null : mission.id)}
                    >
                      <div className="truncate text-xs font-medium text-zinc-200">
                        {mission.title}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteMission(mission.id)}
                      className="text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-1 ml-6 border-l border-zinc-800 pr-4 pb-2 pl-2 text-[11px] leading-relaxed text-zinc-400">
                          {mission.description || (
                            <span className="text-zinc-600 italic">
                              No description
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      <div className="h-px bg-zinc-800/60" />

      <Section
        icon={Users}
        title="Characters"
        action={
          <AddFormToggle<CharacterFormValues>
            fields={CHARACTER_FIELDS}
            onSave={handleAddCharacter}
          />
        }
      >
        {game.characterProfiles.length === 0 ? (
          <p className="text-xs text-zinc-600 italic">No characters</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {game.characterProfiles.map((character) => (
              <div
                key={character.id}
                className="group relative flex flex-col gap-1.5 rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-3 transition-all hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-[11px] font-semibold text-zinc-400">
                    {character.name.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={() => handleDeleteCharacter(character.id)}
                    className="text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <div className="text-xs font-medium text-zinc-200">
                  {character.name}
                </div>
                <div className="text-[9px] tracking-widest text-zinc-600 uppercase">
                  {character.role}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="h-px bg-zinc-800/60" />

      <Section
        icon={Package}
        title="DLCs"
        action={
          <AddFormToggle<DlcFormValues>
            fields={DLC_FIELDS}
            onSave={handleAddDlc}
          />
        }
      >
        {game.dlcs.length === 0 ? (
          <p className="text-xs text-zinc-600 italic">No DLCs</p>
        ) : (
          <div className="space-y-1.5">
            {game.dlcs.map((dlc) => (
              <div
                key={dlc.id}
                className="group flex items-center justify-between gap-3 rounded-lg border border-zinc-800/40 bg-zinc-900/40 px-2.5 py-2 transition-all hover:border-zinc-700/60"
              >
                <div>
                  <div className="text-xs text-zinc-200">{dlc.title}</div>
                  <div className="mt-0.5 font-mono text-[9px] text-zinc-600">
                    {formatDate(dlc.releaseDate)}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteDlc(dlc.id)}
                  className="text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="h-px bg-zinc-800/60" />

      <Section
        icon={Music}
        title="Music Albums"
        action={
          <AddFormToggle<AlbumFormValues>
            fields={ALBUM_FIELDS}
            onSave={handleAddAlbum}
          />
        }
      >
        {game.albums.length === 0 ? (
          <p className="text-xs text-zinc-600 italic">No Albums</p>
        ) : (
          <div className="space-y-2">
            {game.albums.map((album) => {
              const isOpen = openAlbumId === album.id

              return (
                <div
                  key={album.id}
                  className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/20 transition-all hover:border-zinc-700/60"
                >
                  <div
                    className="group flex cursor-pointer items-center justify-between p-3"
                    onClick={() => setOpenAlbumId(isOpen ? null : album.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/40 text-zinc-500 transition-colors group-hover:bg-zinc-800 group-hover:text-zinc-300">
                        <Disc className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-200">
                          {album.title}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {formatDate(album.releaseDate)} •{" "}
                          {album.songs?.length ?? 0} tracks
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(event) => {
                          event.stopPropagation()
                          handleDeleteAlbum(album.id)
                        }}
                        className="p-1.5 text-zinc-600 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <ChevronRight
                        className={`h-4 w-4 text-zinc-600 transition-transform duration-300 ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-zinc-800/60 bg-black/20"
                      >
                        <div className="space-y-1 p-3">
                          {(!album.songs || album.songs.length === 0) && (
                            <div className="py-4 text-center text-[10px] tracking-widest text-zinc-600 uppercase">
                              No Tracks Added
                            </div>
                          )}

                          {album.songs &&
                            [...album.songs]
                              .sort((left, right) => left.trackNumber - right.trackNumber)
                              .map((song) => (
                                <div
                                  key={song.id}
                                  className="group flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-zinc-800/40"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="w-4 font-mono text-[10px] text-zinc-600">
                                      {song.trackNumber}
                                    </span>
                                    <span className="text-xs text-zinc-300">
                                      {song.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 text-[10px] text-zinc-600">
                                      <Clock className="h-2.5 w-2.5" />
                                      {formatDuration(song.durationSeconds)}
                                    </div>
                                    <button
                                      onClick={() =>
                                        handleDeleteSong(album.id, song.id)
                                      }
                                      className="text-zinc-600 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}

                          <div className="mt-3 border-t border-zinc-800/40 pt-2">
                            <AddFormToggle<SongFormValues>
                              fields={SONG_FIELDS}
                              onSave={(values: SongFormValues) =>
                                handleAddSong(album.id, values)
                              }
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      <div className="h-px bg-zinc-800/60" />

      <Section
        icon={Cpu}
        title="Performance Profiles"
        action={
          <AddFormToggle<PerfProfileFormValues>
            fields={PERF_PROFILE_FIELDS}
            onSave={handleAddPerfProfile}
          />
        }
      >
        {game.performanceProfiles.length === 0 ? (
          <p className="text-xs text-zinc-600 italic">No profiles</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {game.performanceProfiles.map((profile) => (
              <div
                key={profile.id}
                className="group relative flex flex-col items-center gap-1 rounded-xl border border-zinc-800/50 bg-zinc-900/40 px-2 py-3 text-center transition-all hover:border-zinc-700"
              >
                <div className="text-[9px] tracking-widest text-zinc-600 uppercase">
                  {profile.settingsPreset}
                </div>
                <div className="mt-1 font-mono text-xl leading-none font-bold text-zinc-200">
                  {profile.targetFps}
                  <span className="ml-0.5 text-[10px] font-normal text-zinc-600">
                    fps
                  </span>
                </div>
                <div className="mt-0.5 text-[10px] text-zinc-500">
                  {profile.resolution}
                </div>
                <button
                  onClick={() => handleDeletePerfProfile(profile.id)}
                  className="absolute top-1.5 right-1.5 text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="h-px bg-zinc-800/60" />

      <Section
        icon={HardDrive}
        title="System Requirements"
        action={
          <AddFormToggle<RequirementFormValues>
            fields={REQUIREMENT_FIELDS}
            onSave={handleAddRequirement}
          />
        }
      >
        {game.requirements.length === 0 ? (
          <p className="text-xs text-zinc-600 italic">No requirements</p>
        ) : (
          <div className="space-y-1.5">
            <div className="grid grid-cols-[72px_1fr_1fr_20px] gap-2 border-b border-zinc-800/60 px-1 pb-1">
              {["Type", "CPU", "GPU", ""].map((heading) => (
                <span
                  key={heading}
                  className="text-[9px] tracking-widest text-zinc-600 uppercase"
                >
                  {heading}
                </span>
              ))}
            </div>
            {game.requirements.map((requirement) => (
              <div
                key={requirement.id}
                className="group grid grid-cols-[72px_1fr_1fr_20px] items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-zinc-800/30"
              >
                <span className="font-mono text-[10px] text-zinc-500 uppercase">
                  {requirement.type}
                </span>
                <span className="truncate text-[11px] text-zinc-400">
                  {requirement.cpu || "-"}
                </span>
                <span className="truncate text-[11px] text-zinc-300">
                  {requirement.gpu || "-"}
                </span>
                <button
                  onClick={() => handleDeleteRequirement(requirement.id)}
                  className="text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="h-px bg-zinc-800/60" />

      <Section
        icon={Gamepad2}
        title="Control Mappings"
        action={
          <AddFormToggle<ControlFormValues>
            fields={CONTROL_FIELDS}
            onSave={handleAddControlMapping}
          />
        }
      >
        {game.controlMappings.length === 0 ? (
          <p className="text-xs text-zinc-600 italic">No controls mapped</p>
        ) : (
          <div className="space-y-0.5">
            {game.controlMappings.map((mapping) => (
              <div
                key={mapping.id}
                className="group flex items-center justify-between rounded-md px-1 py-1.5 transition-colors hover:bg-zinc-800/30"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {mapping.device && (
                    <span className="shrink-0 text-[9px] tracking-widest text-zinc-600 uppercase">
                      {mapping.device}
                    </span>
                  )}
                  <span className="truncate text-xs text-zinc-400">
                    {mapping.action}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <kbd className="rounded-md border border-zinc-700/80 bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-300">
                    {mapping.key}
                  </kbd>
                  <button
                    onClick={() => handleDeleteControlMapping(mapping.id)}
                    className="text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/20 px-4 py-3">
        <div className="text-[10px] tracking-widest text-zinc-600 uppercase">
          Summary
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-zinc-400">
          <span>{game.missions.length} missions</span>
          <span>{game.characterProfiles.length} characters</span>
          <span>{game.dlcs.length} DLCs</span>
          <span>{game.albums.length} albums</span>
          <span>{game.performanceProfiles.length} profiles</span>
          <span>{game.requirements.length} requirement sets</span>
          <span>{game.controlMappings.length} control mappings</span>
          <span>
            {getAgeRatingLabel(game.ageRating) ||
              AgeRating[game.ageRating] ||
              "Unrated"}
          </span>
        </div>
      </div>
    </div>
  )
}
