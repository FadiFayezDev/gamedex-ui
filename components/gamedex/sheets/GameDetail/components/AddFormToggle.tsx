import { Plus } from "lucide-react"
import { useState } from "react"
import { AddForm } from "./AddForm"
import type { AddFormValues, FormFieldConfig } from "../gameDetail.shared"

type AddFormToggleProps<TValues extends AddFormValues> = {
  fields: FormFieldConfig<Extract<keyof TValues, string>>[]
  onSave: (values: TValues) => Promise<void>
}

export function AddFormToggle<TValues extends AddFormValues>({
  fields,
  onSave,
}: AddFormToggleProps<TValues>) {
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
      onSave={async (values) => {
        await onSave(values)
        setActive(false)
      }}
      onCancel={() => setActive(false)}
    />
  )
}
