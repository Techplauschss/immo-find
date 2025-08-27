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
} from '@mui/material'
import {
  Euro,
  Home,
  Calculate,
  ArrowBack,
  AccountBalance,
  Percent,
  TrendingUp,
} from '@mui/icons-material'

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

interface CalculationResults {
  monthlyPayment: number
  totalInterest: number
  totalAmount: number
  monthlyBreakdown: {
    month: number
    payment: number
    interest: number
    principal: number
    remainingBalance: number
  }[]
}

function Rechner() {
  const navigate = useNavigate()
  
  // Eingabefelder
  const [purchasePrice, setPurchasePrice] = useState('')
  const [squareMeters, setSquareMeters] = useState('')
  const [nonApportionable, setNonApportionable] = useState('')
  const [apportionable, setApportionable] = useState('')
  const [downPayment, setDownPayment] = useState('')
  const [autoRentPrice, setAutoRentPrice] = useState('')
  const [manualRentPrice, setManualRentPrice] = useState('')
  const [selectedCity, setSelectedCity] = useState('Dresden')
  const [interestRate, setInterestRate] = useState('3.5')
  const [repaymentRateInput, setRepaymentRateInput] = useState('2.0')
  const [loanTerm] = useState('30')
  
  // Berechnete Werte für die dritte Zeile
  const [financingAmount, setFinancingAmount] = useState('')
  
  // Ergebnisse
  const [results, setResults] = useState<CalculationResults | null>(null)

  // Automatische Berechnung des Auto-Mietpreises basierend auf Stadt und QM
  useEffect(() => {
    // Nur automatisch berechnen, wenn kein manueller Preis eingegeben wurde
    const hasManualPrice = manualRentPrice && manualRentPrice.trim() !== '' && manualRentPrice !== '0'
    
    if (!hasManualPrice) {
      const qm = parseFloat(squareMeters.replace(',', '.')) || 0
      if (qm > 0) {
        const pricePerSqm = selectedCity === 'Dresden' ? 9.5 : 9.8
        const calculatedPrice = qm * pricePerSqm
        setAutoRentPrice(formatCurrency(calculatedPrice))
      } else {
        setAutoRentPrice('')
      }
    } else {
      // Wenn manueller Preis eingegeben wurde, Auto-Mietpreis leeren
      setAutoRentPrice('')
    }
  }, [squareMeters, selectedCity, manualRentPrice])

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
    
    console.log('Debug - Kaufpreis:', purchasePrice, '→', price)
    console.log('Debug - Eigenkapital:', downPayment, '→', down)
    
    if (price > 0) {
      // Finanzierungsbetrag berechnen
      const financing = Math.max(0, price - down)
      console.log('Debug - Finanzierungsbetrag:', financing)
      setFinancingAmount(formatCurrency(financing))
    } else {
      setFinancingAmount('')
    }
  }, [purchasePrice, downPayment])

  const calculateMortgage = () => {
    // Verwende die gleiche Parsing-Logik wie im useEffect
    const parseFormattedNumber = (value: string) => {
      if (!value) return 0
      const cleaned = value.replace(/[^\d,.]/g, '')
      const normalized = cleaned.replace(/\./g, '').replace(',', '.')
      return parseFloat(normalized) || 0
    }
    
    const price = parseFormattedNumber(purchasePrice)
    const down = parseFormattedNumber(downPayment)
    const rate = parseFloat(interestRate) / 100 / 12
    const term = parseFloat(loanTerm) * 12
    
    if (!price || price <= 0) return
    
    const loanAmount = price - down
    
    if (loanAmount <= 0) return
    
    // Monatliche Rate berechnen
    const monthlyPayment = loanAmount * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1)
    
    // Tilgungsplan erstellen
    let remainingBalance = loanAmount
    const monthlyBreakdown = []
    let totalInterest = 0
    
    for (let month = 1; month <= term && remainingBalance > 0; month++) {
      const interestPayment = remainingBalance * rate
      const principalPayment = monthlyPayment - interestPayment
      
      totalInterest += interestPayment
      remainingBalance -= principalPayment
      
      if (remainingBalance < 0) remainingBalance = 0
      
      monthlyBreakdown.push({
        month,
        payment: monthlyPayment,
        interest: interestPayment,
        principal: principalPayment,
        remainingBalance
      })
    }
    
    setResults({
      monthlyPayment,
      totalInterest,
      totalAmount: loanAmount + totalInterest,
      monthlyBreakdown: monthlyBreakdown.slice(0, 12) // Nur erste 12 Monate anzeigen
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: string) => {
    const cleaned = num.replace(/[^\d]/g, '')
    return new Intl.NumberFormat('de-DE').format(parseInt(cleaned) || 0)
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
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
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                    <Calculate sx={{ mr: 2, color: 'primary.main' }} />
                    Eingaben
                  </Typography>

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

                    {/* Dritte Zeile: Editierbare Berechnungsfelder */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
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

                      <TextField
                        fullWidth
                        label="Zinssatz"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end"><Percent /></InputAdornment>,
                        }}
                        type="number"
                        inputProps={{ step: "0.1", min: "0" }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Tilgungssatz"
                        value={repaymentRateInput}
                        onChange={(e) => setRepaymentRateInput(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end"><Percent /></InputAdornment>,
                        }}
                        type="number"
                        inputProps={{ step: "0.1", min: "0" }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                        }}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default Rechner