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
}

const SearchIcon: React.FC<SearchIconProps> = ({ link, qm, city, sx, onSearchStart, onSearchEnd }) => {
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
        
        // Ausgabe des finalen Wertes
        console.log('value:', finalValue)
      } else {
        console.log('Keine Werte in der API-Antwort gefunden')
      }
      
    } catch (error) {
      console.error('Fehler beim Aufrufen der Scrape-Link API:', error)
    } finally {
      setLoading(false)
      onSearchEnd?.()
    }
  }

  return (
    <Tooltip title="Link durchsuchen" arrow>
      <IconButton
        onClick={handleSearchClick}
        disabled={loading}
        sx={{
          position: 'absolute',
          top: 16,
          right: 72, // Positioniert links neben dem Calculator-Button
          backgroundColor: 'secondary.main',
          color: 'white',
          boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
          '&:hover': {
            backgroundColor: 'secondary.dark',
            transform: 'scale(1.15)',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
          },
          '&:disabled': {
            backgroundColor: 'secondary.light',
            color: 'white',
          },
          transition: 'all 0.3s ease-in-out',
          border: '2px solid white',
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
