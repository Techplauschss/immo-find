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

  const calculateCashflowInternal = () => {
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
      
      // Debug-Ausgaben in der Konsole
      console.group(`🏠 Cashflow-Berechnung für ${price} | ${qm} | ${city}`)
      console.log(`📊 Kaufpreis: ${kaufpreis.toLocaleString('de-DE')} €`)
      console.log(`📐 Fläche: ${flaeche} m²`)
      console.log(`🏙️ Stadt: ${city}`)
      console.log(`💰 Mietpreis pro m²: ${mietpreisProQm} €/m²`)
      console.log(``)
      console.log(`📈 Berechnung:`)
      console.log(`   💵 Mieteinnahmen: ${flaeche} m² × ${mietpreisProQm} €/m² = ${mieteinnahmen.toFixed(2)} €/Monat`)
      console.log(`   🏦 Eigenkapital: ${eigenkapital.toLocaleString('de-DE')} €`)
      console.log(`   💳 Darlehen: ${kaufpreis.toLocaleString('de-DE')} € - ${eigenkapital.toLocaleString('de-DE')} € = ${darlehen.toLocaleString('de-DE')} €`)
      console.log(`   📋 Zinssatz: ${zinssatz * 100}% p.A.`)
      console.log(`   📋 Tilgungssatz: ${tilgungssatz * 100}% p.A.`)
      console.log(`   💸 Annuität: ${darlehen.toLocaleString('de-DE')} € × ${gesamtrate * 100}% ÷ 12 = ${annuitaetProMonat.toFixed(2)} €/Monat`)
      console.log(`   🔧 Nicht umlagefähige Kosten: ${kaufpreis.toLocaleString('de-DE')} € × 1,5% ÷ 12 = ${nichtUmlagefahigeKostenProMonat.toFixed(2)} €/Monat`)
      console.log(``)
      console.log(`🎯 Cashflow-Ergebnis:`)
      console.log(`   ${mieteinnahmen.toFixed(2)} € - ${annuitaetProMonat.toFixed(2)} € - ${nichtUmlagefahigeKostenProMonat.toFixed(2)} € = ${cashflow.toFixed(2)} €`)
      console.log(`   ➡️ Kaufmännisch gerundet: ${Math.round(cashflow)} €`)
      console.groupEnd()
      
      // Kaufmännisches Runden (bereits durch Math.round implementiert)
      return Math.round(cashflow)
    } catch (error) {
      console.error(`❌ Fehler bei Cashflow-Berechnung für ${price} | ${qm}:`, error)
      // Fallback auf Dummywert bei Parsing-Fehlern
      return 100
    }
  }

  // Verwende berechneten oder übergebenen Wert
  const actualValue = cashflowValue !== undefined && !isNaN(cashflowValue) ? cashflowValue : calculateCashflowInternal()
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

// Utility function to calculate cashflow for external use
export const getCashflowValue = (price: string, qm: string, city: string): number => {
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
    
    // Kaufmännisches Runden
    return Math.round(cashflow)
  } catch (error) {
    console.error(`❌ Fehler bei Cashflow-Berechnung für ${price} | ${qm}:`, error)
    // Fallback auf Dummywert bei Parsing-Fehlern
    return 100
  }
}

export default CashflowChip
