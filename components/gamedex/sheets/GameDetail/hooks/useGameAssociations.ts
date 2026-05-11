"use client"

import * as React from "react"
import { AssociationType } from "@/components/enums/AssociationType"
import type { GameDetails } from "@/components/models/gameCatalog/game"
import {
  createAssociation,
  deleteAssociation,
} from "@/lib/services/associations"
import {
  ASSOC_GENRE,
  ASSOC_MOD_MANAGER,
  ASSOC_PLATFORM,
  ASSOC_TAG,
} from "../components/Associations"
import type { GameSectionProps, PickerEntity } from "../gameDetail.shared"

export function useGameAssociations({
  game,
  gameId,
  patch,
  refresh,
}: GameSectionProps) {
  type AssociationCollectionKey =
    | "genres"
    | "platforms"
    | "modManagers"
    | "tags"
    | "companies"

  const removeAssociation = React.useCallback(
    async (associationId: string, key: AssociationCollectionKey) => {
      patch({
        [key]: (game[key] as Array<{ associationId: string }>).filter(
          (entity) => entity.associationId !== associationId
        ),
      } as Partial<GameDetails>)

      try {
        await deleteAssociation(associationId)
      } catch (error) {
        console.error("Failed to delete association:", error)
        await refresh()
      }
    },
    [game, patch, refresh]
  )

  const addAssociation = React.useCallback(
    async (entityId: string, type: AssociationType) => {
      await createAssociation({
        gameId,
        associatedEntityId: entityId,
        type,
      })
      await refresh()
    },
    [gameId, refresh]
  )

  return {
    addGenre: (entity: PickerEntity) => addAssociation(entity.id, ASSOC_GENRE),
    addPlatform: (entity: PickerEntity) =>
      addAssociation(entity.id, ASSOC_PLATFORM),
    addModManager: (entity: PickerEntity) =>
      addAssociation(entity.id, ASSOC_MOD_MANAGER),
    addTag: (entity: PickerEntity) => addAssociation(entity.id, ASSOC_TAG),
    addCompany: (company: PickerEntity, type: AssociationType) =>
      addAssociation(company.id, type),
    removeAssociation,
  }
}
