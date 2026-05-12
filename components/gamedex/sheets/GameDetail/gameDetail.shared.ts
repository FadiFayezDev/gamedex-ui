"use client"

import type { GameDetails } from "@/components/models/gameCatalog/game"
import { AssetType } from "@/components/enums/AssetType"
import { getGameScreenshotUrl } from "@/lib/services/games"
import { listModManagers } from "@/lib/services/mod-managers"

export type PickerEntity = {
  id: string
  name: string
}

export type AddFormValue = string | File | undefined
export type AddFormValues = Record<string, AddFormValue>

export type FormFieldConfig<TKey extends string = string> = {
  key: TKey
  placeholder: string
  type?: "text" | "number" | "date" | "file"
  options?: { value: string; label: string }[]
}

export type MissionFormValues = {
  title: string
  description: string
}

export type AlbumFormValues = {
  title: string
  releaseDate: string
}

export type SongFormValues = {
  title: string
  trackNumber: string
  durationSeconds: string
}

export type CharacterFormValues = {
  name: string
  role: string
}

export type DlcFormValues = {
  title: string
  releaseDate: string
}

export type PerfProfileFormValues = {
  resolution: string
  targetFps: string
  settingsPreset: string
}

export type RequirementFormValues = {
  type: string
  os: string
  cpu: string
  gpu: string
  ramGb: string
  storageBytes: string
  additionalNotes: string
}

export type ControlFormValues = {
  device: string
  action: string
  key: string
}

export type MediaAssetFormValues = {
  type: string
  file?: File
}

export type GameSectionProps = {
  game: GameDetails
  gameId: string
  patch: (partial: Partial<GameDetails>) => void
  refresh: () => Promise<void>
}

export const AGE_RATING_OPTIONS = [
  { value: "0", label: "Unrated" },
  { value: "1", label: "Everyone" },
  { value: "2", label: "Everyone 10+" },
  { value: "3", label: "Teen" },
  { value: "4", label: "Mature" },
  { value: "5", label: "Adults Only" },
  { value: "6", label: "RP" },
]

export const MISSION_FIELDS = [
  { key: "title", placeholder: "Mission title..." },
  { key: "description", placeholder: "Description (optional)..." },
] satisfies FormFieldConfig<keyof MissionFormValues>[]

export const ALBUM_FIELDS = [
  { key: "title", placeholder: "Album title..." },
  { key: "releaseDate", placeholder: "Release date...", type: "date" },
] satisfies FormFieldConfig<keyof AlbumFormValues>[]

export const SONG_FIELDS = [
  { key: "title", placeholder: "Song title..." },
  { key: "trackNumber", placeholder: "Track #", type: "number" },
  { key: "durationSeconds", placeholder: "Duration (sec)", type: "number" },
] satisfies FormFieldConfig<keyof SongFormValues>[]

export const CHARACTER_FIELDS = [
  { key: "name", placeholder: "Character name..." },
  { key: "role", placeholder: "Role (e.g. Protagonist)..." },
] satisfies FormFieldConfig<keyof CharacterFormValues>[]

export const DLC_FIELDS = [
  { key: "title", placeholder: "DLC title..." },
  { key: "releaseDate", placeholder: "Release date", type: "date" },
] satisfies FormFieldConfig<keyof DlcFormValues>[]

export const PERF_PROFILE_FIELDS = [
  { key: "resolution", placeholder: "Resolution (e.g. 1080p)..." },
  { key: "targetFps", placeholder: "Target FPS (e.g. 60)", type: "number" },
  { key: "settingsPreset", placeholder: "Settings preset (e.g. High)..." },
] satisfies FormFieldConfig<keyof PerfProfileFormValues>[]

