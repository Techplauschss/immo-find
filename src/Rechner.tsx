import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Stack,
  InputAdornment,
  ThemeProvider,
  createTheme,
  CssBaseline,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material'
import {
  Euro,
  ArrowBack,
  Percent,
} from '@mui/icons-material'
import { useCitySettings } from './contexts/CitySettingsContext'

// Material-UI Theme (gleicher wie in App.tsx)
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#7c3aed',
      light: '#8b5cf6',
      dark: '#6d28d9',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Product Sans", "Google Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
    h2: {
      fontWeight: 500,
      fontSize: '3.5rem',
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 500,
      letterSpacing: '-0.005em',
    },
    h6: {
      fontWeight: 400,
      letterSpacing: '0em',
    },
    button: {
      fontWeight: 500,
      letterSpacing: '0.01em',
      textTransform: 'none',
    },
    body1: {
      fontWeight: 400,
      letterSpacing: '0.00938em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          },
        },
      },
    },
  },
})

function Rechner() {
  const navigate = useNavigate()
  const { getRentPerSqm } = useCitySettings()
  
  // Eingabefelder
  const [purchasePrice, setPurchasePrice] = useState('')
  const [squareMeters, setSquareMeters] = useState('')
  const [nonApportionable, setNonApportionable] = useState('')
  const [apportionable, setApportionable] = useState('')
  const [downPayment, setDownPayment] = useState('')
  const [autoRentPrice, setAutoRentPrice] = useState('')
  const [manualRentPrice, setManualRentPrice] = useState('')
  const [selectedCity, setSelectedCity] = useState('Dresden')
  const [loanType, setLoanType] = useState('Annuitätendarlehen')
  const [interestRate, setInterestRate] = useState('2,0')
  const [repaymentRateInput, setRepaymentRateInput] = useState('2,0')
  const [annuityInput, setAnnuityInput] = useState('')
  const [runtime, setRuntime] = useState('20')
  
  // Berechnete Werte für die dritte Zeile
  const [financingAmount, setFinancingAmount] = useState('')
  
  // Berechnete Werte für die Annuitätsübersicht
  const [monthlyInterest, setMonthlyInterest] = useState(0)
  const [monthlyPrincipal, setMonthlyPrincipal] = useState(0)
  const [monthlyAnnuity, setMonthlyAnnuity] = useState(0)
  const [showAnnuityOverview, setShowAnnuityOverview] = useState(false)
  const [lastEdited, setLastEdited] = useState<'repayment' | 'annuity' | 'runtime'>('repayment')
  const [selectedMonth, setSelectedMonth] = useState('1')
  const [specificMonthInterest, setSpecificMonthInterest] = useState(0)
  const [specificMonthPrincipal, setSpecificMonthPrincipal] = useState(0)
  const [remainingDebtInput, setRemainingDebtInput] = useState('')

  // URL-Parameter beim Laden der Komponente auslesen und Felder befüllen
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const priceParam = urlParams.get('price')
    const qmParam = urlParams.get('qm')
    const cityParam = urlParams.get('city')
    
    // Stadt-Parameter verarbeiten und entsprechend setzen
    if (cityParam && (cityParam === 'Dresden' || cityParam === 'Leipzig')) {
      setSelectedCity(cityParam)
    }
    
    if (priceParam) {
      // Formatiere den Preis in deutsches Format (ohne Euro-Symbol für Input-Felder)
      const formattedPrice = new Intl.NumberFormat('de-DE').format(parseInt(priceParam))
      setPurchasePrice(formattedPrice)
      
      // Berechne automatisch die nicht umlagefähigen Kosten (1,5% des Kaufpreises pro Jahr / 12 Monate)
      const price = parseInt(priceParam)
      const nonApportionableMonthly = (price * 0.015) / 12
      const formattedNonApportionable = new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(nonApportionableMonthly)
      setNonApportionable(formattedNonApportionable)
      
      // Setze standardmäßig 10.000 € Eigenkapital
      const formattedDownPayment = new Intl.NumberFormat('de-DE').format(10000)
      setDownPayment(formattedDownPayment)
    }
    
    if (qmParam) {
      // Setze die Quadratmeter
      const qm = parseFloat(qmParam)
      setSquareMeters(qm.toString().replace('.', ','))
    }

    // Scrolle immer nach oben, wenn die Komponente geladen wird
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Automatische Berechnung des Auto-Mietpreises basierend auf Stadt und QM
  useEffect(() => {
    // Nur automatisch berechnen, wenn kein manueller Preis eingegeben wurde
    const hasManualPrice = manualRentPrice && manualRentPrice.trim() !== '' && manualRentPrice !== '0'
    
    if (!hasManualPrice) {
      const qm = parseFloat(squareMeters.replace(',', '.')) || 0
      if (qm > 0) {
        const pricePerSqm = getRentPerSqm(selectedCity)
        const calculatedPrice = qm * pricePerSqm
        setAutoRentPrice(formatCurrency(calculatedPrice))
      } else {
        setAutoRentPrice('')
      }
    } else {
      // Wenn manueller Preis eingegeben wurde, Auto-Mietpreis leeren
      setAutoRentPrice('')
    }
  }, [squareMeters, selectedCity, manualRentPrice, getRentPerSqm])

  // Automatische Berechnung des Finanzierungsbetrags
  useEffect(() => {
    // Verbesserte Parsing-Logik für deutsche Zahlenformatierung
    const parseFormattedNumber = (value: string) => {
      if (!value) return 0
      // Entferne alle Nicht-Ziffern außer Kommas und Punkten
      const cleaned = value.replace(/[^\d,.]/g, '')
      // Konvertiere deutsche Formatierung (1.000,50) zu englischer (1000.50)
      const normalized = cleaned.replace(/\./g, '').replace(',', '.')
      return parseFloat(normalized) || 0
    }
    
    const price = parseFormattedNumber(purchasePrice)
    const down = parseFormattedNumber(downPayment)
    
    if (price > 0) {
      // Finanzierungsbetrag berechnen
      const financing = Math.max(0, price - down)
      setFinancingAmount(formatCurrency(financing))
    } else {
      setFinancingAmount('')
    }
  }, [purchasePrice, downPayment])

  // Effekt zur automatischen Berechnung der Tilgung oder Laufzeit bei Tilgungsdarlehen
  useEffect(() => {
    if (loanType === 'Tilgung') {
      const financing = parseFormattedNumber(financingAmount)
      const remainingDebt = parseFormattedNumber(remainingDebtInput)
      const runtimeYears = parseFloat(runtime.replace(',', '.')) || 0
      const monthlyRepayment = parseFormattedNumber(repaymentRateInput)

      if (financing > 0) {
        const totalRepayment = financing - remainingDebt
        if (totalRepayment <= 0) {
          if (lastEdited === 'runtime') setRepaymentRateInput('0,00')
          if (lastEdited === 'repayment') setRuntime('0,00')
          return
        }

        if (lastEdited === 'runtime' && runtimeYears > 0) {
          const newMonthlyRepayment = totalRepayment / (runtimeYears * 12)
          setRepaymentRateInput(formatNumber(newMonthlyRepayment.toFixed(2).replace('.', ',')))
        } else if (lastEdited === 'repayment' && monthlyRepayment > 0) {
          const totalMonths = totalRepayment / monthlyRepayment
          const newRuntimeYears = totalMonths / 12
          setRuntime(newRuntimeYears.toFixed(2).replace('.', ','))
        }
      }
    }
  }, [financingAmount, remainingDebtInput, runtime, repaymentRateInput, loanType, lastEdited])

  // Effekt zur Synchronisierung von Tilgung und Annuität
  useEffect(() => {
    const financing = parseFormattedNumber(financingAmount)
    const interestRateDecimal = parseFormattedNumber(interestRate) / 100
    const runtimeYears = parseFloat(runtime.replace(',', '.')) || 0

    if (financing <= 0 || interestRateDecimal <= 0) return

    if (lastEdited === 'repayment') {
      if (loanType === 'Tilgung') {
        // Bei Tilgungsdarlehen: Euro-Betrag wird über Laufzeit verteilt
        const repaymentAmount = parseFormattedNumber(repaymentRateInput)
        if (repaymentAmount > 0 && runtimeYears > 0) {
          const monthlyInterestCalc = (financing * interestRateDecimal) / 12
          const monthlyPrincipalCalc = repaymentAmount / (runtimeYears * 12)
          const newAnnuity = monthlyInterestCalc + monthlyPrincipalCalc
          setAnnuityInput(formatNumber(newAnnuity.toFixed(2).replace('.', ',')))
        } else {
          setAnnuityInput('')
        }
      } else {
        // Bei Annuitätendarlehen: Prozentsatz wird verwendet
        const repaymentRateDecimal = parseFormattedNumber(repaymentRateInput) / 100
        if (repaymentRateDecimal > 0) {
          const monthlyInterestCalc = (financing * interestRateDecimal) / 12
          const monthlyPrincipalCalc = (financing * repaymentRateDecimal) / 12
          const newAnnuity = monthlyInterestCalc + monthlyPrincipalCalc
          setAnnuityInput(formatNumber(newAnnuity.toFixed(2).replace('.', ',')))
        } else {
          setAnnuityInput('')
        }
      }
    } else if (lastEdited === 'annuity') {
      const annuityValue = parseFormattedNumber(annuityInput)
      if (annuityValue > 0) {
        const monthlyInterestCalc = (financing * interestRateDecimal) / 12
        const monthlyPrincipalCalc = annuityValue - monthlyInterestCalc
        if (monthlyPrincipalCalc > 0) {
          const newRepaymentRate = (monthlyPrincipalCalc * 12 / financing) * 100
          setRepaymentRateInput(newRepaymentRate.toFixed(2).replace('.', ','))
        } else {
          setRepaymentRateInput('0,00')
        }
      } else {
        setRepaymentRateInput('')
      }
    }
  }, [financingAmount, interestRate, repaymentRateInput, annuityInput, lastEdited])


  // Automatische Berechnung der Annuität
  useEffect(() => {
    const financing = parseFormattedNumber(financingAmount)
    const interestRateDecimal = parseFormattedNumber(interestRate) / 100
    const repaymentAmount = parseFormattedNumber(repaymentRateInput) // Euro-Betrag statt Prozent
    const repaymentRateDecimal = parseFormattedNumber(repaymentRateInput) / 100 // Für Annuitätendarlehen
    const annuityValue = parseFormattedNumber(annuityInput)
    const runtimeYears = parseFloat(runtime.replace(',', '.')) || 0

    if (financing > 100 && interestRateDecimal > 0) {
      let monthlyInterestCalc = 0
      let monthlyPrincipalCalc = 0
      let monthlyAnnuityCalc = 0

      if (loanType === 'Tilgung') {
        // Bei Tilgungsdarlehen: Die monatliche Tilgung ist konstant
        const monthlyPrincipalCalc = parseFormattedNumber(repaymentRateInput)
        if (monthlyPrincipalCalc > 0) {
          monthlyInterestCalc = (financing * interestRateDecimal) / 12 // Zinsen für ersten Monat
          monthlyAnnuityCalc = monthlyInterestCalc + monthlyPrincipalCalc
        }
      } else {
        // Bei Annuitätendarlehen: Konstante Annuität
        monthlyInterestCalc = (financing * interestRateDecimal) / 12
        if (lastEdited === 'repayment' && repaymentRateDecimal > 0) {
          monthlyPrincipalCalc = (financing * repaymentRateDecimal) / 12
          monthlyAnnuityCalc = monthlyInterestCalc + monthlyPrincipalCalc
        } else if (lastEdited === 'annuity' && annuityValue > 0) {
          monthlyAnnuityCalc = annuityValue
          monthlyPrincipalCalc = monthlyAnnuityCalc - monthlyInterestCalc
        }
      }

      if (monthlyAnnuityCalc > 0) {
        setMonthlyInterest(monthlyInterestCalc)
        setMonthlyPrincipal(monthlyPrincipalCalc)
        setMonthlyAnnuity(monthlyAnnuityCalc)
        setShowAnnuityOverview(true)
      } else {
        setShowAnnuityOverview(false)
      }
    } else {
      setShowAnnuityOverview(false)
    }
  }, [financingAmount, interestRate, repaymentRateInput, annuityInput, lastEdited, loanType])

  // Berechnung der Annuitätsdetails für einen spezifischen Monat
  useEffect(() => {
    const financing = parseFormattedNumber(financingAmount)
    const interestRateDecimal = parseFormattedNumber(interestRate) / 100
    const month = parseInt(selectedMonth, 10)

    if (financing > 0 && interestRateDecimal > 0 && monthlyAnnuity > 0 && month > 0) {
      let remainingDebt = financing
      const monthlyInterestRate = interestRateDecimal / 12
      let currentInterest = 0
      let currentPrincipal = 0

      if (loanType === 'Tilgung') {
        // Bei Tilgungsdarlehen: Konstante Tilgung, variable Zinsen
        const monthlyPrincipalFixed = parseFormattedNumber(repaymentRateInput)
        
        for (let i = 1; i <= month; i++) {
          currentInterest = remainingDebt * monthlyInterestRate
          currentPrincipal = monthlyPrincipalFixed
          remainingDebt -= currentPrincipal
        }
      } else {
        // Bei Annuitätendarlehen: Konstante Annuität, variable Zinsen und Tilgung
        for (let i = 1; i <= month; i++) {
          currentInterest = remainingDebt * monthlyInterestRate
          currentPrincipal = monthlyAnnuity - currentInterest
          remainingDebt -= currentPrincipal
        }
      }

      setSpecificMonthInterest(currentInterest)
      setSpecificMonthPrincipal(currentPrincipal)
    }
  }, [selectedMonth, financingAmount, interestRate, monthlyAnnuity, loanType, repaymentRateInput])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Globale Parsing-Funktion für deutsche Zahlenformatierung
  const parseFormattedNumber = (value: string) => {
    if (!value) return 0
    // Entferne alle Nicht-Ziffern außer Kommas und Punkten
    const cleaned = value.replace(/[^\d,.]/g, '')
    // Konvertiere deutsche Formatierung (1.000,50) zu englischer (1000.50)
    const normalized = cleaned.replace(/\./g, '').replace(',', '.')
    return parseFloat(normalized) || 0
  }

  // Berechnung der Tilgungsdaten für das Diagramm
  const calculateAmortizationData = () => {
    const financing = parseFormattedNumber(financingAmount)
    const interestRateDecimal = parseFloat(interestRate.replace('%', '').replace(',', '.')) / 100
    const repaymentAmount = parseFormattedNumber(repaymentRateInput) // Euro-Betrag für Tilgungsdarlehen
    const repaymentRateDecimal = parseFloat(repaymentRateInput.replace('%', '').replace(',', '.')) / 100 // Prozent für Annuitätendarlehen
    const runtimeYears = parseFloat(runtime.replace(',', '.')) || 0
    
    if (financing <= 0 || interestRateDecimal <= 0) {
      return []
    }

    // Prüfe je nach Darlehensart
    if (loanType === 'Tilgung' && parseFormattedNumber(repaymentRateInput) <= 0) {
      return []
    } else if (loanType !== 'Tilgung' && repaymentRateDecimal <= 0) {
      return []
    }

    const monthlyInterestRate = interestRateDecimal / 12
    let remainingDebt = financing
    const data = []

    // Berechne für die ersten 12 Jahre (144 Monate)
    for (let month = 1; month <= 144 && remainingDebt > 0; month++) {
      const monthlyInterestAmount = remainingDebt * monthlyInterestRate
      let monthlyPrincipalAmount
      
      if (loanType === 'Tilgung') {
        // Bei Tilgungsdarlehen: Konstante monatliche Tilgung
        monthlyPrincipalAmount = Math.min(
          parseFormattedNumber(repaymentRateInput),
          remainingDebt
        )
      } else {
        // Bei Annuitätendarlehen: Tilgung basierend auf Prozentsatz
        monthlyPrincipalAmount = Math.min(
          (financing * repaymentRateDecimal) / 12,
          remainingDebt
        )
      }
      
      remainingDebt = Math.max(0, remainingDebt - monthlyPrincipalAmount)
      
      data.push({
        month: month,
        year: Math.ceil(month / 12),
        zinsen: Math.round(monthlyInterestAmount),
        tilgung: Math.round(monthlyPrincipalAmount),
        restschuld: Math.round(remainingDebt),
      })
    }

    return data
  }

  const formatNumber = (num: string) => {
    // Entferne alle ungültigen Zeichen außer Ziffern, Kommata und Punkte
    let cleaned = num.replace(/[^\d.,]/g, '')
    
    // Verhindere Komma oder Punkt am Anfang
    if (cleaned.startsWith(',') || cleaned.startsWith('.')) {
      cleaned = cleaned.substring(1)
    }
    
    // Wenn ein Komma vorhanden ist, keine automatische Formatierung
    if (cleaned.includes(',')) {
      return cleaned
    }
    
    // Automatische Tausender-Formatierung für reine Zahlen
    // Entferne alle Punkte und parse als Ganzzahl
    const digitsOnly = cleaned.replace(/\./g, '')
    if (digitsOnly.length > 0) {
      const numericValue = parseInt(digitsOnly) || 0
      if (!isNaN(numericValue)) {
        return new Intl.NumberFormat('de-DE').format(numericValue)
      }
    }
    
    return cleaned
  }

  const handlePurchasePriceChange = (value: string) => {
    setPurchasePrice(formatNumber(value))
  }

  const handleDownPaymentChange = (value: string) => {
    setDownPayment(formatNumber(value))
  }

  const handleSquareMetersChange = (value: string) => {
    const cleaned = value.replace(/[^\d,]/g, '')
    setSquareMeters(cleaned)
  }

  const handleNonApportionableChange = (value: string) => {
    setNonApportionable(formatNumber(value))
  }

  const handleApportionableChange = (value: string) => {
    setApportionable(formatNumber(value))
  }

  const handleManualRentPriceChange = (value: string) => {
    // Wenn der Wert leer ist oder nur Leerzeichen enthält, setze leeren String
    if (!value || value.trim() === '') {
      setManualRentPrice('')
    } else {
      setManualRentPrice(formatNumber(value))
    }
  }

  const handleRemainingDebtChange = (value: string) => {
    // Wenn der Wert leer ist oder nur Leerzeichen enthält, setze leeren String
    if (!value || value.trim() === '') {
      setRemainingDebtInput('')
    } else {
      setRemainingDebtInput(formatNumber(value))
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: (() => {
            // Cashflow berechnen für Hintergrundfarbe
            const rentPrice = manualRentPrice && manualRentPrice.trim() !== '' 
              ? parseFormattedNumber(manualRentPrice)
              : parseFormattedNumber(autoRentPrice)
            const nonApportionableValue = parseFormattedNumber(nonApportionable)
            const cashflow = rentPrice - monthlyAnnuity - nonApportionableValue
            
            if (showAnnuityOverview) {
              // Grüner Gradient bei positivem Cashflow
              if (cashflow >= 0) {
                return 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)'
              }
              // Rötlicher Gradient bei negativem Cashflow
              else {
                return 'linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%)'
              }
            }
            // Standard Gradient wenn keine Berechnung verfügbar
            return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          })(),
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Zurück zur Suche
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => navigate('/settings')}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Einstellungen
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                color: 'white', 
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Immobilien-Rechner
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Berechnen Sie Ihre Finanzierung und monatlichen Raten
            </Typography>
          </Box>

          <Stack spacing={4} alignItems="center">
            {/* Eingabeformular - zentriert */}
            <Box sx={{ width: '100%', maxWidth: 900 }}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Stack spacing={3}>
                    {/* Erste Zeile: Quadratmeter, Kaufpreis, Nicht umlagefähig, Umlagefähig */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Quadratmeter"
                        value={squareMeters}
                        onChange={(e) => handleSquareMetersChange(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Kaufpreis"
                        value={purchasePrice}
                        onChange={(e) => handlePurchasePriceChange(e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Euro /></InputAdornment>,
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Nicht umlagefähig"
                        value={nonApportionable}
                        onChange={(e) => handleNonApportionableChange(e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Euro /></InputAdornment>,
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Umlagefähig"
                        value={apportionable}
                        onChange={(e) => handleApportionableChange(e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Euro /></InputAdornment>,
                        }}
                      />
                    </Box>

                    {/* Zweite Zeile: Auto-Mietpreis, Manueller Mietpreis */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                      <Box sx={{ position: 'relative' }}>
                        <TextField
                          fullWidth
                          label="Auto-Mietpreis"
                          value={autoRentPrice}
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><Euro /></InputAdornment>,
                            readOnly: true,
                          }}
                        />
                        <FormControl 
                          size="small" 
                          sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8, 
                            minWidth: 100,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1,
                              height: 32,
                            }
                          }}
                        >
                          <Select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            displayEmpty
                            variant="outlined"
                            sx={{
                              fontSize: '0.75rem',
                              '& .MuiSelect-select': {
                                py: 0.5,
                                px: 1,
                              }
                            }}
                          >
                            <MenuItem value="Dresden">Dresden</MenuItem>
                            <MenuItem value="Leipzig">Leipzig</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <TextField
                        fullWidth
                        label="Manueller Mietpreis"
                        value={manualRentPrice}
                        onChange={(e) => handleManualRentPriceChange(e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Euro /></InputAdornment>,
                        }}
                      />
                    </Box>

                    {/* Dritte Zeile: Eigenkapital und Finanzierungsbetrag */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Eigenkapital"
                        value={downPayment}
                        onChange={(e) => handleDownPaymentChange(e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Euro /></InputAdornment>,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Finanzierungsbetrag"
                        value={financingAmount}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Euro /></InputAdornment>,
                          readOnly: true,
                        }}
                        sx={{
                          '& .MuiInputBase-input': {
                            color: 'text.secondary',
                          },
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                        }}
                      />
                    </Box>

                    {/* Vierte Zeile: Darlehensart, Zinssatz, Tilgungssatz, Annuität und Zinsbindung */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: loanType === 'Tilgung' ? 'repeat(5, 1fr)' : 'repeat(5, 1fr)' }, gap: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel>Darlehensart</InputLabel>
                        <Select
                          value={loanType}
                          onChange={(e) => setLoanType(e.target.value)}
                          label="Darlehensart"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            },
                            '& .MuiSelect-select': {
                              py: 2,
                              px: 2,
                              display: 'flex',
                              alignItems: 'center',
                            }
                          }}
                        >
                          <MenuItem value="Annuitätendarlehen">Annuität</MenuItem>
                          <MenuItem value="Tilgung">Tilgung</MenuItem>
                        </Select>
                      </FormControl>

                      <TextField
                        fullWidth
                        label={loanType === 'Tilgung' ? 'Zinssatz' : 'Anf. Zinssatz'}
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end"><Percent /></InputAdornment>,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                        }}
                      />

                      <TextField
                        fullWidth
                        label={loanType === 'Tilgung' ? 'Tilgung p.M.' : 'Anf. Tilgung'}
                        value={repaymentRateInput}
                        onChange={(e) => {
                          setRepaymentRateInput(e.target.value)
                          setLastEdited('repayment')
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Euro /></InputAdornment>,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                          '& .MuiInputBase-input[readonly]': {
                            backgroundColor: '#f0f0f0', // Leichter grauer Hintergrund für readonly
                            color: 'text.secondary',
                          },
                        }}
                      />

                      {loanType !== 'Tilgung' && (
                        <TextField
                          fullWidth
                          label="Annuität"
                          value={annuityInput}
                          onChange={(e) => {
                            setAnnuityInput(e.target.value)
                            setLastEdited('annuity')
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><Euro /></InputAdornment>,
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            },
                          }}
                        />
                      )}

                      <TextField
                        fullWidth
                        label="Zinsbindung"
                        placeholder="z.B. 10"
                        value={runtime}
                        onChange={(e) => {
                          setRuntime(e.target.value)
                          setLastEdited('runtime')
                        }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">Jahre</InputAdornment>,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                          '& .MuiInputBase-input[readonly]': {
                            backgroundColor: '#f0f0f0', // Leichter grauer Hintergrund für readonly
                            color: 'text.secondary',
                          },
                        }}
                      />

                      {loanType === 'Tilgung' && (
                        <TextField
                          fullWidth
                          label="Restschuld"
                          value={remainingDebtInput}
                          onChange={(e) => handleRemainingDebtChange(e.target.value)}
                          placeholder="Optional eingeben"
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><Euro /></InputAdornment>,
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            },
                          }}
                        />
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            {/* Annuitätsübersicht und Gesamtdaten - nebeneinander */}
            {showAnnuityOverview && (
              <Box sx={{ width: '100%', maxWidth: 1000, display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                {/* Monatliche Annuität */}
                <Box sx={{ flex: 1 }}>
                  <Card>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1, gap: 2 }}>
                        <Typography variant="h6">
                          Monatliche Annuität
                        </Typography>
                        <TextField
                          label="Monat"
                          type="number"
                          value={selectedMonth}
                          onChange={(e) => {
                            const maxMonths = (parseFormattedNumber(runtime) || 0) * 12
                            if (maxMonths === 0) {
                              setSelectedMonth('')
                              return
                            }
                            const value = e.target.value
                            const numericValue = parseInt(value, 10)

                            if (value === '') {
                              setSelectedMonth('')
                            } else if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= maxMonths) {
                              setSelectedMonth(value)
                            }
                            // Otherwise, do nothing, preventing the input from changing
                          }}
                          size="small"
                          sx={{ width: 100 }}
                          InputProps={{
                            inputProps: {
                              min: 1,
                              max: (parseFormattedNumber(runtime) || 0) * 12,
                            },
                          }}
                        />
                      </Box>

                      <Stack spacing={0.5}>
                        {/* Zinsen pro Monat */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Zinsen pro Monat:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {formatCurrency(specificMonthInterest)}
                          </Typography>
                        </Box>

                        {/* Tilgung p.M. */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Tilgung p.M.:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {formatCurrency(specificMonthPrincipal)}
                          </Typography>
                        </Box>

                        {/* Trennlinie */}
                        <Box sx={{ borderTop: 1, borderColor: 'divider', my: 0.5 }} />

                        {/* Gesamtannuität */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Gesamtannuität:
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {formatCurrency(
                              loanType === 'Tilgung'
                                ? specificMonthInterest + specificMonthPrincipal
                                : monthlyAnnuity
                            )}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                {/* Gesamtdaten */}
                <Box sx={{ flex: 1 }}>
                  <Card>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="h6" sx={{ textAlign: 'center', mb: 1 }}>
                        Gesamtdaten
                      </Typography>

                      <Stack spacing={0.5}>
                        {/* Mieteinnahmen */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Mieteinnahmen:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            + {(() => {
                              const rentPrice = manualRentPrice && manualRentPrice.trim() !== '' 
                                ? parseFormattedNumber(manualRentPrice)
                                : parseFormattedNumber(autoRentPrice)
                              return formatCurrency(rentPrice)
                            })()}
                          </Typography>
                        </Box>

                        {/* Annuität p.M. */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Annuität p.M.:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            - {formatCurrency(monthlyAnnuity)}
                          </Typography>
                        </Box>

                        {/* Nicht umlagefähig */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Nicht umlagefähig p.M.:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            - {(() => {
                              const nonApportionableValue = parseFormattedNumber(nonApportionable)
                              return formatCurrency(nonApportionableValue)
                            })()}
                          </Typography>
                        </Box>

                        {/* Trennlinie */}
                        <Box sx={{ borderTop: 1, borderColor: 'divider', my: 0.5 }} />

                        {/* Cashflow */}
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          backgroundColor: (() => {
                            const rentPrice = manualRentPrice && manualRentPrice.trim() !== '' 
                              ? parseFormattedNumber(manualRentPrice)
                              : parseFormattedNumber(autoRentPrice)
                            const nonApportionableValue = parseFormattedNumber(nonApportionable)
                            const cashflow = rentPrice - monthlyAnnuity - nonApportionableValue
                            return cashflow >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                          })(),
                          borderRadius: 1,
                          px: 1,
                          py: 0.5
                        }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Cashflow:
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: (() => {
                            const rentPrice = manualRentPrice && manualRentPrice.trim() !== '' 
                              ? parseFormattedNumber(manualRentPrice)
                              : parseFormattedNumber(autoRentPrice)
                            const nonApportionableValue = parseFormattedNumber(nonApportionable)
                            const cashflow = rentPrice - monthlyAnnuity - nonApportionableValue
                            return cashflow >= 0 ? '#22c55e' : '#ef4444'
                          })() }}>
                            {(() => {
                              const rentPrice = manualRentPrice && manualRentPrice.trim() !== '' 
                                ? parseFormattedNumber(manualRentPrice)
                                : parseFormattedNumber(autoRentPrice)
                              const nonApportionableValue = parseFormattedNumber(nonApportionable)
                              const cashflow = rentPrice - monthlyAnnuity - nonApportionableValue
                              return formatCurrency(cashflow)
                            })()}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            )}

            {/* Eigenkapitalrendite - drittes Kästchen */}
            {showAnnuityOverview && (
              <Box sx={{ width: '100%', maxWidth: 600 }}>
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ textAlign: 'center', mb: 1 }}>
                      Eigenkapitalrendite
                    </Typography>

                    <Stack spacing={0.5}>
                      {/* Cashflow p.A. */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Cashflow p.A.:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {(() => {
                            const rentPrice = manualRentPrice && manualRentPrice.trim() !== '' 
                              ? parseFormattedNumber(manualRentPrice)
                              : parseFormattedNumber(autoRentPrice)
                            const nonApportionableValue = parseFormattedNumber(nonApportionable)
                            const monthlyCashflow = rentPrice - monthlyAnnuity - nonApportionableValue
                            const annualCashflow = monthlyCashflow * 12
                            return formatCurrency(annualCashflow)
                          })()}
                        </Typography>
                      </Box>

                      {/* Laufzeit */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Laufzeit (Jahre):
                        </Typography>
                        <TextField
                          size="small"
                          value={runtime}
                          onChange={(e) => setRuntime(e.target.value)}
                          sx={{ 
                            width: 100,
                            '& .MuiOutlinedInput-root': {
                              height: 32,
                            },
                            '& .MuiOutlinedInput-input': {
                              textAlign: 'right',
                            }
                          }}
                        />
                      </Box>

                      {/* Cashflow gesamt */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Cashflow gesamt:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {(() => {
                            const rentPrice = manualRentPrice && manualRentPrice.trim() !== '' 
                              ? parseFormattedNumber(manualRentPrice)
                              : parseFormattedNumber(autoRentPrice)
                            const nonApportionableValue = parseFormattedNumber(nonApportionable)
                            const monthlyCashflow = rentPrice - monthlyAnnuity - nonApportionableValue
                            const annualCashflow = monthlyCashflow * 12
                            const runtimeYears = parseFloat(runtime.replace(',', '.')) || 0
                            const totalCashflow = annualCashflow * runtimeYears
                            return formatCurrency(totalCashflow)
                          })()}
                        </Typography>
                      </Box>

                      {/* Trennlinie */}
                      <Box sx={{ borderTop: 1, borderColor: 'divider', my: 1.5 }} />

                      {/* Verkaufspreis */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Verkaufspreis:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {(() => {
                            const price = parseFormattedNumber(purchasePrice)
                            return formatCurrency(price)
                          })()}
                        </Typography>
                      </Box>

                      {/* Restschuld */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Restschuld:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {(() => {
                            const financing = parseFormattedNumber(financingAmount) // C11
                            const interestRateDecimal = parseFloat(interestRate.replace('%', '').replace(',', '.')) / 100 // E11
                            const runtimeYears = parseFloat(runtime.replace(',', '.')) || 0 // G16
                            const monthlyRate = monthlyAnnuity // I11

                            if (financing > 0 && interestRateDecimal > 0 && runtimeYears > 0 && monthlyRate > 0) {
                              // Formel: RUNDEN(C11*(1+E11/12)^(12*G16) - I11 * (((1+E11/12)^(12*G16)-1) / (E11/12));0)
                              const monthlyInterestRate = interestRateDecimal / 12
                              const totalMonths = 12 * runtimeYears
                              const factor = Math.pow(1 + monthlyInterestRate, totalMonths)
                              
                              const remainingDebt = financing * factor - monthlyRate * ((factor - 1) / monthlyInterestRate)
                              
                              return formatCurrency(Math.round(remainingDebt))
                            }
                            return formatCurrency(0)
                          })()}
                        </Typography>
                      </Box>

                      {/* Nettoerlös nach Verkauf */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Nettoerlös nach Verkauf:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {(() => {
                            const salePrice = parseFormattedNumber(purchasePrice)
                            const financing = parseFormattedNumber(financingAmount)
                            const interestRateDecimal = parseFloat(interestRate.replace('%', '').replace(',', '.')) / 100
                            const runtimeYears = parseFloat(runtime.replace(',', '.')) || 0
                            const monthlyRate = monthlyAnnuity

                            if (financing > 0 && interestRateDecimal > 0 && runtimeYears > 0 && monthlyRate > 0) {
                              // Restschuld berechnen
                              const monthlyInterestRate = interestRateDecimal / 12
                              const totalMonths = 12 * runtimeYears
                              const factor = Math.pow(1 + monthlyInterestRate, totalMonths)
                              const remainingDebt = financing * factor - monthlyRate * ((factor - 1) / monthlyInterestRate)
                              
                              // Nettoerlös = Verkaufspreis - Restschuld
                              const netProceeds = salePrice - Math.round(remainingDebt)
                              
                              return formatCurrency(netProceeds)
                            }
                            return formatCurrency(salePrice)
                          })()}
                        </Typography>
                      </Box>

                      {/* Gesamtertrag */}
                      <Box sx={{ borderTop: 1, borderColor: 'divider', my: 0.5 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Gesamtertrag:
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: (() => {
                          const salePrice = parseFormattedNumber(purchasePrice)
                          const financing = parseFormattedNumber(financingAmount)
                          const interestRateDecimal = parseFloat(interestRate.replace('%', '').replace(',', '.')) / 100
                          const runtimeYears = parseFloat(runtime.replace(',', '.')) || 0
                          const monthlyRate = monthlyAnnuity

                          // Cashflow p.A. berechnen
                          const rentPrice = manualRentPrice && manualRentPrice.trim() !== '' 
                            ? parseFormattedNumber(manualRentPrice)
                            : parseFormattedNumber(autoRentPrice)
                          const nonApportionableValue = parseFormattedNumber(nonApportionable)
                          const monthlyCashflow = rentPrice - monthlyAnnuity - nonApportionableValue
                          const annualCashflow = monthlyCashflow * 12

                          let totalReturn = 0
                          if (financing > 0 && interestRateDecimal > 0 && runtimeYears > 0 && monthlyRate > 0) {
                            const monthlyInterestRate = interestRateDecimal / 12
                            const totalMonths = 12 * runtimeYears
                            const factor = Math.pow(1 + monthlyInterestRate, totalMonths)
                            const remainingDebt = financing * factor - monthlyRate * ((factor - 1) / monthlyInterestRate)
                            const netProceeds = salePrice - Math.round(remainingDebt)
                            totalReturn = netProceeds + (annualCashflow * runtimeYears)
                          } else {
                            totalReturn = salePrice + (annualCashflow * runtimeYears)
                          }

                          return totalReturn < 0 ? '#ef4444' : '#22c55e'
                        })() }}>
                          {(() => {
                            const salePrice = parseFormattedNumber(purchasePrice)
                            const financing = parseFormattedNumber(financingAmount)
                            const interestRateDecimal = parseFloat(interestRate.replace('%', '').replace(',', '.')) / 100
                            const runtimeYears = parseFloat(runtime.replace(',', '.')) || 0
                            const monthlyRate = monthlyAnnuity

                            // Cashflow p.A. berechnen
                            const rentPrice = manualRentPrice && manualRentPrice.trim() !== '' 
                              ? parseFormattedNumber(manualRentPrice)
                              : parseFormattedNumber(autoRentPrice)
                            const nonApportionableValue = parseFormattedNumber(nonApportionable)
                            const monthlyCashflow = rentPrice - monthlyAnnuity - nonApportionableValue
                            const annualCashflow = monthlyCashflow * 12

                            if (financing > 0 && interestRateDecimal > 0 && runtimeYears > 0 && monthlyRate > 0) {
                              // Restschuld berechnen
                              const monthlyInterestRate = interestRateDecimal / 12
                              const totalMonths = 12 * runtimeYears
                              const factor = Math.pow(1 + monthlyInterestRate, totalMonths)
                              const remainingDebt = financing * factor - monthlyRate * ((factor - 1) / monthlyInterestRate)
                              const netProceeds = salePrice - Math.round(remainingDebt)
                              
                              // Gesamtertrag = Nettoerlös + (Cashflow p.a. * Laufzeit)
                              const totalReturn = netProceeds + (annualCashflow * runtimeYears)
                              
                              return formatCurrency(totalReturn)
                            }
                            return formatCurrency(salePrice + (annualCashflow * runtimeYears))
                          })()}
                        </Typography>
                      </Box>

                      {/* CAGR */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          CAGR:
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: (() => {
                          const salePrice = parseFormattedNumber(purchasePrice)
                          const financing = parseFormattedNumber(financingAmount)
                          const interestRateDecimal = parseFloat(interestRate.replace('%', '').replace(',', '.')) / 100
                          const runtimeYears = parseFloat(runtime.replace(',', '.')) || 0
                          const monthlyRate = monthlyAnnuity
                          const eigenkapital = parseFormattedNumber(downPayment)

                          const rentPrice = manualRentPrice && manualRentPrice.trim() !== '' 
                            ? parseFormattedNumber(manualRentPrice)
                            : parseFormattedNumber(autoRentPrice)
                          const nonApportionableValue = parseFormattedNumber(nonApportionable)
                          const monthlyCashflow = rentPrice - monthlyAnnuity - nonApportionableValue
                          const annualCashflow = monthlyCashflow * 12

                          let totalReturn = 0
                          if (financing > 0 && interestRateDecimal > 0 && runtimeYears > 0 && monthlyRate > 0) {
                            const monthlyInterestRate = interestRateDecimal / 12
                            const totalMonths = 12 * runtimeYears
                            const factor = Math.pow(1 + monthlyInterestRate, totalMonths)
                            const remainingDebt = financing * factor - monthlyRate * ((factor - 1) / monthlyInterestRate)
                            const netProceeds = salePrice - Math.round(remainingDebt)
                            totalReturn = netProceeds + (annualCashflow * runtimeYears)
                          } else {
                            totalReturn = salePrice + (annualCashflow * runtimeYears)
                          }

                          if (totalReturn < 0) return '#ef4444'

                          // CAGR berechnen für Farbbestimmung
                          if (financing > 0 && interestRateDecimal > 0 && runtimeYears > 0 && monthlyRate > 0 && eigenkapital > 0) {
                            const monthlyInterestRate = interestRateDecimal / 12
                            const totalMonths = 12 * runtimeYears
                            const factor = Math.pow(1 + monthlyInterestRate, totalMonths)
                            const remainingDebt = financing * factor - monthlyRate * ((factor - 1) / monthlyInterestRate)
                            const netProceeds = salePrice - Math.round(remainingDebt)
                            const totalCashflows = annualCashflow * runtimeYears
                            const calculatedTotalReturn = totalCashflows + netProceeds
                            const cagr = Math.pow(calculatedTotalReturn / eigenkapital, 1 / runtimeYears) - 1
                            return cagr < 0 ? '#ef4444' : '#22c55e'
                          }

                          return '#22c55e'
                        })() }}>
                          {(() => {
                            const salePrice = parseFormattedNumber(purchasePrice)
                            const financing = parseFormattedNumber(financingAmount)
                            const interestRateDecimal = parseFloat(interestRate.replace('%', '').replace(',', '.')) / 100
                            const runtimeYears = parseFloat(runtime.replace(',', '.')) || 0
                            const monthlyRate = monthlyAnnuity
                            const eigenkapital = parseFormattedNumber(downPayment) // B11 - Eigenanteil

                            // Cashflow p.A. berechnen (G15)
                            const rentPrice = manualRentPrice && manualRentPrice.trim() !== '' 
                              ? parseFormattedNumber(manualRentPrice)
                              : parseFormattedNumber(autoRentPrice)
                            const nonApportionableValue = parseFormattedNumber(nonApportionable)
                            const monthlyCashflow = rentPrice - monthlyAnnuity - nonApportionableValue
                            const annualCashflow = monthlyCashflow * 12 // G15

                            if (financing > 0 && interestRateDecimal > 0 && runtimeYears > 0 && monthlyRate > 0 && eigenkapital > 0) {
                              // Prüfe Gesamtertrag
                              const monthlyInterestRate = interestRateDecimal / 12
                              const totalMonths = 12 * runtimeYears
                              const factor = Math.pow(1 + monthlyInterestRate, totalMonths)
                              const remainingDebt = financing * factor - monthlyRate * ((factor - 1) / monthlyInterestRate)
                              const netProceeds = salePrice - Math.round(remainingDebt)
                              const totalCashflows = annualCashflow * runtimeYears
                              const totalReturn = totalCashflows + netProceeds

                              if (totalReturn < 0) {
                                return '-'
                              }

                              // CAGR = POTENZ( (G15*G16 + G19) / B11 ; 1 / G16 ) - 1
                              const cagr = Math.pow(totalReturn / eigenkapital, 1 / runtimeYears) - 1
                              
                              return (cagr * 100).toFixed(2) + '%'
                            }
                            return '0,00%'
                          })()}
                        </Typography>
                      </Box>

                      {/* IRR/IKV - Effektive Rendite */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Effektive Rendite (IRR):
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: (() => {
                          const salePrice = parseFormattedNumber(purchasePrice)
                          const financing = parseFormattedNumber(financingAmount)
                          const interestRateDecimal = parseFloat(interestRate.replace('%', '').replace(',', '.')) / 100
                          const runtimeYears = parseFloat(runtime.replace(',', '.')) || 0
                          const monthlyRate = monthlyAnnuity
                          const eigenkapital = parseFormattedNumber(downPayment)

                          const rentPrice = manualRentPrice && manualRentPrice.trim() !== '' 
                            ? parseFormattedNumber(manualRentPrice)
                            : parseFormattedNumber(autoRentPrice)
                          const nonApportionableValue = parseFormattedNumber(nonApportionable)
                          const monthlyCashflow = rentPrice - monthlyAnnuity - nonApportionableValue
                          const annualCashflow = monthlyCashflow * 12

                          let totalReturn = 0
                          if (financing > 0 && interestRateDecimal > 0 && runtimeYears > 0 && monthlyRate > 0) {
                            const monthlyInterestRate = interestRateDecimal / 12
                            const totalMonths = 12 * runtimeYears
                            const factor = Math.pow(1 + monthlyInterestRate, totalMonths)
                            const remainingDebt = financing * factor - monthlyRate * ((factor - 1) / monthlyInterestRate)
                            const netProceeds = salePrice - Math.round(remainingDebt)
                            totalReturn = netProceeds + (annualCashflow * runtimeYears)
                          } else {
                            totalReturn = salePrice + (annualCashflow * runtimeYears)
                          }

                          if (totalReturn < 0) return '#ef4444'

                          // IRR berechnen für Farbbestimmung
                          if (financing > 0 && interestRateDecimal > 0 && runtimeYears > 0 && monthlyRate > 0 && eigenkapital > 0) {
                            const monthlyInterestRate = interestRateDecimal / 12
                            const totalMonths = 12 * runtimeYears
                            const factor = Math.pow(1 + monthlyInterestRate, totalMonths)
                            const remainingDebt = financing * factor - monthlyRate * ((factor - 1) / monthlyInterestRate)
                            const netProceeds = salePrice - Math.round(remainingDebt)

                            // IRR Berechnung über Newton-Raphson Verfahren
                            const calculateIRR = (cashflows: number[], guess = 0.1) => {
                              const maxIterations = 100
                              const tolerance = 1e-6
                              
                              for (let i = 0; i < maxIterations; i++) {
                                let npv = 0
                                let dnpv = 0
                                
                                for (let t = 0; t < cashflows.length; t++) {
                                  const factor = Math.pow(1 + guess, t)
                                  npv += cashflows[t] / factor
                                  if (t > 0) {
                                    dnpv -= t * cashflows[t] / Math.pow(1 + guess, t + 1)
                                  }
                                }
                                
                                if (Math.abs(npv) < tolerance) return guess
                                
                                const newGuess = guess - npv / dnpv
                                if (Math.abs(newGuess - guess) < tolerance) return newGuess
                                
                                guess = newGuess
                              }
                              
                              return guess
                            }
                            
                            // Cashflow Array erstellen
                            const cashflows = [-eigenkapital] // Jahr 0: Investition
                            for (let year = 1; year < runtimeYears; year++) {
                              cashflows.push(annualCashflow) // Jahre 1 bis n-1: jährlicher Cashflow
                            }
                            cashflows.push(annualCashflow + netProceeds) // Jahr n: Cashflow + Verkaufserlös
                            
                            const irr = calculateIRR(cashflows)
                            return irr < 0 ? '#ef4444' : '#22c55e'
                          }

                          return '#22c55e'
                        })() }}>
                          {(() => {
                            const salePrice = parseFormattedNumber(purchasePrice)
                            const financing = parseFormattedNumber(financingAmount)
                            const interestRateDecimal = parseFloat(interestRate.replace('%', '').replace(',', '.')) / 100
                            const runtimeYears = parseFloat(runtime.replace(',', '.')) || 0
                            const monthlyRate = monthlyAnnuity
                            const eigenkapital = parseFormattedNumber(downPayment)

                            // Cashflow p.A. berechnen
                            const rentPrice = manualRentPrice && manualRentPrice.trim() !== '' 
                              ? parseFormattedNumber(manualRentPrice)
                              : parseFormattedNumber(autoRentPrice)
                            const nonApportionableValue = parseFormattedNumber(nonApportionable)
                            const monthlyCashflow = rentPrice - monthlyAnnuity - nonApportionableValue
                            const annualCashflow = monthlyCashflow * 12 // G15

                            if (financing > 0 && interestRateDecimal > 0 && runtimeYears > 0 && monthlyRate > 0 && eigenkapital > 0) {
                              // Prüfe Gesamtertrag
                              const monthlyInterestRate = interestRateDecimal / 12
                              const totalMonths = 12 * runtimeYears
                              const factor = Math.pow(1 + monthlyInterestRate, totalMonths)
                              const remainingDebt = financing * factor - monthlyRate * ((factor - 1) / monthlyInterestRate)
                              const netProceeds = salePrice - Math.round(remainingDebt)
                              const totalCashflows = annualCashflow * runtimeYears
                              const totalReturn = totalCashflows + netProceeds

                              if (totalReturn < 0) {
                                return '-'
                              }
                              
                              // IRR Berechnung über Newton-Raphson Verfahren
                              // Cashflows: Jahr 0: -Eigenkapital, Jahre 1-n: annualCashflow, Jahr n: annualCashflow + netProceeds
                              const calculateIRR = (cashflows: number[], guess = 0.1) => {
                                const maxIterations = 100
                                const tolerance = 1e-6
                                
                                for (let i = 0; i < maxIterations; i++) {
                                  let npv = 0
                                  let dnpv = 0
                                  
                                  for (let t = 0; t < cashflows.length; t++) {
                                    const factor = Math.pow(1 + guess, t)
                                    npv += cashflows[t] / factor
                                    if (t > 0) {
                                      dnpv -= t * cashflows[t] / Math.pow(1 + guess, t + 1)
                                    }
                                  }
                                  
                                  if (Math.abs(npv) < tolerance) return guess
                                  
                                  const newGuess = guess - npv / dnpv
                                  if (Math.abs(newGuess - guess) < tolerance) return newGuess
                                  
                                  guess = newGuess
                                }
                                
                                return guess
                              }
                              
                              // Cashflow Array erstellen
                              const cashflows = [-eigenkapital] // Jahr 0: Investition
                              for (let year = 1; year < runtimeYears; year++) {
                                cashflows.push(annualCashflow) // Jahre 1 bis n-1: jährlicher Cashflow
                              }
                              cashflows.push(annualCashflow + netProceeds) // Jahr n: Cashflow + Verkaufserlös
                              
                              const irr = calculateIRR(cashflows)
                              
                              return (irr * 100).toFixed(2) + '%'
                            }
                            return '0,00%'
                          })()}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default Rechner