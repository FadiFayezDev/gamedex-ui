import { RequirementType } from "@/components/enums/RequirementType";

export interface Requirement {
  id: string;
  type: RequirementType; // Enum reference
  os: string;
  cpu: string;
  gpu: string;
  ramBytes: number;
  storageBytes: number;
  additionalNotes: string | null;
}