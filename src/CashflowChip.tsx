import React from 'react'
import { Chip } from '@mui/material'
import { TrendingUp } from '@mui/icons-material'

interface CashflowChipProps {
  price: string         // Kaufpreis der Immobilie (z.B. "450.000 €")
  qm: string           // Fläche der Immobilie (z.B. "85,5 m²")
  city: string         // Stadt für Mietpreis-Bestimmung
  cashflowValue?: number  // Optional, falls manuell überschrieben
}

const CashflowChip: React.FC<CashflowChipProps> = ({ price, qm, city, cashflowValue }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const calculateCashflow = () => {
    try {
      // Parse Kaufpreis
      const kaufpreis = parseInt(price.replace(/[€.,\s]/g, ''))
      
      // Parse Fläche
      const flaeche = parseFloat(qm.replace(',', '.'))
      
      // Mietpreis pro m² pro Monat basierend auf Stadt
      const mietpreisProQm = city === 'Dresden' ? 9.5 : 9.5 // Erstmal nur Dresden implementiert
      
      // 1. Mieteinnahmen pro Monat
      const mieteinnahmen = mietpreisProQm * flaeche
      
      // 2. Annuität berechnen
      const eigenkapital = 10000
      const darlehen = kaufpreis - eigenkapital
      const zinssatz = 0.02 // 2% p.A.
      const tilgungssatz = 0.02 // 2% p.A.
      const gesamtrate = zinssatz + tilgungssatz // 4% p.A.
      const annuitaetProMonat = (darlehen * gesamtrate) / 12
      
      // 3. Nicht umlagefähige Kosten (1,5% des Kaufpreises pro Jahr)
      const nichtUmlagefahigeKostenProMonat = (kaufpreis * 0.015) / 12
      
      // Cashflow berechnen
      const cashflow = mieteinnahmen - annuitaetProMonat - nichtUmlagefahigeKostenProMonat
      
      return Math.round(cashflow)
    } catch (error) {
      // Fallback auf Dummywert bei Parsing-Fehlern
      return 100
    }
  }

  // Verwende berechneten oder übergebenen Wert
  const actualValue = cashflowValue !== undefined && !isNaN(cashflowValue) ? cashflowValue : calculateCashflow()
  const isPositive = actualValue >= 0
  const displayValue = formatCurrency(Math.abs(actualValue))
  const sign = isPositive ? '+' : '-'

  return (
    <Chip
      icon={<TrendingUp />}
      label={`Cashflow ${sign}${displayValue} €`}
      size="small"
      sx={{
        backgroundColor: isPositive ? '#16a34a' : '#dc2626',
        color: 'white',
        fontWeight: 600,
        '& .MuiChip-icon': {
          color: 'white',
        },
        '&:hover': {
          backgroundColor: isPositive ? '#15803d' : '#b91c1c',
        },
      }}
    />
  )
}

export default CashflowChip
