"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Settings = {
  notificationsEnabled: boolean
}

type SettingsContextType = {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const STORAGE_KEY = "gamedex-settings"

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    notificationsEnabled: true,
  })
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse settings", e)
      }
    }
    setIsInitialized(true)
  }, [])

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error("useSettings must be used within SettingsProvider")
  return context
}
