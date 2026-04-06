import { AssociationType } from "@/components/enums/AssociationType";

export interface CompanyAssociation {
  id: string;
  associationId: string; // Id of the association linking this company to the game
  name: string;
  type: AssociationType; // Enum reference
  roleOrMeta: string | null;
}