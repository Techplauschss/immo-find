import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  InputAdornment,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import {
  ArrowBack,
  Euro,
  Save,
  RestoreRounded
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
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
})

function SettingsPanel() {
  const navigate = useNavigate()
  const { settings, updateCitySetting, updateLoanDefault } = useCitySettings()
  
  const [dresdenRent, setDresdenRent] = useState(settings.Dresden.rentPerSqm.toString().replace('.', ','))
  const [leipzigRent, setLeipzigRent] = useState(settings.Leipzig.rentPerSqm.toString().replace('.', ','))
  const [senftenbergRent, setSenftenbergRent] = useState(settings.Senftenberg.rentPerSqm.toString().replace('.', ','))
  const [interestRate, setInterestRate] = useState(settings.loanDefaults.interestRate.toString().replace('.', ','))
  const [repaymentRate, setRepaymentRate] = useState(settings.loanDefaults.repaymentRate.toString().replace('.', ','))
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const formatNumber = (value: string) => {
    // Erlaube nur Zahlen und Komma
    const cleaned = value.replace(/[^\d,]/g, '')
    return cleaned
  }

  const parseGermanNumber = (value: string): number => {
    return parseFloat(value.replace(',', '.')) || 0
  }

  const handleDresdenChange = (value: string) => {
    setDresdenRent(formatNumber(value))
  }

  const handleLeipzigChange = (value: string) => {
    setLeipzigRent(formatNumber(value))
  }

  const handleSenftenbergChange = (value: string) => {
    setSenftenbergRent(formatNumber(value))
  }

  const handleInterestRateChange = (value: string) => {
    setInterestRate(formatNumber(value))
  }

  const handleRepaymentRateChange = (value: string) => {
    setRepaymentRate(formatNumber(value))
  }

  const handleSave = () => {
    const dresdenValue = parseGermanNumber(dresdenRent)
    const leipzigValue = parseGermanNumber(leipzigRent)
    const senftenbergValue = parseGermanNumber(senftenbergRent)
    const interestRateValue = parseGermanNumber(interestRate)
    const repaymentRateValue = parseGermanNumber(repaymentRate)

    if (dresdenValue > 0 && leipzigValue > 0 && senftenbergValue > 0 && interestRateValue > 0 && repaymentRateValue > 0) {
      updateCitySetting('Dresden', dresdenValue)
      updateCitySetting('Leipzig', leipzigValue)
      updateCitySetting('Senftenberg', senftenbergValue)
      updateLoanDefault('interestRate', interestRateValue)
      updateLoanDefault('repaymentRate', repaymentRateValue)
      setShowSuccessMessage(true)
      
      // Nach kurzer Verzögerung zur Hauptseite zurückkehren
      setTimeout(() => {
        navigate('/')
      }, 1500)
    }
  }

  const handleReset = () => {
    setDresdenRent('9,5')
    setLeipzigRent('9,8')
    setSenftenbergRent('6,5')
    setInterestRate('2,0')
    setRepaymentRate('2,0')
    updateCitySetting('Dresden', 9.5)
    updateCitySetting('Leipzig', 9.8)
    updateCitySetting('Senftenberg', 6.5)
    updateLoanDefault('interestRate', 2.0)
    updateLoanDefault('repaymentRate', 2.0)
    // Keine automatische Weiterleitung beim Zurücksetzen
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
              Stadt-Einstellungen
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Verwalten Sie die Mietpreise pro Quadratmeter für verschiedene Städte
            </Typography>
          </Box>

          <Stack spacing={4} alignItems="center">
            {/* Einstellungen Card mit Tabelle */}
            <Box sx={{ width: '100%', maxWidth: 800 }}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
                    Stadt-Einstellungen & Darlehens-Standards
                  </Typography>
                  
                  {/* Mietpreise Tabelle */}
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                    Mietpreise pro m² (monatlich)
                  </Typography>
                  <TableContainer component={Paper} sx={{ mb: 4, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Stadt</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Aktueller Mietpreis</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Neuer Mietpreis</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontSize: '1rem', fontWeight: 500 }}>
                            Dresden
                          </TableCell>
                          <TableCell sx={{ fontSize: '1rem', color: 'text.secondary' }}>
                            {settings.Dresden.rentPerSqm.toString().replace('.', ',')} €/m²
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={dresdenRent}
                              onChange={(e) => handleDresdenChange(e.target.value)}
                              InputProps={{
                                startAdornment: <InputAdornment position="start"><Euro /></InputAdornment>,
                                endAdornment: <InputAdornment position="end">/m²</InputAdornment>,
                              }}
                              sx={{ width: 150 }}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontSize: '1rem', fontWeight: 500 }}>
                            Leipzig
                          </TableCell>
                          <TableCell sx={{ fontSize: '1rem', color: 'text.secondary' }}>
                            {settings.Leipzig.rentPerSqm.toString().replace('.', ',')} €/m²
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={leipzigRent}
                              onChange={(e) => handleLeipzigChange(e.target.value)}
                              InputProps={{
                                startAdornment: <InputAdornment position="start"><Euro /></InputAdornment>,
                                endAdornment: <InputAdornment position="end">/m²</InputAdornment>,
                              }}
                              sx={{ width: 150 }}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontSize: '1rem', fontWeight: 500 }}>
                            Senftenberg
                          </TableCell>
                          <TableCell sx={{ fontSize: '1rem', color: 'text.secondary' }}>
                            {settings.Senftenberg.rentPerSqm.toString().replace('.', ',')} €/m²
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={senftenbergRent}
                              onChange={(e) => handleSenftenbergChange(e.target.value)}
                              InputProps={{
                                startAdornment: <InputAdornment position="start"><Euro /></InputAdornment>,
                                endAdornment: <InputAdornment position="end">/m²</InputAdornment>,
                              }}
                              sx={{ width: 150 }}
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Darlehens-Standards Tabelle */}
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                    Standard-Werte für Annuitätendarlehen
                  </Typography>
                  <TableContainer component={Paper} sx={{ mb: 3, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Parameter</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Aktueller Wert</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Neuer Wert</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontSize: '1rem', fontWeight: 500 }}>
                            Zinssatz
                          </TableCell>
                          <TableCell sx={{ fontSize: '1rem', color: 'text.secondary' }}>
                            {settings.loanDefaults.interestRate.toString().replace('.', ',')} %
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={interestRate}
                              onChange={(e) => handleInterestRateChange(e.target.value)}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                              }}
                              sx={{ width: 120 }}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontSize: '1rem', fontWeight: 500 }}>
                            Tilgungssatz
                          </TableCell>
                          <TableCell sx={{ fontSize: '1rem', color: 'text.secondary' }}>
                            {settings.loanDefaults.repaymentRate.toString().replace('.', ',')} %
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={repaymentRate}
                              onChange={(e) => handleRepaymentRateChange(e.target.value)}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                              }}
                              sx={{ width: 120 }}
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                      sx={{ minWidth: 120 }}
                    >
                      Speichern
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<RestoreRounded />}
                      onClick={handleReset}
                      sx={{ minWidth: 120 }}
                    >
                      Zurücksetzen
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={1500}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSuccessMessage(false)} severity="success">
          Einstellungen gespeichert! Zurück zur Übersicht...
        </Alert>
      </Snackbar>
    </ThemeProvider>
  )
}

export default SettingsPanel
