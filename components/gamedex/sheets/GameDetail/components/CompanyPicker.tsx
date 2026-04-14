import { AssociationType } from "@/components/enums/AssociationType";
import { ArrowLeft, Loader2, Plus, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ASSOC_DEVELOPER, ASSOC_PUBLISHER } from "./Associations"
import { listCompanies } from "@/lib/services/companies"

// ─── CompanyPicker ────────────────────────────────────────────────────────────
export function CompanyPicker({
  linkedCompanies,
  onSelect,
}: {
  linkedCompanies: { name: string; type: AssociationType }[]
  onSelect: (company: PickerEntity, type: AssociationType) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"pick" | "role">("pick")
  const [companies, setCompanies] = useState<PickerEntity[]>([])
  const [selected, setSelected] = useState<PickerEntity | null>(null)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    listCompanies()
      .then(setCompanies)
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false))
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false)
        setStep("pick")
        setSelected(null)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const available = companies.filter((c) => {
    const isSearchMatch = c.name.toLowerCase().includes(query.toLowerCase())
    const rolesCount = linkedCompanies.filter((lc) => lc.name === c.name).length
    return isSearchMatch && rolesCount < 2
  })

  const handleRoleSelect = async (type: AssociationType) => {
    if (!selected) return
    setSaving(true)
    try {
      await onSelect(selected, type)
      setOpen(false)
      setStep("pick")
      setSelected(null)
      setQuery("")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-[10px] text-zinc-600 transition-colors hover:text-zinc-300"
      >
        <Plus className="h-3 w-3" /> Add
      </button>

      {open && (
        <div className="absolute top-6 right-0 z-50 w-52 rounded-xl border border-zinc-700/60 bg-zinc-900 shadow-2xl shadow-black/60">
          {step === "pick" ? (
            <>
              <div className="flex items-center gap-2 border-b border-zinc-800 px-2.5 py-2">
                <Search className="h-3 w-3 shrink-0 text-zinc-600" />
                <input
                  autoFocus
                  className="flex-1 bg-transparent text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
                  placeholder="Search companies…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="max-h-48 overflow-y-auto py-1">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-600" />
                  </div>
                ) : available.length === 0 ? (
                  <p className="px-3 py-3 text-center text-[10px] text-zinc-600">
                    No companies found
                  </p>
                ) : (
                  available.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelected(c)
                        setStep("role")
                      }}
                      className="flex w-full items-center px-3 py-1.5 text-left text-xs text-zinc-300 transition-colors hover:bg-zinc-800/80"
                    >
                      {c.name}
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 border-b border-zinc-800 px-2.5 py-2">
                <button
                  onClick={() => setStep("pick")}
                  className="shrink-0 text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  <ArrowLeft className="h-3 w-3" />
                </button>
                <span className="truncate text-xs font-medium text-zinc-300">
                  {selected?.name}
                </span>
              </div>
              <div className="py-1">
                <p className="px-3 pt-0.5 pb-1 text-[9px] tracking-widest text-zinc-600 uppercase">
                  Select role
                </p>
                {(
                  [
                    ["Developer", ASSOC_DEVELOPER],
                    ["Publisher", ASSOC_PUBLISHER],
                  ] as [string, AssociationType][]
                ).map(([label, type]) => {
                  const isAlreadyLinked = linkedCompanies.some(
                    (lc) => lc.name === selected?.name && lc.type === type
                  )
                  return (
                    <button
                      key={label}
                      onClick={() => handleRoleSelect(type)}
                      disabled={saving || isAlreadyLinked}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-zinc-300 transition-colors hover:bg-zinc-800/80 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                      {label}
                      {isAlreadyLinked && (
                        <span className="ml-auto text-[8px] text-zinc-500">
                          (Added)
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}