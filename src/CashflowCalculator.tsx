import { useCashflowCalculation } from './CashflowChip'

// Wrapper-Komponente für Cashflow-Berechnung mit Context
export const CashflowCalculator = ({ onCalculate }: { onCalculate: (calculate: (price: string, qm: string, city: string) => number) => void }) => {
  const { calculateCashflow } = useCashflowCalculation()
  
  // Callback für Parent-Komponente
  onCalculate(calculateCashflow)
  
  return null // Renderkomponente
}

export default CashflowCalculator
