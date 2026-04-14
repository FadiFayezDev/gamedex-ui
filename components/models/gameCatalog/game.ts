import { AgeRating } from "../../enums/AgeRating";
import { CharacterProfile } from "./CharacterProfile";
import { CompanyAssociation } from "./CompanyAssociation";
import { ControlMapping } from "./controlMapping";
import { Dlc } from "./dlc";
import { MediaAsset } from "./mediaAsset";
import { Mission } from "./mission";
import { PerformanceProfile } from "./performanceProfile";
import { RelatedEntity } from "./RelatedEntity";
import { Requirement } from "./requirement";

export interface GameDetails {
  id: string; // Guid
  title: string;
  description: string | null;
  releaseDate: string | null; // DateOnly as ISO string
  ageRating: AgeRating; // Enum reference
  criticRating: number | null;
  userRating: number | null;
  installSizeBytes: number | null;
  priceAmount: number | null;
  priceCurrency: string | null;
  coverUrl: string | null;
  screenshotUrls: string[];
  trailerUrl: string | null;
  requirements: Requirement[];
  controlMappings: ControlMapping[];
  mediaAssets: MediaAsset[];
  performanceProfiles: PerformanceProfile[];
  dlcs: Dlc[];
  missions: Mission[];
  characterProfiles: CharacterProfile[];
  genres: RelatedEntity[];
  platforms: RelatedEntity[];
  modManagers: RelatedEntity[];
  companies: CompanyAssociation[];
}