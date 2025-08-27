import React, { useState } from 'react'
import { IconButton, Tooltip, CircularProgress } from '@mui/material'
import { Search } from '@mui/icons-material'
import { useCitySettings } from './contexts/CitySettingsContext'

interface SearchIconProps {
  link: string
  qm: string // Fläche der Anzeige
  city: string // Stadt der Anzeige
  sx?: any
  onSearchStart?: () => void
  onSearchEnd?: () => void
  onValueFound?: (value: number) => void // Callback für gefundenen Wert
  onSearchFailed?: () => void // Callback für fehlgeschlagene Suche
  hasFoundValue?: boolean // Ob bereits ein Wert gefunden wurde
  searchFailed?: boolean // Ob die Suche fehlgeschlagen ist
}

const SearchIcon: React.FC<SearchIconProps> = ({ link, qm, city, sx, onSearchStart, onSearchEnd, onValueFound, onSearchFailed, hasFoundValue, searchFailed }) => {
  const [loading, setLoading] = useState(false)
  const { getRentPerSqm } = useCitySettings()

  const handleSearchClick = async (event: React.MouseEvent) => {
    // Stoppe die Ereignis-Propagation, damit nicht die ganze Karte geklickt wird
    event.stopPropagation()
    
    if (loading) return // Verhindere mehrfache Klicks während des Ladens
    
    setLoading(true)
    onSearchStart?.()
    
    try {
      // API-Aufruf an den scrape-link Endpoint
      const response = await fetch(`/api/scrape-link?url=${encodeURIComponent(link)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.listing?.values && data.listing.values.length > 0) {
        // Finde den niedrigsten Wert
        const lowestValue = data.listing.values.reduce((min: any, current: any) => {
          // Parse deutsche Zahlenformate (Punkt als Tausendertrennzeichen, Komma als Dezimaltrennzeichen)
          const currentValue = parseFloat(current.value.replace(/\./g, '').replace(',', '.')) || 0
          const minValue = parseFloat(min.value.replace(/\./g, '').replace(',', '.')) || 0
          return currentValue < minValue ? current : min
        })
        
        // Parse den niedrigsten Wert korrekt (deutsche Zahlenformate)
        let finalValue = parseFloat(lowestValue.value.replace(/\./g, '').replace(',', '.')) || 0
        
        // Berechne Schwellenwert: Mietpreis × 2 × Fläche
        const mietpreisProQm = getRentPerSqm(city)
        const flaeche = parseFloat(qm.replace(',', '.')) || 0
        const schwellenwert = mietpreisProQm * 2 * flaeche
        
        // Teile durch 12, wenn der Wert größer als der Schwellenwert ist
        if (finalValue > schwellenwert) {
          finalValue = finalValue / 12
          console.log(`Wert war größer als Schwellenwert (${schwellenwert.toFixed(2)}), durch 12 geteilt:`, finalValue.toFixed(2))
        } else {
          console.log('Niedrigster Wert:', finalValue.toFixed(2))
        }
        
        // Callback aufrufen, wenn ein Wert > 0 gefunden wurde
        if (finalValue > 0 && onValueFound) {
          onValueFound(finalValue)
        } else if (onSearchFailed) {
          // Callback aufrufen, wenn kein Wert gefunden wurde
          onSearchFailed()
        }
      } else {
        console.log('Keine Werte in der API-Antwort gefunden')
        // Callback aufrufen, wenn keine Werte in der API-Antwort gefunden wurden
        if (onSearchFailed) {
          onSearchFailed()
        }
      }
      
    } catch (error) {
      console.error('Fehler beim Aufrufen der Scrape-Link API:', error)
      // Callback aufrufen bei API-Fehlern
      if (onSearchFailed) {
        onSearchFailed()
      }
    } finally {
      setLoading(false)
      onSearchEnd?.()
    }
  }

  // Bestimme den Tooltip-Text basierend auf dem Zustand
  const getTooltipText = () => {
    if (hasFoundValue) return "Mietwerte gefunden - erneut durchsuchen möglich"
    if (searchFailed) return "Keine Mietwerte gefunden - erneut versuchen"
    return "Link durchsuchen"
  }

  // Bestimme die Hintergrundfarbe basierend auf dem Zustand
  const getBackgroundColor = () => {
    if (hasFoundValue) return '#22c55e' // Grün für gefundene Werte
    if (searchFailed) return '#dc2626' // Rot für fehlgeschlagene Suchen
    return 'secondary.main' // Normal lila
  }

  // Bestimme die Shadow-Farbe basierend auf dem Zustand
  const getShadowColor = () => {
    if (hasFoundValue) return 'rgba(34, 197, 94, 0.3)'
    if (searchFailed) return 'rgba(220, 38, 38, 0.3)'
    return 'rgba(124, 58, 237, 0.3)'
  }

  return (
    <Tooltip title={getTooltipText()} arrow>
      <IconButton
        onClick={handleSearchClick}
        disabled={loading}
        sx={{
          position: 'absolute',
          top: 16,
          right: 60, // Positioniert links neben dem Calculator-Button (verringerter Abstand)
          backgroundColor: getBackgroundColor(),
          color: 'white',
          boxShadow: `0 2px 8px ${getShadowColor()}`,
          '&:hover': {
            backgroundColor: 'secondary.dark',
            transform: 'scale(1.15)',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
          },
          '&:disabled': {
            backgroundColor: 'secondary.light',
            color: 'white',
            opacity: 0.6,
          },
          transition: 'all 0.3s ease-in-out',
          border: '2px solid white',
          cursor: 'pointer',
          ...sx
        }}
        size="medium"
      >
        {loading ? (
          <CircularProgress 
            size={20} 
            sx={{ color: 'inherit' }}
          />
        ) : (
          <Search 
            sx={{ 
              fontSize: 20,
              color: 'inherit'
            }} 
          />
        )}
      </IconButton>
    </Tooltip>
  )
}

export default SearchIcon
