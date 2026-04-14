// ─── Field config for the generic AddForm ────────────────────────────────────
interface FormField {
  key: string
  placeholder: string
  type?: "text" | "number" | "date" | "file"
  options?: { value: string; label: string }[]
}