import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

export interface CitySettings {
  Dresden: {
    rentPerSqm: number
  }
  Leipzig: {
    rentPerSqm: number
  }
}

interface CitySettingsContextType {
  settings: CitySettings
  updateCitySetting: (city: 'Dresden' | 'Leipzig', rentPerSqm: number) => void
  getRentPerSqm: (city: string) => number
}

const defaultSettings: CitySettings = {
  Dresden: {
    rentPerSqm: 9.5
  },
  Leipzig: {
    rentPerSqm: 9.8
  }
}

const CitySettingsContext = createContext<CitySettingsContextType | undefined>(undefined)

const STORAGE_KEY = 'immo-find-city-settings'

export const CitySettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CitySettings>(defaultSettings)

  // Lade Einstellungen aus localStorage beim Start
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsedSettings = JSON.parse(stored)
        setSettings({ ...defaultSettings, ...parsedSettings })
      } catch (error) {
        console.error('Fehler beim Laden der Stadt-Einstellungen:', error)
      }
    }
  }, [])

  // Speichere Einstellungen in localStorage bei Änderungen
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const updateCitySetting = (city: 'Dresden' | 'Leipzig', rentPerSqm: number) => {
    setSettings(prev => ({
      ...prev,
      [city]: {
        ...prev[city],
        rentPerSqm
      }
    }))
  }

  const getRentPerSqm = (city: string): number => {
    if (city === 'Dresden') return settings.Dresden.rentPerSqm
    if (city === 'Leipzig') return settings.Leipzig.rentPerSqm
    return settings.Dresden.rentPerSqm // Fallback
  }

  return (
    <CitySettingsContext.Provider value={{ settings, updateCitySetting, getRentPerSqm }}>
      {children}
    </CitySettingsContext.Provider>
  )
}

export const useCitySettings = () => {
  const context = useContext(CitySettingsContext)
  if (context === undefined) {
    throw new Error('useCitySettings must be used within a CitySettingsProvider')
  }
  return context
}
