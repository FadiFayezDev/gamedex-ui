import React, { useContext, useEffect, useRef, useState } from "react"
import { Sheet, SheetContent } from "../ui/sheet"
import {
  createModManager,
  deleteModManager,
  listModManagers,
  ModManager,
  updateModManager,
} from "@/lib/services/mod-managers"
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { cn } from "@/lib/utils"
import { FilterContext } from "../contexts/FilterContext"

type ModManagerManageSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function ModManagerSkeleton() {
  return (
    <div className="space-y-1">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-lg px-2 py-2">
          <div
            className="h-3 animate-pulse rounded bg-zinc-800"
            style={{ width: `${70 + i * 20}px`, opacity: 1 - i * 0.15 }}
          />
          <div
            className="mt-1.5 h-2.5 animate-pulse rounded bg-zinc-800/60"
            style={{ width: `${100 + i * 30}px`, opacity: 0.6 - i * 0.1 }}
          />
        </div>
      ))}
    </div>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
        <Plus className="h-4 w-4 text-zinc-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-300">No mod managers yet</p>
        <p className="mt-0.5 text-xs text-zinc-600">
          Add your first mod manager to start organizing your library.
        </p>
      </div>
      <button
        onClick={onAdd}
        className="mt-1 text-xs font-medium text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
      >
        Add a mod manager
      </button>
    </div>
  )
}

// ─── Mod Manager Row ───────────────────────────────────────────────────────────

type ModManagerRowProps = {
  modManager: ModManager
  onDelete: (id: string) => void
  onEdit: (id: string, name: string, description?: string) => Promise<void>
}

