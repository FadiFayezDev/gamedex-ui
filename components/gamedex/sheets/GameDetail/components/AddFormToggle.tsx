import { Plus } from "lucide-react"
import { AddForm } from "./AddForm"
import { useState } from "react"

export function AddFormToggle({
  fields,
  onSave,
}: {
  fields: FormField[]
  onSave: (values: any) => Promise<void>
}) {
  const [active, setActive] = useState(false)

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="inline-flex items-center gap-1 text-[10px] text-zinc-600 transition-colors hover:text-zinc-300"
      >
        <Plus className="h-3 w-3" /> Add
      </button>
    )
  }

  return (
    <AddForm
      fields={fields}
      onSave={async (v) => {
        await onSave(v)
        setActive(false)
      }}
      onCancel={() => setActive(false)}
    />
  )
}