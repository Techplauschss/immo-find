interface CashflowCalculationParams {
  price: string;
  qm: string;
  city: string;
}

export const calculateCashflow = ({ price, qm, city }: CashflowCalculationParams): number => {
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

export const isPositiveCashflow = (cashflow: number): boolean => {
  return cashflow >= 0
}