function ModManagerRow({ modManager, onDelete, onEdit }: ModManagerRowProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(modManager.name)
  const [description, setDescription] = useState(modManager.description ?? "")
  const [saving, setSaving] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) {
      setName(modManager.name)
      setDescription(modManager.description ?? "")
    }
  }, [modManager, editing])

  function startEdit() {
    setEditing(true)
    setName(modManager.name)
    setDescription(modManager.description ?? "")
    setTimeout(() => nameRef.current?.focus(), 0)
  }

  function cancelEdit() {
    setEditing(false)
    setName(modManager.name)
    setDescription(modManager.description ?? "")
  }

  async function commitEdit() {
    const trimmedName = name.trim()
    const trimmedDesc = description.trim()
    if (!trimmedName) {
      cancelEdit()
      return
    }
    const unchanged =
      trimmedName === modManager.name &&
      trimmedDesc === (modManager.description ?? "")
    if (unchanged) {
      cancelEdit()
      return
    }
    setSaving(true)
    try {
      await onEdit(modManager.id, trimmedName, trimmedDesc || undefined)
      setEditing(false)
    } catch {
      cancelEdit()
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) commitEdit()
    if (e.key === "Escape") cancelEdit()
  }

  return (
    <div className="group rounded-lg px-2 py-1.5 transition-colors hover:bg-zinc-800/40">
      {editing ? (
        <div className="flex flex-col gap-1.5">
          <Input
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={saving}
            placeholder="Name"
            className="h-6 border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100 focus-visible:ring-zinc-600"
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={saving}
            placeholder="Description (optional)"
            className="h-6 border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-400 focus-visible:ring-zinc-600"
          />
          <div className="flex items-center gap-1 self-end">
            {saving ? (
              <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />
            ) : (
              <>
                <button
                  onClick={commitEdit}
                  className="rounded p-0.5 text-zinc-400 transition-colors hover:text-emerald-400"
                  aria-label="Save"
                >
                  <Check className="h-3 w-3" />
                </button>
                <button
                  onClick={cancelEdit}
                  className="rounded p-0.5 text-zinc-400 transition-colors hover:text-zinc-200"
                  aria-label="Cancel"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs text-zinc-200">{modManager.name}</div>
            {modManager.description && (
              <div className="mt-0.5 text-[11px] leading-relaxed text-zinc-600">
                {modManager.description}
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={startEdit}
              className="rounded p-0.5 text-zinc-600 transition-colors hover:text-zinc-300"
              aria-label={`Edit ${modManager.name}`}
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={() => onDelete(modManager.id)}
              className="rounded p-0.5 text-zinc-600 transition-colors hover:text-red-400"
              aria-label={`Delete ${modManager.name}`}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Add Form ──────────────────────────────────────────────────────────────────

type AddFormProps = {
  onAdd: (name: string, description?: string) => Promise<void>
  onCancel: () => void
  existingNames: string[]
}

function AddModManagerForm({ onAdd, onCancel, existingNames }: AddFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  async function handleSubmit() {
    const trimmedName = name.trim()
    if (!trimmedName) return

    if (existingNames.some((n) => n.toLowerCase() === trimmedName.toLowerCase())) {
      setError("This mod manager already exists")
      return
    }

    setSaving(true)
    setError("")
    try {
      await onAdd(trimmedName, description.trim() || undefined)
      setName("")
      setDescription("")
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) handleSubmit()
    if (e.key === "Escape") onCancel()
  }

  return (
    <div className="mb-3 space-y-2">
      <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2 py-2 focus-within:border-zinc-700">
        <Input
          ref={nameRef}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (error) setError("")
          }}
          onKeyDown={handleKeyDown}
          disabled={saving}
          placeholder="Name"
          className="h-6 border-0 bg-transparent px-0 text-xs text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-0"
        />
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={saving}
          placeholder="Description (optional)"
          className="h-6 border-0 bg-transparent px-0 text-xs text-zinc-500 placeholder:text-zinc-700 focus-visible:ring-0"
        />
        <div className="flex items-center gap-1 self-end">
          {saving ? (
            <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />
          ) : (
            <>
              <button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className={cn(
                  "rounded p-0.5 transition-colors",
                  name.trim()
                    ? "text-zinc-300 hover:text-emerald-400"
                    : "cursor-not-allowed text-zinc-700"
                )}
                aria-label="Add mod manager"
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                onClick={onCancel}
                className="rounded p-0.5 text-zinc-600 transition-colors hover:text-zinc-300"
                aria-label="Cancel"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      </div>
      {error && (
        <p className="px-2 text-[10px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Main Sheet ────────────────────────────────────────────────────────────────

export default function ModManagerManageSheet({
  open,
  onOpenChange,
}: ModManagerManageSheetProps) {
  const [modManagers, setModManagers] = useState<ModManager[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const { refreshOptions } = useContext(FilterContext)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    listModManagers()
      .then(setModManagers)
      .finally(() => setLoading(false))
  }, [open])

  // ── Create ─────────────────────────────────────────────────────────────────
  async function handleAdd(name: string, description?: string) {
    const tempId = `temp-${Date.now()}`

    setModManagers((prev) => [...prev, { id: tempId, name, description }])
    setShowAddForm(false)

    try {
      const created = await createModManager({ name, description })
      setModManagers((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { id: created?.id ?? tempId, name, description }
            : m
        )
      )
      refreshOptions("modManagers")
    } catch {
      setModManagers((prev) => prev.filter((m) => m.id !== tempId))
      setShowAddForm(true)
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  function handleDelete(id: string) {
    const snapshot = modManagers
    setModManagers((prev) => prev.filter((m) => m.id !== id))

    deleteModManager(id)
      .then(() => refreshOptions("modManagers"))
      .catch(() => {
        setModManagers(snapshot)
      })
  }

  // ── Edit ───────────────────────────────────────────────────────────────────
  async function handleEdit(id: string, name: string, description?: string) {
    const snapshot = modManagers
    setModManagers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name, description } : m))
    )

    try {
      await updateModManager(id, { name, description })
      refreshOptions("modManagers")
    } catch {
      setModManagers(snapshot)
      throw new Error("Update failed")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden border-l border-zinc-800 bg-[#0b0b0c] p-0 sm:max-w-[480px]">
        {/* Header */}
        <div className="shrink-0 border-b border-zinc-800/60 px-8 py-6">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
            Manage Mod Managers
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Add, edit, or remove mod managers to keep your library organized.
          </p>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                `${modManagers.length} mod manager${modManagers.length !== 1 ? "s" : ""}`
              )}
            </span>
            {!showAddForm && (
              <Button
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="h-7 gap-1.5 bg-zinc-100 px-3 text-[11px] font-semibold text-zinc-950 hover:bg-white"
              >
                <Plus className="h-3 w-3" />
                Add Mod Manager
              </Button>
            )}
          </div>

          {showAddForm && (
            <AddModManagerForm
              onAdd={handleAdd}
              onCancel={() => setShowAddForm(false)}
              existingNames={modManagers.map((m) => m.name)}
            />
          )}

          {loading ? (
            <ModManagerSkeleton />
          ) : modManagers.length === 0 && !showAddForm ? (
            <EmptyState onAdd={() => setShowAddForm(true)} />
          ) : (
            <div className="space-y-0.5">
              {modManagers.map((m) => (
                <ModManagerRow
                  key={m.id}
                  modManager={m}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-zinc-800/60 px-8 py-5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 border-zinc-800 bg-transparent px-4 text-xs text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/40 hover:text-zinc-200"
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}