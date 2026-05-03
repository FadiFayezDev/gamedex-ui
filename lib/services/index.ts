export {
  listGames,
  getGame,
  createGame,
  deleteGame,
  updateGameDetails,
  setGameRatings,
  setGamePrice,
  setGameInstallSize,
  addRequirement,
  addControlMapping,
  addMediaAsset,
  addPerformanceProfile,
  addMission,
  addCharacterProfile,
  addDlc,
} from "@/lib/services/games"

export {
  listGenres,
  createGenre,
  getGenre,
  updateGenre,
} from "@/lib/services/genres"

export {
  listPlatforms,
  createPlatform,
  getPlatform,
  updatePlatformName,
} from "@/lib/services/platforms"

export {
  publishAlbum,
  getAlbum,
  deleteAlbum,
  addSongToAlbum,
  deleteAlbumSong,
} from "@/lib/services/albums"

export {
  createAssociation,
  deleteAssociation,
} from "@/lib/services/associations"

export {
  createCompany,
  listCompanies,
  getCompany,
  updateCompanyName,
} from "@/lib/services/companies"

export {
  createModManager,
  listModManagers,
  getModManager,
  updateModManager,
} from "@/lib/services/mod-managers"

export {
  listTags,
  createTag,
  getTag,
  updateTag,
} from "@/lib/services/tags"
