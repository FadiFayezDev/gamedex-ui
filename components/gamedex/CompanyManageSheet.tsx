import React, { useContext, useEffect, useRef, useState } from "react"
import { Sheet, SheetContent } from "../ui/sheet"
import {
  createCompany,
  deleteCompany,
  listCompanies,
  updateCompanyName,
} from "@/lib/services/companies"
import { Company } from "@/components/models/ecosystem/Company"
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { cn } from "@/lib/utils"
import { FilterContext } from "../contexts/FilterContext"

type CompanyManageSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function CompanySkeleton() {
  return (
    <div className="space-y-1">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div
            className="h-3 animate-pulse rounded bg-zinc-800"
            style={{ width: `${60 + i * 18}px`, opacity: 1 - i * 0.15 }}
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
        <p className="text-sm font-medium text-zinc-300">No companies yet</p>
        <p className="mt-0.5 text-xs text-zinc-600">
          Add your first company to start organizing your library.
        </p>
      </div>
      <button
        onClick={onAdd}
        className="mt-1 text-xs font-medium text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
      >
        Add a company
      </button>
    </div>
  )
}

// ─── Company Row ───────────────────────────────────────────────────────────────

type CompanyRowProps = {
  company: Company
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => Promise<void>
}

function CompanyRow({ company, onDelete, onRename }: CompanyRowProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(company.name)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) setValue(company.name)
  }, [company.name, editing])

  function startEdit() {
    setEditing(true)
    setValue(company.name)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function cancelEdit() {
    setEditing(false)
    setValue(company.name)
  }

  async function commitEdit() {
    const trimmed = value.trim()
    if (!trimmed || trimmed === company.name) {
      cancelEdit()
      return
    }
    setSaving(true)
    try {
      await onRename(company.id, trimmed)
      setEditing(false)
    } catch {
      cancelEdit()
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitEdit()
    if (e.key === "Escape") cancelEdit()
  }

  return (
    <div className="group flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-zinc-800/40">
      {editing ? (
        <>
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={saving}
            className="h-6 border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100 focus-visible:ring-zinc-600"
          />
          <div className="flex shrink-0 items-center gap-1">
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
        </>
      ) : (
        <>
          <span className="text-xs text-zinc-200">{company.name}</span>
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={startEdit}
              className="rounded p-0.5 text-zinc-600 transition-colors hover:text-zinc-300"
              aria-label={`Rename ${company.name}`}
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={() => onDelete(company.id)}
              className="rounded p-0.5 text-zinc-600 transition-colors hover:text-red-400"
              aria-label={`Delete ${company.name}`}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Add Company Form ──────────────────────────────────────────────────────────

type AddFormProps = {
  onAdd: (name: string) => Promise<void>
  onCancel: () => void
}

function AddCompanyForm({ onAdd, onCancel }: AddFormProps) {
  const [value, setValue] = useState("")
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed) return
    setSaving(true)
    try {
      await onAdd(trimmed)
      setValue("")
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit()
    if (e.key === "Escape") onCancel()
  }

  return (
    <div className="mb-3 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2 py-1.5">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={saving}
        placeholder="Company name…"
        className="h-6 border-0 bg-transparent px-0 text-xs text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-0"
      />
      <div className="flex shrink-0 items-center gap-1">
        {saving ? (
          <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />
        ) : (
          <>
            <button
              onClick={handleSubmit}
              disabled={!value.trim()}
              className={cn(
                "rounded p-0.5 transition-colors",
                value.trim()
                  ? "text-zinc-300 hover:text-emerald-400"
                  : "cursor-not-allowed text-zinc-700"
              )}
              aria-label="Add company"
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
  )
}

// ─── Main Sheet ────────────────────────────────────────────────────────────────

export default function CompanyManageSheet({
  open,
  onOpenChange,
}: CompanyManageSheetProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const { refreshOptions } = useContext(FilterContext)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    listCompanies()
      .then(setCompanies)
      .finally(() => setLoading(false))
  }, [open])

  // ── Create ─────────────────────────────────────────────────────────────────
  async function handleAdd(name: string) {
    const tempId = `temp-${Date.now()}`

    setCompanies((prev) => [...prev, { id: tempId, name }])
    setShowAddForm(false)

    try {
      const created = await createCompany({ name })
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === tempId ? { id: created?.id ?? tempId, name } : c
        )
      )
      refreshOptions("companies")
    } catch {
      setCompanies((prev) => prev.filter((c) => c.id !== tempId))
      setShowAddForm(true)
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  function handleDelete(id: string) {
    const snapshot = companies
    setCompanies((prev) => prev.filter((c) => c.id !== id))

    deleteCompany(id)
      .then(() => refreshOptions("companies"))
      .catch(() => {
        setCompanies(snapshot)
      })
  }

  // ── Rename ─────────────────────────────────────────────────────────────────
  async function handleRename(id: string, name: string) {
    const snapshot = companies
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c))
    )

    try {
      await updateCompanyName(id, { newName: name })
      refreshOptions("companies")
    } catch {
      setCompanies(snapshot)
      throw new Error("Rename failed")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden border-l border-zinc-800 bg-[#0b0b0c] p-0 sm:max-w-[480px]">
        {/* Header */}
        <div className="shrink-0 border-b border-zinc-800/60 px-8 py-6">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
            Manage Companies
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Add, rename, or remove companies to keep your library organized.
          </p>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                `${companies.length} compan${companies.length !== 1 ? "ies" : "y"}`
              )}
            </span>
            {!showAddForm && (
              <Button
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="h-7 gap-1.5 bg-zinc-100 px-3 text-[11px] font-semibold text-zinc-950 hover:bg-white"
              >
                <Plus className="h-3 w-3" />
                Add Company
              </Button>
            )}
          </div>

          {showAddForm && (
            <AddCompanyForm
              onAdd={handleAdd}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {loading ? (
            <CompanySkeleton />
          ) : companies.length === 0 && !showAddForm ? (
            <EmptyState onAdd={() => setShowAddForm(true)} />
          ) : (
            <div className="space-y-0.5">
              {companies.map((c) => (
                <CompanyRow
                  key={c.id}
                  company={c}
                  onDelete={handleDelete}
                  onRename={handleRename}
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