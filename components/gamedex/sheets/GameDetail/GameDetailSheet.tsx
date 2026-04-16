"use client"
import { motion, AnimatePresence } from "framer-motion"
import * as React from "react"
import { useEffect, useState, useRef, useCallback } from "react"
import {
  Pencil,
  Check,
  X,
  Plus,
  Trash2,
  ChevronRight,
  Calendar,
  Shield,
  HardDrive,
  DollarSign,
  Gamepad2,
  Users,
  Building2,
  Package,
  Map,
  Cpu,
  Layers,
  Puzzle,
  Film,
  Loader2,
  Search,
  ArrowLeft,
  Play,
  Maximize2,
  Images,
  Video,
  Settings2,
  ChevronLeft,
  Volume2,
  VolumeX,
  AlertTriangle,
  Music,
  Disc,
  Clock,
  Download,
} from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  getGame,
  updateGameDetails,
  setGameRatings,
  setGamePrice,
  setGameInstallSize,
  addMission,
  addCharacterProfile,
  addDlc,
  addPerformanceProfile,
  addRequirement,
  addControlMapping,
  deleteMission,
  deleteCharacterProfile,
  deleteDlc,
  deletePerformanceProfile,
  deleteRequirement,
  deleteControlMapping,
  getGameTrailerUrl,
  getGameScreenshotUrl,
  updateGameCover,
  deleteGameCover,
  uploadGameScreenshot,
  listScreenshots,
  deleteScreenshot,
  uploadGameTrailer,
  getTrailerUrl,
  getGameCoverUrl,
  deleteTrailer,
  deleteGame,
  exportGame,
  addMediaAsset,
} from "@/lib/services/games"
import {
  publishAlbum,
  deleteAlbum,
  addSongToAlbum,
  deleteAlbumSong,
} from "@/lib/services/albums"
import { listGenres } from "@/lib/services/genres"
import { listPlatforms } from "@/lib/services/platforms"
import { listModManagers } from "@/lib/services/mod-managers"
import {
  createAssociation,
  deleteAssociation,
} from "@/lib/services/associations"
import { GameDetails } from "../../../models/gameCatalog/game"
import { AssociationType } from "../../../enums/AssociationType"
import { Switch } from "radix-ui"
import { AssetType } from "../../../enums/AssetType"
import { ASSOC_GENRE, ASSOC_MOD_MANAGER, ASSOC_PLATFORM } from "./components/Associations"
import { TrailerModal } from "./components/TrailerModal"
import { LoadingSkeleton } from "./components/LoadingSkeleton"
import { HeaderSettingsPopover } from "./components/HeaderSettingsPopover"
import { Section } from "./components/Section"
import { InlineField } from "./components/InlineField"
import { RatingBar } from "./components/RatingBar"
import { AddFormToggle } from "./components/AddFormToggle"
import EntityPicker from "./components/EntityPicker"
import { Chip } from "./components/Chip"
import { CompanyPicker } from "./components/CompanyPicker"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { useToast } from "@/components/contexts/ToastContext"




// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  gameId: string
  coverUrl?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: (updated: GameDetails) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatBytes = (b: number) =>
  b < 1e9 ? `${(b / 1e6).toFixed(1)} MB` : `${(b / 1e9).toFixed(2)} GB`

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    : "—"

const AGE_RATING_OPTIONS = [
  { value: "0", label: "Unrated" },
  { value: "1", label: "Everyone" },
  { value: "2", label: "Everyone 10+" },
  { value: "3", label: "Teen" },
  { value: "4", label: "Mature" },
  { value: "5", label: "Adults Only" },
  { value: "6", label: "RP" },
]

const getAgeRatingLabel = (value: number | null | undefined) =>
  AGE_RATING_OPTIONS.find((o) => o.value === String(value))?.label ?? ""
async function fetchModManagers(): Promise<PickerEntity[]> {
  const data = await listModManagers()
  if (!data || !Array.isArray(data)) return []
  return (data as any[]).map((m) => ({
    id: String(m.id ?? ""),
    name: String(m.name ?? "Unknown"),
  }))
}

// ─── Field configs ────────────────────────────────────────────────────────────
//#region Field configs
const MISSION_FIELDS: FormField[] = [
  { key: "title", placeholder: "Mission title…" },
  { key: "description", placeholder: "Description (optional)…" },
]

const ALBUM_FIELDS: FormField[] = [
  { key: "title", placeholder: "Album title…" },
  { key: "releaseDate", placeholder: "Release date…", type: "date" },
]

const SONG_FIELDS: FormField[] = [
  { key: "title", placeholder: "Song title…" },
  { key: "trackNumber", placeholder: "Track #", type: "number" },
  { key: "durationSeconds", placeholder: "Duration (sec)", type: "number" },
]

const CHARACTER_FIELDS: FormField[] = [
  { key: "name", placeholder: "Character name…" },
  { key: "role", placeholder: "Role (e.g. Protagonist)…" },
]

const DLC_FIELDS: FormField[] = [
  { key: "title", placeholder: "DLC title…" },
  { key: "releaseDate", placeholder: "Release date", type: "date" },
]

const PERF_PROFILE_FIELDS: FormField[] = [
  { key: "resolution", placeholder: "Resolution (e.g. 1080p)…" },
  { key: "targetFps", placeholder: "Target FPS (e.g. 60)", type: "number" },
  { key: "settingsPreset", placeholder: "Settings preset (e.g. High)…" },
]

const REQUIREMENT_FIELDS: FormField[] = [
  {
    key: "type",
    placeholder: "Type",
    options: [
      { value: "1", label: "Minimum" },
      { value: "2", label: "Recommended" },
      { value: "3", label: "Ultra" },
    ],
  },
  { key: "os", placeholder: "OS (e.g. Windows 10)…" },
  { key: "cpu", placeholder: "CPU (e.g. Intel i5-8600K)…" },
  { key: "gpu", placeholder: "GPU (e.g. NVIDIA GTX 1070)…" },
  { key: "ramGb", placeholder: "RAM in GB (e.g. 8)", type: "number" },
  {
    key: "storageBytes",
    placeholder: "Storage in Bytes (e.g. 8589934592)",
    type: "number",
  },
  { key: "additionalNotes", placeholder: "Additional notes…" },
]