export const REQUIREMENT_FIELDS = [
  {
    key: "type",
    placeholder: "Type",
    options: [
      { value: "1", label: "Minimum" },
      { value: "2", label: "Recommended" },
      { value: "3", label: "Ultra" },
    ],
  },
  { key: "os", placeholder: "OS (e.g. Windows 10)..." },
  { key: "cpu", placeholder: "CPU (e.g. Intel i5-8600K)..." },
  { key: "gpu", placeholder: "GPU (e.g. NVIDIA GTX 1070)..." },
  { key: "ramGb", placeholder: "RAM in GB (e.g. 8)", type: "number" },
  {
    key: "storageBytes",
    placeholder: "Storage in Bytes (e.g. 8589934592)",
    type: "number",
  },
  { key: "additionalNotes", placeholder: "Additional notes..." },
] satisfies FormFieldConfig<keyof RequirementFormValues>[]

export const CONTROL_FIELDS = [
  {
    key: "device",
    placeholder: "Device (e.g. Keyboard)...",
    options: [
      { value: "Keyboard", label: "Keyboard" },
      { value: "Mouse", label: "Mouse" },
      { value: "Gamepad / Controller", label: "Gamepad / Controller" },
      { value: "Joystick", label: "Joystick" },
      { value: "Steering Wheel", label: "Steering Wheel" },
      { value: "VR Controllers", label: "VR Controllers" },
      { value: "Touchscreen", label: "Touchscreen" },
      { value: "Dance Pad", label: "Dance Pad" },
      { value: "Flight Stick", label: "Flight Stick" },
    ],
  },
  {
    key: "action",
    placeholder: "Action (e.g. Jump)...",
    options: [
      { value: "Move Forward", label: "Move Forward" },
      { value: "Move Backward", label: "Move Backward" },
      { value: "Move Left", label: "Move Left" },
      { value: "Move Right", label: "Move Right" },
      { value: "Jump", label: "Jump" },
      { value: "Sprint / Run", label: "Sprint / Run" },
      { value: "Crouch", label: "Crouch" },
      { value: "Prone", label: "Prone" },
      { value: "Dodge / Roll", label: "Dodge / Roll" },
      { value: "Light Attack", label: "Light Attack" },
      { value: "Heavy Attack", label: "Heavy Attack" },
      { value: "Block / Parry", label: "Block / Parry" },
      { value: "Kick", label: "Kick" },
      {
        value: "Special Ability / Ultimate",
        label: "Special Ability / Ultimate",
      },
      { value: "Shoot / Fire", label: "Shoot / Fire" },
      { value: "Aim (ADS)", label: "Aim (ADS)" },
      { value: "Reload", label: "Reload" },
      { value: "Switch Weapon", label: "Switch Weapon" },
      { value: "Melee Bash", label: "Melee Bash" },
      { value: "Throw Grenade", label: "Throw Grenade" },
      { value: "Interact / Use", label: "Interact / Use" },
      { value: "Pick Up Item", label: "Pick Up Item" },
      { value: "Open Inventory", label: "Open Inventory" },
      { value: "Open Map", label: "Open Map" },
      { value: "Quest Log", label: "Quest Log" },
      { value: "Skip Dialogue", label: "Skip Dialogue" },
      { value: "Accelerate / Gas", label: "Accelerate / Gas" },
      { value: "Brake / Reverse", label: "Brake / Reverse" },
      { value: "Handbrake / Drift", label: "Handbrake / Drift" },
      { value: "Horn", label: "Horn" },
      { value: "Change Camera", label: "Change Camera View" },
      { value: "Pitch Up", label: "Pitch Up" },
      { value: "Pitch Down", label: "Pitch Down" },
      { value: "Yaw Left", label: "Yaw Left" },
      { value: "Yaw Right", label: "Yaw Right" },
      { value: "Toggle Landing Gear", label: "Toggle Landing Gear" },
      { value: "Stealth Takedown", label: "Stealth Takedown" },
      { value: "Distract", label: "Distract (Whistle/Throw)" },
      { value: "Special Vision", label: "Special Vision (Eagle/Detective)" },
      { value: "Pause Menu", label: "Pause Menu" },
      { value: "Quick Save", label: "Quick Save" },
      { value: "Quick Load", label: "Quick Load" },
      { value: "Take Screenshot", label: "Take Screenshot" },
    ],
  },
  {
    key: "key",
    placeholder: "Key / Button (e.g. Space)...",
    options: [
      { value: "Mouse: Left Click", label: "Mouse: Left Click" },
      { value: "Mouse: Right Click", label: "Mouse: Right Click" },
      { value: "Mouse: Middle Click", label: "Mouse: Middle Click" },
      { value: "Mouse: Side Button 1", label: "Mouse: Side Button 1" },
      { value: "Mouse: Side Button 2", label: "Mouse: Side Button 2" },
      { value: "Keyboard: Space", label: "Keyboard: Space" },
      { value: "Keyboard: Enter", label: "Keyboard: Enter" },
      { value: "Keyboard: Escape", label: "Keyboard: Escape" },
      { value: "Keyboard: Tab", label: "Keyboard: Tab" },
      { value: "Keyboard: Left Shift", label: "Keyboard: Left Shift" },
      { value: "Keyboard: Left Ctrl", label: "Keyboard: Left Ctrl" },
      { value: "Keyboard: Left Alt", label: "Keyboard: Left Alt" },
      { value: "Keyboard: W", label: "Keyboard: W" },
      { value: "Keyboard: A", label: "Keyboard: A" },
      { value: "Keyboard: S", label: "Keyboard: S" },
      { value: "Keyboard: D", label: "Keyboard: D" },
      { value: "Keyboard: E", label: "Keyboard: E" },
      { value: "Keyboard: F", label: "Keyboard: F" },
      { value: "Keyboard: R", label: "Keyboard: R" },
      { value: "Gamepad: A / Cross", label: "Gamepad: A / Cross" },
      { value: "Gamepad: B / Circle", label: "Gamepad: B / Circle" },
      { value: "Gamepad: X / Square", label: "Gamepad: X / Square" },
      { value: "Gamepad: Y / Triangle", label: "Gamepad: Y / Triangle" },
      { value: "Gamepad: LB / L1", label: "Gamepad: LB / L1" },
      { value: "Gamepad: RB / R1", label: "Gamepad: RB / R1" },
      { value: "Gamepad: LT / L2", label: "Gamepad: LT / L2" },
      { value: "Gamepad: RT / R2", label: "Gamepad: RT / R2" },
      { value: "Gamepad: D-Pad Up", label: "Gamepad: D-Pad Up" },
      { value: "Gamepad: D-Pad Down", label: "Gamepad: D-Pad Down" },
      { value: "Gamepad: D-Pad Left", label: "Gamepad: D-Pad Left" },
      { value: "Gamepad: D-Pad Right", label: "Gamepad: D-Pad Right" },
    ],
  },
] satisfies FormFieldConfig<keyof ControlFormValues>[]

