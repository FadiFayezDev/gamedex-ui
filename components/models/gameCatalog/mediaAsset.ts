import { AssetType } from "@/components/enums/AssetType";

export interface MediaAsset {
  id: string;
  type: AssetType; // Enum reference
  url: string;
}