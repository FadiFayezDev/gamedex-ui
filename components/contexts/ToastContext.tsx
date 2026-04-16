"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react"
import { useSettings } from "./SettingsContext"

export type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
  id: string
  message: string
  description?: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, description?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const { settings } = useSettings()

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = "info", description?: string) => {
      if (!settings.notificationsEnabled) return

      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, message, type, description }])

      // Auto-remove after 4 seconds
      setTimeout(() => removeToast(id), 4000)
    },
    [removeToast, settings.notificationsEnabled]
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-[380px] pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-zinc-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-zinc-800 bg-[#09090b]/90 p-4 shadow-2xl backdrop-blur-md"
    >
      <div className="mt-0.5 shrink-0">{icons[toast.type]}</div>
      <div className="flex-1 space-y-1">
        <h4 className="text-sm font-semibold text-zinc-100">{toast.message}</h4>
        {toast.description && (
          <p className="text-xs text-zinc-400 leading-relaxed">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onRemove}
        className="shrink-0 rounded-md p-1 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-zinc-400"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within ToastProvider")
  return context
}