export const MEDIA_ASSET_FIELDS = [
  {
    key: "type",
    placeholder: "Type",
    options: [
      { value: "1", label: "Cover" },
      { value: "2", label: "Screenshot" },
      { value: "3", label: "Trailer" },
    ],
  },
  { key: "file", placeholder: "Select File...", type: "file" },
] satisfies FormFieldConfig<keyof MediaAssetFormValues>[]

export const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-"

export const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export const getAgeRatingLabel = (value: number | null | undefined) =>
  AGE_RATING_OPTIONS.find((option) => option.value === String(value))?.label ??
  ""

export async function fetchModManagers(): Promise<PickerEntity[]> {
  const data = await listModManagers()
  if (!Array.isArray(data)) return []

  return (data as Array<{ id?: string | number; name?: string }>).map(
    (manager) => ({
      id: String(manager.id ?? ""),
      name: String(manager.name ?? "Unknown"),
    })
  )
}

export const resolveMediaAssetUrl = ({
  gameId,
  url,
  type,
}: {
  gameId: string
  url: string
  type: AssetType
}) => {
  switch (type) {
    case AssetType.CoverImage:
      return url
    case AssetType.Screenshot:
      return getGameScreenshotUrl(gameId, url)
    case AssetType.VideoTrailer:
      return url
    default:
      return url
  }
}
