import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

export interface CitySettings {
  Dresden: {
    rentPerSqm: number
  }
  Leipzig: {
    rentPerSqm: number
  }
  Senftenberg: {
    rentPerSqm: number
  }
  loanDefaults: {
    interestRate: number // Zinssatz in Prozent
    repaymentRate: number // Tilgungssatz in Prozent
  }
}

interface CitySettingsContextType {
  settings: CitySettings
  updateCitySetting: (city: 'Dresden' | 'Leipzig' | 'Senftenberg', rentPerSqm: number) => void
  updateLoanDefault: (key: 'interestRate' | 'repaymentRate', value: number) => void
  getRentPerSqm: (city: string) => number
}

const defaultSettings: CitySettings = {
  Dresden: {
    rentPerSqm: 9.5
  },
  Leipzig: {
    rentPerSqm: 9.8
  },
  Senftenberg: {
    rentPerSqm: 6.5 // Kleinere Stadt, daher niedrigerer Mietpreis
  },
  loanDefaults: {
    interestRate: 2.0, // 2% Zinssatz als Standard
    repaymentRate: 2.0 // 2% Tilgungssatz als Standard
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

  const updateCitySetting = (city: 'Dresden' | 'Leipzig' | 'Senftenberg', rentPerSqm: number) => {
    setSettings(prev => ({
      ...prev,
      [city]: {
        ...prev[city],
        rentPerSqm
      }
    }))
  }

  const updateLoanDefault = (key: 'interestRate' | 'repaymentRate', value: number) => {
    setSettings(prev => ({
      ...prev,
      loanDefaults: {
        ...prev.loanDefaults,
        [key]: value
      }
    }))
  }

  const getRentPerSqm = (city: string): number => {
    if (city === 'Dresden') return settings.Dresden.rentPerSqm
    if (city === 'Leipzig') return settings.Leipzig.rentPerSqm
    if (city === 'Senftenberg') return settings.Senftenberg.rentPerSqm
    return settings.Dresden.rentPerSqm // Fallback
  }

  return (
    <CitySettingsContext.Provider value={{ settings, updateCitySetting, updateLoanDefault, getRentPerSqm }}>
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
