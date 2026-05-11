"use client"

import { Building2, Gamepad2, Layers, Puzzle } from "lucide-react"
import { AssociationType } from "@/components/enums/AssociationType"
import { listGenres } from "@/lib/services/genres"
import { listPlatforms } from "@/lib/services/platforms"
import { listTags } from "@/lib/services/tags"
import { Chip } from "../components/Chip"
import { CompanyPicker } from "../components/CompanyPicker"
import EntityPicker from "../components/EntityPicker"
import { Section } from "../components/Section"
import { fetchModManagers, type GameSectionProps } from "../gameDetail.shared"
import { useGameAssociations } from "../hooks/useGameAssociations"

export function GameAssociationsSection(props: GameSectionProps) {
  const { game } = props
  const {
    addCompany,
    addGenre,
    addModManager,
    addPlatform,
    addTag,
    removeAssociation,
  } = useGameAssociations(props)

  return (
    <div id="sec-associations" className="space-y-8">
      <div className="space-y-5">
        <Section
          icon={Layers}
          title="Genres"
          action={
            <EntityPicker
              fetchFn={listGenres}
              linkedNames={game.genres.map((genre) => genre.name)}
              onSelect={addGenre}
            />
          }
        >
          <div className="flex flex-wrap gap-1.5">
            {game.genres.length === 0 ? (
              <p className="text-xs text-zinc-600 italic">None added</p>
            ) : (
              game.genres.map((genre) => (
                <Chip
                  key={genre.id}
                  label={genre.name}
                  onRemove={() =>
                    removeAssociation(genre.associationId, "genres")
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
              linkedNames={game.platforms.map((platform) => platform.name)}
              onSelect={addPlatform}
            />
          }
        >
          <div className="flex flex-wrap gap-1.5">
            {game.platforms.length === 0 ? (
              <p className="text-xs text-zinc-600 italic">None added</p>
            ) : (
              game.platforms.map((platform) => (
                <Chip
                  key={platform.id}
                  label={platform.name}
                  onRemove={() =>
                    removeAssociation(platform.associationId, "platforms")
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
              linkedNames={game.modManagers.map((manager) => manager.name)}
              onSelect={addModManager}
            />
          }
        >
          <div className="flex flex-wrap gap-1.5">
            {game.modManagers.length === 0 ? (
              <p className="text-xs text-zinc-600 italic">None added</p>
            ) : (
              game.modManagers.map((manager) => (
                <Chip
                  key={manager.id}
                  label={manager.name}
                  onRemove={() =>
                    removeAssociation(manager.associationId, "modManagers")
                  }
                />
              ))
            )}
          </div>
        </Section>

        <Section
          icon={Layers}
          title="Tags"
          action={
            <EntityPicker
              fetchFn={listTags}
              linkedNames={game.tags.map((tag) => tag.name)}
              onSelect={addTag}
            />
          }
        >
          <div className="flex flex-wrap gap-1.5">
            {game.tags.length === 0 ? (
              <p className="text-xs text-zinc-600 italic">None added</p>
            ) : (
              game.tags.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  onRemove={() => removeAssociation(tag.associationId, "tags")}
                />
              ))
            )}
          </div>
        </Section>
      </div>

      <div className="h-px bg-zinc-800/60" />

      <div id="sec-companies">
        <Section
          icon={Building2}
          title="Companies"
          action={
            <CompanyPicker
              linkedCompanies={game.companies.map((company) => ({
                name: company.name,
                type: company.type as AssociationType,
              }))}
              onSelect={addCompany}
            />
          }
        >
          {game.companies.length === 0 ? (
            <p className="text-xs text-zinc-600 italic">No companies linked</p>
          ) : (
            <div className="space-y-1">
              {game.companies.map((company) => (
                <div
                  key={`${company.id}-${company.type}`}
                  className="group flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-zinc-800/40"
                >
                    <div>
                      <div className="text-xs text-zinc-200">{company.name}</div>
                      <div className="mt-0.5 ml-2 text-[9px] tracking-widest text-zinc-600 uppercase">
                        {AssociationType[company.type as AssociationType]}
                      </div>
                    </div>
                  <button
                    onClick={() =>
                      removeAssociation(company.associationId, "companies")
                    }
                    className="text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}
