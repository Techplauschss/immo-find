import React from 'react'
import { IconButton, Tooltip } from '@mui/material'
import { Calculate } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

interface CalculatorIconProps {
  price: string
  qm: string
  city?: string  // Stadt für automatische Vorauswahl im Rechner
  sx?: any
}

const CalculatorIcon: React.FC<CalculatorIconProps> = ({ price, qm, city, sx }) => {
  const navigate = useNavigate()

  const handleCalculatorClick = (event: React.MouseEvent) => {
    // Stoppe die Ereignis-Propagation, damit nicht die ganze Karte geklickt wird
    event.stopPropagation()
    
    // Extrahiere numerische Werte aus den Strings
    const priceValue = price.replace(/[€.,\s]/g, '')
    const qmValue = qm.replace(',', '.')
    
    // Baue URL-Parameter auf, inklusive Stadt falls verfügbar
    let url = `/rechner?price=${priceValue}&qm=${qmValue}`
    if (city) {
      url += `&city=${encodeURIComponent(city)}`
    }
    
    // Navigiere zum Rechner mit URL-Parametern
    navigate(url)
    
    // Scrolle nach kurzer Verzögerung nach oben
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  return (
    <Tooltip title="Zum Rechner mit diesen Werten" arrow>
      <IconButton
        onClick={handleCalculatorClick}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          backgroundColor: 'primary.main',
          color: 'white',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
          '&:hover': {
            backgroundColor: 'primary.dark',
            transform: 'scale(1.15)',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
          },
          transition: 'all 0.3s ease-in-out',
          border: '2px solid white',
          ...sx
        }}
        size="medium"
      >
        <Calculate 
          sx={{ 
            fontSize: 20,
            color: 'inherit'
          }} 
        />
      </IconButton>
    </Tooltip>
  )
}

export default CalculatorIcon
