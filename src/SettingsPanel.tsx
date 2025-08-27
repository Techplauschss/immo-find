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
  const { settings, updateCitySetting } = useCitySettings()
  
  const [dresdenRent, setDresdenRent] = useState(settings.Dresden.rentPerSqm.toString().replace('.', ','))
  const [leipzigRent, setLeipzigRent] = useState(settings.Leipzig.rentPerSqm.toString().replace('.', ','))
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

  const handleSave = () => {
    const dresdenValue = parseGermanNumber(dresdenRent)
    const leipzigValue = parseGermanNumber(leipzigRent)

    if (dresdenValue > 0 && leipzigValue > 0) {
      updateCitySetting('Dresden', dresdenValue)
      updateCitySetting('Leipzig', leipzigValue)
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
    updateCitySetting('Dresden', 9.5)
    updateCitySetting('Leipzig', 9.8)
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
                    Mietpreise pro m² (monatlich)
                  </Typography>
                  
                  <TableContainer component={Paper} sx={{ mb: 3, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
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

            {/* Info Card */}
            <Box sx={{ width: '100%', maxWidth: 800 }}>
              <Card sx={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    💡 Hinweise
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      • Änderungen werden automatisch in allen Cashflow-Berechnungen berücksichtigt
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Nach dem Speichern werden Sie automatisch zur Immo-Übersicht zurückgeleitet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Die Werte werden lokal in Ihrem Browser gespeichert
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Verwenden Sie ein Komma als Dezimaltrennzeichen (z.B. 9,5)
                    </Typography>
                  </Stack>
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