const CONTROL_FIELDS: FormField[] = [
  {
    key: "device",
    placeholder: "Device (e.g. Keyboard)…",
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
    placeholder: "Action (e.g. Jump)…",
    options: [
      // --- Movement ---
      { value: "Move Forward", label: "Move Forward" },
      { value: "Move Backward", label: "Move Backward" },
      { value: "Move Left", label: "Move Left" },
      { value: "Move Right", label: "Move Right" },
      { value: "Jump", label: "Jump" },
      { value: "Sprint / Run", label: "Sprint / Run" },
      { value: "Crouch", label: "Crouch" },
      { value: "Prone", label: "Prone" },
      { value: "Dodge / Roll", label: "Dodge / Roll" },

      // --- Combat ---
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

      // --- Interaction ---
      { value: "Interact / Use", label: "Interact / Use" },
      { value: "Pick Up Item", label: "Pick Up Item" },
      { value: "Open Inventory", label: "Open Inventory" },
      { value: "Open Map", label: "Open Map" },
      { value: "Quest Log", label: "Quest Log" },
      { value: "Skip Dialogue", label: "Skip Dialogue" },

      // --- Vehicles ---
      { value: "Accelerate / Gas", label: "Accelerate / Gas" },
      { value: "Brake / Reverse", label: "Brake / Reverse" },
      { value: "Handbrake / Drift", label: "Handbrake / Drift" },
      { value: "Horn", label: "Horn" },
      { value: "Change Camera", label: "Change Camera View" },

      // --- Flight ---
      { value: "Pitch Up", label: "Pitch Up" },
      { value: "Pitch Down", label: "Pitch Down" },
      { value: "Yaw Left", label: "Yaw Left" },
      { value: "Yaw Right", label: "Yaw Right" },
      { value: "Toggle Landing Gear", label: "Toggle Landing Gear" },

      // --- Stealth ---
      { value: "Stealth Takedown", label: "Stealth Takedown" },
      { value: "Distract", label: "Distract (Whistle/Throw)" },
      { value: "Special Vision", label: "Special Vision (Eagle/Detective)" },

      // --- System ---
      { value: "Pause Menu", label: "Pause Menu" },
      { value: "Quick Save", label: "Quick Save" },
      { value: "Quick Load", label: "Quick Load" },
      { value: "Take Screenshot", label: "Take Screenshot" },
    ],
  },
  {
    key: "key",
    placeholder: "Key / Button (e.g. Space)…",
    options: [
      // Mouse
      { value: "Mouse: Left Click", label: "Mouse: Left Click" },
      { value: "Mouse: Right Click", label: "Mouse: Right Click" },
      { value: "Mouse: Middle Click", label: "Mouse: Middle Click" },
      { value: "Mouse: Side Button 1", label: "Mouse: Side Button 1" },
      { value: "Mouse: Side Button 2", label: "Mouse: Side Button 2" },

      // Keyboard
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

      // Gamepad
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
]

const MEDIA_ASSET_FIELDS: FormField[] = [
  {
    key: "type",
    placeholder: "Type",
    options: [
      { value: "1", label: "Cover" },
      { value: "2", label: "Screenshot" },
      { value: "3", label: "Trailer" },
    ],
  },
  { key: "file", placeholder: "Select File…", type: "file" },
]
//#endregion
const handleMediaAssetsPath = ({
  gameId,
  url,
  type,
}: {
  gameId: string
  url: string
  type: AssetType
}) => {
  switch (type) {
    case 1:
      return (url)
    case 2:
      return getGameScreenshotUrl(gameId, url)
    case 3:
      return url
    default:
      return url
  }
}
// ─── Main Sheet ───────────────────────────────────────────────────────────────
export function GameDetailSheet({
  gameId,
  coverUrl,
  open,
  onOpenChange,
  onUpdate,
}: Props) {
  const [game, setGame] = useState<GameDetails | null>(null)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [missionsRowIsOpen, setMissionsRowIsOpen] = useState<string | null>(
    null
  )
  const [albumsRowIsOpen, setAlbumsRowIsOpen] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // ── Header state ──────────────────────────────────────────────────────────
  const [showTrailerInHeader, setShowTrailerInHeader] = useState<boolean>(
    () => {
      if (typeof window !== "undefined") {
        return localStorage.getItem("gamedex-header-trailer") === "true"
      }
      return false
    }
  )
  const [headerImageIdx, setHeaderImageIdx] = useState(0)
  const [trailerModalOpen, setTrailerModalOpen] = useState(false)
  const bgVideoRef = useRef<HTMLVideoElement>(null)

  const [confirmDeleteGameOpen, setConfirmDeleteGameOpen] = useState(false)
  const [isDeletingGame, setIsDeletingGame] = useState(false)

  // ── DELETE GAME ─────────────────────────────────────────────────────────────
  const handleDeleteGameConfirm = async () => {
    if (!game) return
    setIsDeletingGame(true)
    try {
      await deleteGame(game.id)
      setConfirmDeleteGameOpen(false)
      onOpenChange(false)
      window.location.reload()
    } catch (err) {
      console.error("Failed to delete game:", err)
      setIsDeletingGame(false)
    }
  }

  // ── EXPORT GAME ─────────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (!game) return
    setIsExporting(true)
    try {
      await exportGame(game.id, game.title)
      toast("Export started", "success", `"${game.title}" is being exported. Check your system dialog.`)
    } catch (err) {
      console.error("Failed to export game:", err)
      toast("Export failed", "error", "Something went wrong during export.")
    } finally {
      setIsExporting(false)
    }
  }

  // ── Data loading ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    if (game?.id === gameId) return

    let cancelled = false
    setLoading(true)
    setError(null)

    getGame(gameId)
      .then((data) => {
        if (!cancelled) {
          setGame(data)
          setHeaderImageIdx(0)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Failed to load game details")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, gameId])

  // ── Derived media ─────────────────────────────────────────────────────────
  // type 3 = Trailer (URL returned directly from handleMediaAssetsPath)
  // type 2 = Screenshot
  // type 1 = Cover
  const trailer = game?.mediaAssets.find((a) => a.type === 3) ?? null
  const cover = game?.mediaAssets.find((a) => a.type === 1) ?? null
  const screenshots = game?.mediaAssets.filter((a) => a.type === 2) ?? []

  // All background images: cover first, then screenshots (game media only)
  const headerImages: string[] = [
    ...(cover
      ? [
        cover.type === AssetType.CoverImage && game?.coverUrl ? game?.coverUrl : handleMediaAssetsPath({
          gameId,
          url: cover.url,
          type: cover.type as AssetType,
        }),
      ]
      : []),
    ...screenshots.map((s) =>
      handleMediaAssetsPath({
        gameId,
        url: s.url,
        type: s.type as AssetType,
      })
    ),
  ]

  // Image cycling — only when NOT showing trailer in header
  useEffect(() => {
    if (showTrailerInHeader && trailer) return
    if (headerImages.length <= 1) return

    const id = setInterval(() => {
      setHeaderImageIdx((i) => (i + 1) % headerImages.length)
    }, 4000)
    return () => clearInterval(id)
  }, [showTrailerInHeader, trailer, headerImages.length, gameId])

  // ── State helpers ─────────────────────────────────────────────────────────
  const patch = (partial: Partial<GameDetails>) => {
    if (!game) return
    const updated = { ...game, ...partial }
    setGame(updated)
    onUpdate?.(updated)
  }

  const refresh = useCallback(async () => {
    try {
      const data = await getGame(gameId)
      if (data) {
        setGame(data)
        onUpdate?.(data)
      }
    } catch (err) {
      console.error("Refresh failed:", err)
    }
  }, [gameId])

  const optimisticDelete = async <K extends keyof GameDetails>(
    key: K,
    itemId: string,
    apiFn: () => Promise<void>
  ) => {
    if (!game) return
    const original = game[key] as any[]
    patch({ [key]: original.filter((x: any) => x.id !== itemId) } as any)
    try {
      await apiFn()
    } catch (err) {
      console.error(`Delete ${key} failed:`, err)
      await refresh()
    }
  }

  // ── Header toggle ─────────────────────────────────────────────────────────
  const toggleTrailerInHeader = () => {
    const next = !showTrailerInHeader
    setShowTrailerInHeader(next)
    if (typeof window !== "undefined") {
      localStorage.setItem("gamedex-header-trailer", String(next))
    }
  }

  // ── Association handlers ──────────────────────────────────────────────────
  const removeAssociation = async (
    associationId: string,
    key: keyof GameDetails
  ) => {
    patch({
      [key]: (game![key] as any[]).filter(
        (x: any) => x.associationId !== associationId
      ),
    })
    try {
      await deleteAssociation(associationId)
    } catch {
      await refresh()
    }
  }

  const addGenre = async (entity: PickerEntity) => {
    await createAssociation({
      gameId,
      associatedEntityId: entity.id,
      type: ASSOC_GENRE,
    })
    await refresh()
  }

  const addPlatform = async (entity: PickerEntity) => {
    await createAssociation({
      gameId,
      associatedEntityId: entity.id,
      type: ASSOC_PLATFORM,
    })
    await refresh()
  }

  const addModManager = async (entity: PickerEntity) => {
    await createAssociation({
      gameId,
      associatedEntityId: entity.id,
      type: ASSOC_MOD_MANAGER,
    })
    await refresh()
  }

  const addCompany = async (company: PickerEntity, type: AssociationType) => {
    await createAssociation({ gameId, associatedEntityId: company.id, type })
    await refresh()
  }

  // ── Game detail mutations ─────────────────────────────────────────────────
  const handleDescriptionSave = (description: string) => {
    patch({ description })
    updateGameDetails(gameId, { description }).catch(console.error)
  }
  const handleTitleSave = (title: string) => {
    if (!title.trim()) return
    patch({ title })
    updateGameDetails(gameId, { title }).catch(console.error)
  }

  const handleReleaseDateSave = (releaseDate: string) => {
    const next = releaseDate?.trim() ? releaseDate : null
    patch({ releaseDate: next })
    updateGameDetails(gameId, { releaseDate: next ?? undefined }).catch(
      console.error
    )
  }

  const handleAgeRatingSave = (v: string) => {
    const next = parseInt(v)
    if (Number.isNaN(next)) return
    patch({ ageRating: next as any })
    updateGameDetails(gameId, { ageRating: next }).catch(console.error)
  }

  const handleInstallSizeSave = (gbString: string) => {
    if (!gbString.trim()) {
      patch({ installSizeBytes: null })
      setGameInstallSize(gameId, { installSizeBytes: null }).catch(
        console.error
      )
      return
    }
    const n = parseFloat(gbString)
    if (Number.isNaN(n) || n < 0) return
    const bytes = Math.round(n * 1073741824)
    patch({ installSizeBytes: bytes })
    setGameInstallSize(gameId, { installSizeBytes: bytes }).catch(console.error)
  }

  const handlePriceSave = (amount: string) => {
    const currency = game?.priceCurrency?.trim() || "USD"
    if (!amount.trim()) {
      patch({ priceAmount: null, priceCurrency: currency })
      setGamePrice(gameId, { amount: null, currency }).catch(console.error)
      return
    }
    const n = parseFloat(amount)
    if (Number.isNaN(n) || n < 0) return
    patch({ priceAmount: n, priceCurrency: currency })
    setGamePrice(gameId, { amount: n, currency }).catch(console.error)
  }

  const handleCurrencySave = (currency: string) => {
    const next = currency.trim() || "USD"
    patch({ priceCurrency: next })
    setGamePrice(gameId, {
      amount: game?.priceAmount,
      currency: next,
    }).catch(console.error)
  }

  const handleRatingSave =
    (field: "criticRating" | "userRating") => (value: number | null) => {
      if (!game) return
      patch({ [field]: value })
      setGameRatings(gameId, {
        criticRating: field === "criticRating" ? value : game.criticRating,
        userRating: field === "userRating" ? value : game.userRating,
      }).catch(console.error)
    }

  // ── Add handlers ──────────────────────────────────────────────────────────
  const handleAddMission = async (v: Record<string, string>) => {
    if (game?.missions.some((m) => m.title.toLowerCase() === v.title.toLowerCase())) {
      return toast("Mission already exists", "error", "The mission title must be unique.")
    }
    try {
      await addMission(gameId, {
        title: v.title,
        description: v.description || undefined,
      })
      await refresh()
    } catch (err) {
      toast("Failed to add mission", "error")
      console.error(err)
    }
  }

  const handleAddCharacter = async (v: Record<string, string>) => {
    if (game?.characterProfiles.some((c) => c.name.toLowerCase() === v.name.toLowerCase())) {
      return toast("Character already exists", "error", "The character name must be unique.")
    }
    try {
      await addCharacterProfile(gameId, { name: v.name, role: v.role })
      await refresh()
    } catch (err) {
      toast("Failed to add character", "error")
      console.error(err)
    }
  }

  const handleAddDlc = async (v: Record<string, string>) => {
    if (game?.dlcs.some((d) => d.title.toLowerCase() === v.title.toLowerCase())) {
      return toast("DLC already exists", "error", "The DLC title must be unique.")
    }
    try {
      await addDlc(gameId, {
        title: v.title,
        releaseDate: v.releaseDate || undefined,
      })
      await refresh()
    } catch (err) {
      toast("Failed to add DLC", "error")
      console.error(err)
    }
  }

  const handleAddPerfProfile = async (v: Record<string, string>) => {
    if (game?.performanceProfiles.some((p) => 
      p.resolution?.toLowerCase() === v.resolution?.toLowerCase() && 
      p.settingsPreset?.toLowerCase() === v.settingsPreset?.toLowerCase()
    )) {
      return toast("Profile already exists", "error", "A profile with this resolution and preset already exists.")
    }
    try {
      await addPerformanceProfile(gameId, {
        resolution: v.resolution || undefined,
        targetFps: parseInt(v.targetFps) || undefined,
        settingsPreset: v.settingsPreset || undefined,
      })
      await refresh()
    } catch (err) {
      toast("Failed to add profile", "error")
      console.error(err)
    }
  }

  const handleAddRequirement = async (v: Record<string, string>) => {
    const type = parseInt(v.type)
    if (game?.requirements.some((r) => r.type === type)) {
      return toast("Requirement already exists", "error", "You already have a requirement of this type.")
    }
    try {
      await addRequirement(gameId, {
        type: type as any,
        os: v.os || undefined,
        cpu: v.cpu || undefined,
        gpu: v.gpu || undefined,
        ramBytes: v.ramGb
          ? Math.round(parseFloat(v.ramGb) * 1073741824)
          : undefined,
        storageBytes: v.storageBytes ? parseInt(v.storageBytes) : undefined,
        additionalNotes: v.additionalNotes || undefined,
      })
      await refresh()
    } catch (err) {
      toast("Failed to add requirement", "error")
      console.error(err)
    }
  }

  const handleAddControlMapping = async (v: Record<string, string>) => {
    if (game?.controlMappings.some((m) => 
      m.action?.toLowerCase() === v.action?.toLowerCase() && 
      m.key?.toLowerCase() === v.key?.toLowerCase()
    )) {
      return toast("Mapping already exists", "error", "A mapping for this action and key already exists.")
    }
    try {
      await addControlMapping(gameId, {
        device: v.device || undefined,
        action: v.action || undefined,
        key: v.key || undefined,
      })
      await refresh()
    } catch (err) {
      toast("Failed to add control mapping", "error")
      console.error(err)
    }
  }

  const handleAddMediaAsset = async (v: any) => {
    if (!v.file) return
    const type = parseInt(v.type)
    try {
      switch (type) {
        case 1:
          await updateGameCover(gameId, v.file)
          break
        case 2:
          await uploadGameScreenshot(gameId, v.file)
          break
        case 3:
          await uploadGameTrailer(gameId, v.file)
          break
        default:
          await addMediaAsset(gameId, { type, file: v.file })
      }
      await refresh()
    } catch (err) {
      console.error("Upload failed:", err)
    }
  }

  const handleUpdateMediaAsset = async (asset: { type: number; url: string }, file: File) => {
    try {
      switch (asset.type) {
        case 1:
          await updateGameCover(gameId, file)
          break
        case 2:
          await deleteScreenshot(gameId, asset.url)
          await uploadGameScreenshot(gameId, file)
          break
        case 3:
          await uploadGameTrailer(gameId, file)
          break
      }
      await refresh()
    } catch (err) {
      console.error("Update failed:", err)
    }
  }

  // ── Delete handlers ───────────────────────────────────────────────────────
  const handleDeleteMission = (id: string) =>
    optimisticDelete("missions", id, () => deleteMission(gameId, id))

  const handleDeleteCharacter = (id: string) =>
    optimisticDelete("characterProfiles", id, () =>
      deleteCharacterProfile(gameId, id)
    )

  const handleDeleteDlc = (id: string) =>
    optimisticDelete("dlcs", id, () => deleteDlc(gameId, id))

  const handleDeletePerfProfile = (id: string) =>
    optimisticDelete("performanceProfiles", id, () =>
      deletePerformanceProfile(gameId, id)
    )

  const handleDeleteRequirement = (id: string) =>
    optimisticDelete("requirements", id, () => deleteRequirement(gameId, id))

  const handleDeleteControlMapping = (id: string) =>
    optimisticDelete("controlMappings", id, () =>
      deleteControlMapping(gameId, id)
    )

  const handleDeleteMediaAssets = async ({
    gameId,
    url,
    type,
  }: {
    gameId: string
    url: string
    type: AssetType
  }) => {
    try {
      switch (type) {
        case 1:
          await deleteGameCover(url)
          break
        case 2:
          await deleteScreenshot(gameId, url)
          break
        case 3:
          await deleteTrailer(gameId)
          break
      }
      await refresh()
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }



  const handleAddAlbum = async (v: any) => {
    if (!game) return
    if (game.albums?.some((a) => a.title?.toLowerCase() === v.title?.toLowerCase())) {
      return toast("Album already exists", "error", "The album title must be unique.")
    }
    try {
      await publishAlbum({ ...v, gameId: game.id })
      await refresh()
    } catch (err) {
      toast("Failed to add album", "error")
      console.error(err)
    }
  }

  const handleDeleteAlbum = async (id: string) => {
    try {
      await deleteAlbum(id)
      await refresh()
    } catch (err) {
      toast("Failed to delete album", "error")
      console.error(err)
    }
  }

  const handleAddSong = async (albumId: string, v: any) => {
    const album = game?.albums?.find((a) => a.id === albumId)
    const trackNumber = parseInt(v.trackNumber) || 0
    
    if (album?.songs?.some((s) => s.title?.toLowerCase() === v.title?.toLowerCase())) {
      return toast("Song title exists", "error", "A song with this title already exists in this album.")
    }
    if (album?.songs?.some((s) => s.trackNumber === trackNumber)) {
      return toast("Track number exists", "error", `Track #${trackNumber} already exists in this album.`)
    }

    try {
      await addSongToAlbum(albumId, {
        ...v,
        trackNumber,
        durationSeconds: parseInt(v.durationSeconds) || 0,
      })
      await refresh()
    } catch (err) {
      toast("Failed to add song", "error")
      console.error(err)
    }
  }

  const handleDeleteSong = async (albumId: string, songId: string) => {
    await deleteAlbumSong(albumId, songId)
    await refresh()
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // ── Nav ───────────────────────────────────────────────────────────────────
  const scrollTo = (id: string) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" })

  const navItems = [
    { id: "sec-info", label: "Info" },
    { id: "sec-media", label: "Media" },
    { id: "sec-genres", label: "Genres" },
    { id: "sec-companies", label: "Companies" },
    { id: "sec-missions", label: "Missions" },
    { id: "sec-chars", label: "Characters" },
    { id: "sec-dlcs", label: "DLCs" },
    { id: "sec-music", label: "Music" },
    { id: "sec-perf", label: "Performance" },
    { id: "sec-req", label: "Requirements" },
    { id: "sec-controls", label: "Controls" },
  ]

  // ── Whether to render trailer in bg ───────────────────────────────────────
  const showBgTrailer = showTrailerInHeader && !!trailer
  const installSizeGb =
    game?.installSizeBytes != null
      ? (game.installSizeBytes / 1073741824).toFixed(2)
      : ""

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          onPointerDownOutside={(e) => {
            if (trailerModalOpen || confirmDeleteGameOpen) e.preventDefault()
          }}
          onInteractOutside={(e) => {
            if (trailerModalOpen || confirmDeleteGameOpen) e.preventDefault()
          }}
          className="flex w-full flex-col overflow-hidden border-l border-zinc-800 bg-[#0a0a0b] p-0 sm:max-w-570 lg:min-w-150"
        >
          {/* ── Loading ── */}
          {loading && (
            <div className="flex flex-1 flex-col">
              <LoadingSkeleton />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
              <span className="text-sm text-red-400">{error}</span>
              <button
                onClick={() => {
                  setGame(null)
                  setError(null)
                }}
                className="text-xs text-zinc-500 underline underline-offset-4 transition-colors hover:text-zinc-200"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Content ── */}
          {!loading && !error && game && (
            <>
              {/* ═══════════════════════════════════════════════════════════
                  ENHANCED HERO HEADER
              ═══════════════════════════════════════════════════════════ */}
              <div className="relative h-64 w-full shrink-0 overflow-hidden">
                {/* ── Background Layer ── */}
                {showBgTrailer ? (
                  /* Trailer background */
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
                ) : (
                  /* Cycling images */
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
                )}

                {/* ── Gradient overlays ── */}
                {/* Bottom-heavy gradient for text legibility */}
                <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0b] via-[#0a0a0b]/50 to-transparent" />
                {/* Subtle left vignette */}
                <div className="absolute inset-0 bg-linear-to-r from-[#0a0a0b]/30 via-transparent to-transparent" />

                {/* ── Top bar: controls ── */}
                <div className="absolute top-3 right-3 left-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Image dots indicator (only when showing images) */}
                    {!showBgTrailer && headerImages.length > 1 && (
                      <div className="flex items-center gap-1">
                        {headerImages.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setHeaderImageIdx(i)}
                            className={`h-1 rounded-full transition-all ${i === headerImageIdx
                                ? "w-4 bg-white/70"
                                : "w-1 bg-white/25 hover:bg-white/40"
                              }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Quick Replace Button (Current Item) */}
                    {!showBgTrailer && headerImages.length > 0 && (
                      <label className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-black/40 text-white/50 backdrop-blur-sm transition-all hover:border-white/20 hover:text-white/80 group/edit">
                        <Pencil className="h-3 w-3 transition-transform group-hover/edit:scale-110" />
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file && game) {
                              const currentUrl = headerImages[headerImageIdx]
                              const asset = game.mediaAssets.find(
                                (a) =>
                                  handleMediaAssetsPath({
                                    gameId,
                                    url: a.url,
                                    type: a.type as AssetType,
                                  }) === currentUrl
                              )
                              if (asset) {
                                handleUpdateMediaAsset(asset, file)
                              } else {
                                updateGameCover(gameId, file).then(() =>
                                  refresh()
                                )
                              }
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Trailer playing badge */}
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

                    {/* Export button */}
                    <button
                      onClick={handleExport}
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

                    {/* Settings gear */}
                    <div className="ml-auto">
                      <HeaderSettingsPopover
                        showTrailer={showTrailerInHeader}
                        hasTrailer={!!trailer}
                        onToggle={toggleTrailerInHeader}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Bottom content ── */}
                <div className="absolute right-0 bottom-0 left-0 px-5 pb-4">
                  <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {/* Platform chips */}
                      {game.platforms.length > 0 && (
                        <div className="mb-1.5 flex flex-wrap items-center gap-1">
                          {game.platforms.slice(0, 3).map((p) => (
                            <span
                              key={p.id}
                              className="rounded-sm border border-white/10 bg-white/5 px-1.5 py-0.5 text-[8px] font-semibold tracking-widest text-zinc-400 uppercase backdrop-blur-sm"
                            >
                              {p.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Title */}
                      <InlineField
                        value={game.title}
                        onSave={handleTitleSave}
                        className="max-w-full"
                        valueClassName="truncate text-[22px] leading-tight font-bold tracking-tight text-white drop-shadow-sm"
                        inputClassName="text-[20px] font-semibold text-white"
                        placeholder="Untitled"
                      />

                      {/* Genre dots */}
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        {game.genres.slice(0, 4).map((g, i) => (
                          <React.Fragment key={g.id}>
                            {i > 0 && (
                              <span className="text-[9px] text-zinc-700">
                                ·
                              </span>
                            )}
                            <span className="text-[10px] text-zinc-500">
                              {g.name}
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Right column: price + ratings + watch button */}
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {/* Price + Age Rating */}
                      <div className="text-right">
                        {game.priceAmount != null && (
                          <div className="text-base leading-none font-bold text-white">
                            {game.priceCurrency ?? "$"}
                            {game.priceAmount.toFixed(2)}
                          </div>
                        )}
                        {game.ageRating && (
                          <div className="mt-0.5 text-[9px] tracking-widest text-zinc-600 uppercase">
                            {game.ageRating}
                          </div>
                        )}
                      </div>

                      {/* Watch Trailer button — always visible if trailer exists */}
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
              {/* ═══════════════════════════════════════════════════════════ */}

              {/* Nav strip */}
              <div className="scrollbar-none flex shrink-0 items-center gap-0.5 overflow-x-auto border-b border-zinc-800/80 px-4 py-2">
                {navItems.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => scrollTo(n.id)}
                    className="rounded-md px-2.5 py-1.5 text-[10px] font-medium tracking-wider whitespace-nowrap text-zinc-500 uppercase transition-colors hover:bg-zinc-800/60 hover:text-zinc-200"
                  >
                    {n.label}
                  </button>
                ))}
              </div>

              {/* Sections */}
              <div className="scrollbar-custom flex-1 space-y-8 overflow-y-auto px-6 py-6">
                {/* ── INFO ── */}
                <div id="sec-info">
                  <Section icon={Layers} title="Overview">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[9px] tracking-widest text-zinc-600 uppercase">
                          Description
                        </span>
                        <InlineField
                          value={game.description}
                          multiline
                          placeholder="No description yet…"
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
                              placeholder="—"
                              valueClassName="mt-0.5 font-mono text-xs text-zinc-300"
                              inputClassName="font-mono text-xs"
                              validate={(v) => (v && isNaN(Date.parse(v)) ? "Invalid date" : null)}
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
                              placeholder="—"
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
                              value={installSizeGb}
                              displayValue={
                                game.installSizeBytes ? formatBytes(game.installSizeBytes) : "—"
                              }
                              inputType="number"
                              min={0}
                              step="0.01"
                              onSave={handleInstallSizeSave}
                              placeholder="—"
                              valueClassName="mt-0.5 font-mono text-xs text-zinc-300"
                              inputClassName="font-mono text-xs"
                              validate={(v) =>
                                v && (isNaN(parseFloat(v)) || parseFloat(v) < 0)
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
                                  ? `${game.priceCurrency ?? "$"}${game.priceAmount.toFixed(2)}`
                                  : "—"
                              }
                              inputType="number"
                              min={0}
                              step="0.01"
                              onSave={handlePriceSave}
                              placeholder="�"
                              valueClassName="mt-0.5 font-mono text-xs text-zinc-300"
                              inputClassName="font-mono text-xs"
                              validate={(v) =>
                                v && (isNaN(parseFloat(v)) || parseFloat(v) < 0)
                                  ? "Enter price >= 0"
                                  : null
                              }
                            />
                            <InlineField
                              value={game.priceCurrency ?? ""}
                              displayValue={
                                game.priceCurrency ? `Currency: ${game.priceCurrency}` : "Currency: �"
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
                </div>

                <div className="h-px bg-zinc-800/60" />

                {/* ── MEDIA ── */}
                <div id="sec-media">
                  <Section
                    icon={Film}
                    title="Media Assets"
                    action={
                      <AddFormToggle
                        fields={MEDIA_ASSET_FIELDS}
                        onSave={handleAddMediaAsset}
                      />
                    }
                  >
                    {game.mediaAssets.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic">
                        No media assets
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {game.mediaAssets.map((a) => (
                          <div
                            key={a.id}
                            className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900"
                          >
                            {a.type === AssetType.VideoTrailer ? (
                              /* Trailer thumbnail with play overlay */
                              <div
                                className="relative h-full w-full cursor-pointer"
                                onClick={() => setTrailerModalOpen(true)}
                              >
                                <video
                                  src={game.trailerUrl ?? ""}
                                  className="h-full w-full object-cover"
                                  muted
                                  preload="metadata"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                  <Play className="h-6 w-6 fill-white text-white" />
                                </div>
                              </div>
                            ) : a.url ? (
                              <img
                                src={a.type as AssetType === AssetType.CoverImage && game.coverUrl ? game.coverUrl : handleMediaAssetsPath({
                                  gameId: game.id,
                                  url: a.url,
                                  type: a.type as AssetType,
                                })}
                                alt={a.type.toString()}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-[10px] tracking-wider text-zinc-600 uppercase">
                                {a.type}
                              </span>
                            )}
                            <div className="absolute inset-0 flex items-end justify-between bg-black/50 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <span className="truncate text-[10px] text-zinc-300">
                                {a.type === 3
                                  ? "Trailer"
                                  : a.type === 2
                                    ? "Screenshot"
                                    : a.type === 1
                                      ? "Cover"
                                      : a.type}
                              </span>
                              <div className="flex items-center gap-2">
                                <label className="cursor-pointer shrink-0 text-zinc-400 hover:text-white transition-colors">
                                  <Pencil className="h-3 w-3" />
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) handleUpdateMediaAsset(a, file)
                                    }}
                                  />
                                </label>
                                <button
                                  onClick={() =>
                                    handleDeleteMediaAssets({
                                      gameId: game.id,
                                      url: a.url,
                                      type: a.type as AssetType,
                                    })
                                  }
                                  className="shrink-0 text-red-400 hover:text-red-300 transition-colors"
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

                <div className="h-px bg-zinc-800/60" />

                {/* ── GENRES / PLATFORMS / MOD MANAGERS ── */}
                <div id="sec-genres" className="space-y-5">
                  <Section
                    icon={Layers}
                    title={`Genres`}
                    action={
                      <EntityPicker
                        fetchFn={listGenres}
                        linkedNames={game.genres.map((g) => g.name)}
                        onSelect={addGenre}
                      />
                    }
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {game.genres.length === 0 ? (
                        <p className="text-xs text-zinc-600 italic">
                          None added
                        </p>
                      ) : (
                        game.genres.map((g) => (
                          <Chip
                            key={g.id}
                            label={g.name}
                            onRemove={() =>
                              removeAssociation(g.associationId, "genres")
                            }
                          />
                        ))
                      )}
                    </div>
                  </Section>

                  <Section
                    icon={Gamepad2}
                    title="Platforms"
                    action={
                      <EntityPicker
                        fetchFn={listPlatforms}
                        linkedNames={game.platforms.map((p) => p.name)}
                        onSelect={addPlatform}
                      />
                    }
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {game.platforms.length === 0 ? (
                        <p className="text-xs text-zinc-600 italic">
                          None added
                        </p>
                      ) : (
                        game.platforms.map((p) => (
                          <Chip
                            key={p.id}
                            label={p.name}
                            onRemove={() =>
                              removeAssociation(p.associationId, "platforms")
                            }
                          />
                        ))
                      )}
                    </div>
                  </Section>

                  <Section
                    icon={Puzzle}
                    title="Mod Managers"
                    action={
                      <EntityPicker
                        fetchFn={fetchModManagers}
                        linkedNames={game.modManagers.map((m) => m.name)}
                        onSelect={addModManager}
                      />
                    }
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {game.modManagers.length === 0 ? (
                        <p className="text-xs text-zinc-600 italic">
                          None added
                        </p>
                      ) : (
                        game.modManagers.map((m) => (
                          <Chip
                            key={m.id}
                            label={m.name}
                            onRemove={() =>
                              removeAssociation(m.associationId, "modManagers")
                            }
                          />
                        ))
                      )}
                    </div>
                  </Section>
                </div>

                <div className="h-px bg-zinc-800/60" />

                {/* ── COMPANIES ── */}
                <div id="sec-companies">
                  <Section
                    icon={Building2}
                    title="Companies"
                    action={
                      <CompanyPicker
                        linkedCompanies={game.companies.map((c) => ({
                          name: c.name,
                          type: c.type as AssociationType,
                        }))}
                        onSelect={addCompany}
                      />
                    }
                  >
                    {game.companies.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic">
                        No companies linked
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {game.companies.map((c) => (
                          <div
                            key={c.id + c.type}
                            className="group flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-zinc-800/40"
                          >
                            <div>
                              <div className="text-xs text-zinc-200">
                                {c.name}
                              </div>
                              <div className="mt-0.5 ml-2 text-[9px] tracking-widest text-zinc-600 uppercase">
                                {AssociationType[c.type as AssociationType]}
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                removeAssociation(c.associationId, "companies")
                              }
                              className="text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                </div>

                <div className="h-px bg-zinc-800/60" />

                {/* ── MISSIONS ── */}
                <div id="sec-missions">
                  <Section
                    icon={Map}
                    title="Missions"
                    action={
                      <AddFormToggle
                        fields={MISSION_FIELDS}
                        onSave={handleAddMission}
                      />
                    }
                  >
                    {game.missions.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic">
                        No missions
                      </p>
                    ) : (
                      <div className="space-y-0.5">
                        {game.missions.map((m) => {
                          const isOpen = missionsRowIsOpen === m.id
                          return (
                            <div
                              key={m.id}
                              className="group flex flex-col rounded-lg px-2 py-2 transition-colors hover:bg-zinc-800/40"
                            >
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() =>
                                    setMissionsRowIsOpen(isOpen ? null : m.id)
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
                                  onClick={() =>
                                    setMissionsRowIsOpen(isOpen ? null : m.id)
                                  }
                                >
                                  <div className="truncate text-xs font-medium text-zinc-200">
                                    {m.title}
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleDeleteMission(m.id)}
                                  className="text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-red-400"
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
                                    transition={{
                                      duration: 0.3,
                                      ease: "easeInOut",
                                    }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-1 ml-6 border-l border-zinc-800 pr-4 pb-2 pl-2 text-[11px] leading-relaxed text-zinc-400">
                                      {m.description || (
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
                </div>

                <div className="h-px bg-zinc-800/60" />

                {/* ── CHARACTERS ── */}
                <div id="sec-chars">
                  <Section
                    icon={Users}
                    title="Characters"
                    action={
                      <AddFormToggle
                        fields={CHARACTER_FIELDS}
                        onSave={handleAddCharacter}
                      />
                    }
                  >
                    {game.characterProfiles.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic">
                        No characters
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {game.characterProfiles.map((c) => (
                          <div
                            key={c.id}
                            className="group relative flex flex-col gap-1.5 rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-3 transition-all hover:border-zinc-700"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-[11px] font-semibold text-zinc-400">
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                              <button
                                onClick={() => handleDeleteCharacter(c.id)}
                                className="text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="text-xs font-medium text-zinc-200">
                              {c.name}
                            </div>
                            <div className="text-[9px] tracking-widest text-zinc-600 uppercase">
                              {c.role}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                </div>

                <div className="h-px bg-zinc-800/60" />

                {/* ── DLCs ── */}
                <div id="sec-dlcs">
                  <Section
                    icon={Package}
                    title="DLCs"
                    action={
                      <AddFormToggle
                        fields={DLC_FIELDS}
                        onSave={handleAddDlc}
                      />
                    }
                  >
                    {game.dlcs.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic">No DLCs</p>
                    ) : (
                      <div className="space-y-1.5">
                        {game.dlcs.map((d) => (
                          <div
                            key={d.id}
                            className="group flex items-center justify-between gap-3 rounded-lg border border-zinc-800/40 bg-zinc-900/40 px-2.5 py-2 transition-all hover:border-zinc-700/60"
                          >
                            <div>
                              <div className="text-xs text-zinc-200">
                                {d.title}
                              </div>
                              <div className="mt-0.5 font-mono text-[9px] text-zinc-600">
                                {formatDate(d.releaseDate)}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteDlc(d.id)}
                              className="text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                </div>

                <div className="h-px bg-zinc-800/60" />

                {/* ── Music Albums ── */}
                <div id="sec-music">
                  <Section
                    icon={Music}
                    title="Music Albums"
                    action={
                      <AddFormToggle
                        fields={ALBUM_FIELDS}
                        onSave={handleAddAlbum}
                      />
                    }
                  >
                    {!game.albums || game.albums.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic">No Albums</p>
                    ) : (
                      <div className="space-y-2">
                        {game.albums?.map((album) => {
                          const isOpen = albumsRowIsOpen === album.id
                          return (
                            <div
                              key={album.id}
                              className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/20 transition-all hover:border-zinc-700/60"
                            >
                              <div
                                className="group flex cursor-pointer items-center justify-between p-3"
                                onClick={() =>
                                  setAlbumsRowIsOpen(isOpen ? null : album.id)
                                }
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
                                    onClick={(e) => {
                                      e.stopPropagation()
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
                                      {(!album.songs ||
                                        album.songs.length === 0) && (
                                        <div className="py-4 text-center text-[10px] tracking-widest text-zinc-600 uppercase">
                                          No Tracks Added
                                        </div>
                                      )}

                                      {album.songs &&
                                        album.songs.length > 0 &&
                                        [...album.songs]
                                          .sort(
                                            (a, b) =>
                                              a.trackNumber - b.trackNumber
                                          )
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
                                                  {formatDuration(
                                                    song.durationSeconds
                                                  )}
                                                </div>
                                                <button
                                                  onClick={() =>
                                                    handleDeleteSong(
                                                      album.id,
                                                      song.id
                                                    )
                                                  }
                                                  className="text-zinc-600 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                      <div className="mt-3 border-t border-zinc-800/40 pt-2">
                                        <AddFormToggle
                                          fields={SONG_FIELDS}
                                          onSave={(v) =>
                                            handleAddSong(album.id, v)
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
                </div>

                <div className="h-px bg-zinc-800/60" />

                {/* ── PERFORMANCE ── */}
                <div id="sec-perf">
                  <Section
                    icon={Cpu}
                    title="Performance Profiles"
                    action={
                      <AddFormToggle
                        fields={PERF_PROFILE_FIELDS}
                        onSave={handleAddPerfProfile}
                      />
                    }
                  >
                    {game.performanceProfiles.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic">
                        No profiles
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {game.performanceProfiles.map((p) => (
                          <div
                            key={p.id}
                            className="group relative flex flex-col items-center gap-1 rounded-xl border border-zinc-800/50 bg-zinc-900/40 px-2 py-3 text-center transition-all hover:border-zinc-700"
                          >
                            <div className="text-[9px] tracking-widest text-zinc-600 uppercase">
                              {p.settingsPreset}
                            </div>
                            <div className="mt-1 font-mono text-xl leading-none font-bold text-zinc-200">
                              {p.targetFps}
                              <span className="ml-0.5 text-[10px] font-normal text-zinc-600">
                                fps
                              </span>
                            </div>
                            <div className="mt-0.5 text-[10px] text-zinc-500">
                              {p.resolution}
                            </div>
                            <button
                              onClick={() => handleDeletePerfProfile(p.id)}
                              className="absolute top-1.5 right-1.5 text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                </div>

                <div className="h-px bg-zinc-800/60" />

                {/* ── REQUIREMENTS ── */}
                <div id="sec-req">
                  <Section
                    icon={HardDrive}
                    title="System Requirements"
                    action={
                      <AddFormToggle
                        fields={REQUIREMENT_FIELDS}
                        onSave={handleAddRequirement}
                      />
                    }
                  >
                    {game.requirements.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic">
                        No requirements
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-[72px_1fr_1fr_20px] gap-2 border-b border-zinc-800/60 px-1 pb-1">
                          {["Type", "CPU", "GPU", ""].map((h) => (
                            <span
                              key={h}
                              className="text-[9px] tracking-widest text-zinc-600 uppercase"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                        {game.requirements.map((r) => (
                          <div
                            key={r.id}
                            className="group grid grid-cols-[72px_1fr_1fr_20px] items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-zinc-800/30"
                          >
                            <span className="font-mono text-[10px] text-zinc-500 uppercase">
                              {r.type}
                            </span>
                            <span className="truncate text-[11px] text-zinc-400">
                              {r.cpu || "—"}
                            </span>
                            <span className="truncate text-[11px] text-zinc-300">
                              {r.gpu || "—"}
                            </span>
                            <button
                              onClick={() => handleDeleteRequirement(r.id)}
                              className="text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                </div>

                <div className="h-px bg-zinc-800/60" />

                {/* ── CONTROLS ── */}
                <div id="sec-controls">
                  <Section
                    icon={Gamepad2}
                    title="Control Mappings"
                    action={
                      <AddFormToggle
                        fields={CONTROL_FIELDS}
                        onSave={handleAddControlMapping}
                      />
                    }
                  >
                    {game.controlMappings.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic">
                        No controls mapped
                      </p>
                    ) : (
                      <div className="space-y-0.5">
                        {game.controlMappings.map((c) => (
                          <div
                            key={c.id}
                            className="group flex items-center justify-between rounded-md px-1 py-1.5 transition-colors hover:bg-zinc-800/30"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              {c.device && (
                                <span className="shrink-0 text-[9px] tracking-widest text-zinc-600 uppercase">
                                  {c.device}
                                </span>
                              )}
                              <span className="truncate text-xs text-zinc-400">
                                {c.action}
                              </span>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <kbd className="rounded-md border border-zinc-700/80 bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-300">
                                {c.key}
                              </kbd>
                              <button
                                onClick={() => handleDeleteControlMapping(c.id)}
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
                </div>

                {/* ── DANGER ZONE ── */}
                <div id="sec-danger" className="mt-12 mb-8">
                  <div className="rounded-xl border border-red-900/20 bg-red-900/5 p-6 transition-all hover:bg-red-900/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="rounded-full bg-red-500/10 p-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-red-500">Danger Zone</h3>
                        <p className="text-[10px] text-red-400/60 uppercase tracking-widest mt-0.5">
                          Critical Actions
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Once you delete this game, there is no going back. Please be certain.
                        </p>
                      </div>
                      <button
                        onClick={() => setConfirmDeleteGameOpen(true)}
                        className="shrink-0 flex items-center gap-2 rounded-lg bg-red-500/10 px-5 py-2.5 text-xs font-bold text-red-500 transition-all hover:bg-red-500 hover:text-white active:scale-95"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Game
                      </button>
                    </div>
                  </div>
                </div>

                <div className="h-8" />
              </div>
            </>
          )}
          {/* ── Fullscreen Trailer Modal ── */}
          <AnimatePresence>
            {trailerModalOpen && trailer && (
              <TrailerModal
                url={game?.trailerUrl ?? ""}
                title={game?.title ?? ""}
                onClose={() => setTrailerModalOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* Delete Game Confirm Modal */}
          <ConfirmModal
            open={confirmDeleteGameOpen}
            danger
            title="Delete Game"
            message={`Are you absolutely sure you want to delete "${game?.title}"? All associated data will be permanently removed.`}
            confirmLabel="Delete Game"
            isLoading={isDeletingGame}
            onConfirm={handleDeleteGameConfirm}
            onCancel={() => setConfirmDeleteGameOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
