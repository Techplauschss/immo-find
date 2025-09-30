import React from 'react'
import { Chip } from '@mui/material'
import { TrendingUp } from '@mui/icons-material'
import { useCitySettings } from './contexts/CitySettingsContext'

interface CashflowChipProps {
  price: string         // Kaufpreis der Immobilie (z.B. "450.000 €")
  qm: string           // Fläche der Immobilie (z.B. "85,5 m²")
  city: string         // Stadt für Mietpreis-Bestimmung
  cashflowValue?: number  // Optional, falls manuell überschrieben
  customRentValue?: number // Optional: benutzerdefinierter Mietpreis pro Monat
}

const CashflowChip: React.FC<CashflowChipProps> = ({ price, qm, city, cashflowValue, customRentValue }) => {
  const { getRentPerSqm } = useCitySettings()

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
      
      // 1. Mieteinnahmen pro Monat
      let mieteinnahmen: number
      if (customRentValue && customRentValue > 0) {
        // Verwende benutzerdefinierten Mietpreis (bereits als Gesamtmiete pro Monat)
        mieteinnahmen = customRentValue
      } else {
        // Berechne basierend auf Stadt-Settings
        const mietpreisProQm = getRentPerSqm(city)
        mieteinnahmen = mietpreisProQm * flaeche
      }
      
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
      
      // Kaufmännisches Runden (bereits durch Math.round implementiert)
      return Math.round(cashflow)
    } catch (error) {
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

// Custom Hook für Cashflow-Berechnung
export const useCashflowCalculation = () => {
  const { getRentPerSqm } = useCitySettings()

  const calculateCashflow = (price: string, qm: string, city: string): number => {
    try {
      // Parse Kaufpreis
      const kaufpreis = parseInt(price.replace(/[€.,\s]/g, ''))
      
      // Parse Fläche
      const flaeche = parseFloat(qm.replace(',', '.'))
      
      // Mietpreis pro m² pro Monat basierend auf Stadt (aus Context)
      const mietpreisProQm = getRentPerSqm(city)
      
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

  return { calculateCashflow }
}

// Legacy function für Backward-Kompatibilität - wird in einer separaten Komponente ersetzt
// Da getCashflowValue eine statische Funktion ist, kann sie nicht direkt auf den
// useCitySettings-Hook zugreifen. Stattdessen lesen wir die Einstellungen aus dem
// localStorage, wo sie von SettingsPanel.tsx gespeichert werden.
export const getCashflowValue = (price: string, qm: string, city: string): number => {
  // Lade die Einstellungen aus dem localStorage
  const savedSettings = localStorage.getItem('citySettings');
  const settings = savedSettings ? JSON.parse(savedSettings) : {
    loanDefaults: {
      interestRate: 3.5,
      repaymentRate: 2,
      downPayment: 10000,
    },
    rentPerSqm: {
      Dresden: 10,
      Leipzig: 11,
      Senftenberg: 8,
    },
    nonApportionableCostsPerSqm: 25,
  };

  const rentPerSqm = settings.rentPerSqm[city] || 10;
  const interestRate = settings.loanDefaults.interestRate;
  const repaymentRate = settings.loanDefaults.repaymentRate;
  const downPayment = settings.loanDefaults.downPayment;
  const nonApportionableCostsPerSqm = settings.nonApportionableCostsPerSqm;

  const purchasePrice = parseInt(price.replace(/[€.,\s]/g, ''));
  const squareMeters = parseFloat(qm.replace(',', '.'));

  if (isNaN(purchasePrice) || isNaN(squareMeters) || squareMeters === 0) {
    return -999999; // Ein sehr niedriger Wert für ungültige Daten
  }

  // Einnahmen
  const rentIncome = squareMeters * rentPerSqm;

  // Kosten
  const loanAmount = Math.max(0, purchasePrice - downPayment);
  const monthlyInterest = (loanAmount * (interestRate / 100)) / 12;
  const monthlyRepayment = (loanAmount * (repaymentRate / 100)) / 12;
  const monthlyNonApportionableCosts = (squareMeters * nonApportionableCostsPerSqm) / 12;

  const monthlyCosts = monthlyInterest + monthlyRepayment + monthlyNonApportionableCosts;

  return rentIncome - monthlyCosts;
};

export default CashflowChip
