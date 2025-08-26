import { useState } from 'react'
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
  CircularProgress,
  Alert,
  Chip
} from '@mui/material'
import {
  Search,
  Euro,
  SquareFoot,
  LocationOn
} from '@mui/icons-material'
import './App.css'

// Types
interface Listing {
  price: string
  qm: string
  location: string
}

interface ApiResponse {
  listings: Listing[]
  count: number
}

// Material-UI Theme
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

function App() {
  const [price, setPrice] = useState('')
  const [area, setArea] = useState('')
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchPerformed, setSearchPerformed] = useState(false)

  const searchListings = async () => {
    if (!price) {
      setError('Bitte geben Sie einen maximalen Preis ein')
      return
    }

    setLoading(true)
    setError('')
    setSearchPerformed(true)

    try {
      const maxPrice = parseInt(price.replace(/[.,]/g, ''))
      const response = await fetch(`/api/dresden-listings?max_price=${maxPrice}`)
      
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Daten')
      }

      const data: ApiResponse = await response.json()
      console.log('API Response:', data)
      
      // Filter out listings with price per sqm <= 5€
      const filteredListings = data.listings.filter(listing => {
        const price = parseInt(listing.price.replace(/[€.,\s]/g, ''))
        const qm = parseFloat(listing.qm.replace(',', '.'))
        const pricePerSqm = price / qm
        return pricePerSqm > 5
      })
      
      setListings(filteredListings)
    } catch (err) {
      setError('Fehler beim Laden der Immobilien. Bitte versuchen Sie es später erneut.')
      console.error('API Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box textAlign="center" mb={6}>
            <Typography
              variant="h2"
              component="h1"
              color="white"
              gutterBottom
              sx={{
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                mb: 2,
              }}
            >
              ImmoFind
            </Typography>
            <Typography
              variant="h6"
              color="white"
              sx={{
                maxWidth: 600,
                mx: 'auto',
                opacity: 0.9,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              }}
            >
              Finden Sie Ihre perfekte Immobilie mit unseren intelligenten Suchfiltern
            </Typography>
          </Box>

          {/* Search Form */}
          <Box maxWidth="md" mx="auto" mb={6}>
            <Card elevation={4}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h4"
                  component="h2"
                  textAlign="center"
                  color="primary"
                  gutterBottom
                  sx={{ mb: 4 }}
                >
                  Suchkriterien eingeben
                </Typography>

                <Stack spacing={3}>
                  {/* Input Fields Row */}
                  <Stack 
                    direction={{ xs: 'column', md: 'row' }} 
                    spacing={3}
                  >
                    {/* Price Input */}
                    <TextField
                      fullWidth
                      label="Maximaler Preis"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="z.B. 500000"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Euro color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      variant="outlined"
                    />

                    {/* Area Input */}
                    <TextField
                      fullWidth
                      label="Mindest-Quadratmeter"
                      type="number"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="z.B. 80"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SquareFoot color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            m²
                          </InputAdornment>
                        ),
                      }}
                      variant="outlined"
                    />
                  </Stack>

                  {/* Search Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                    onClick={searchListings}
                    disabled={loading}
                    sx={{
                      py: 2,
                      background: 'linear-gradient(45deg, #2563eb 30%, #7c3aed 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1d4ed8 30%, #6d28d9 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
                      },
                      '&:disabled': {
                        background: 'rgba(0, 0, 0, 0.12)',
                      },
                    }}
                  >
                    {loading ? 'Suche läuft...' : 'Immobilien suchen'}
                  </Button>

                  {/* Error Message */}
                  {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Results Section */}
            {searchPerformed && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h3" gutterBottom color="white" sx={{ mb: 3 }}>
                  {listings.length > 0 ? `${listings.length} Immobilien gefunden` : 'Keine Immobilien gefunden'}
                </Typography>

                {listings.length > 0 && (
                  <Box 
                    sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { 
                        xs: '1fr', 
                        sm: 'repeat(2, 1fr)', 
                        md: 'repeat(3, 1fr)' 
                      }, 
                      gap: 3 
                    }}
                  >
                    {listings.map((listing, index) => (
                      <Card 
                        key={index}
                        elevation={3}
                        sx={{
                          height: '100%',
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                          },
                        }}
                      >
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="h6" component="h4" color="primary" gutterBottom>
                                {listing.price}
                              </Typography>
                            </Box>

                            <Stack spacing={2}>
                              <Box display="flex" alignItems="center">
                                <SquareFoot sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {listing.qm} m²
                                </Typography>
                              </Box>

                              <Box display="flex" alignItems="flex-start">
                                <LocationOn sx={{ mr: 1, color: 'text.secondary', fontSize: 20, mt: 0.2 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {listing.location}
                                </Typography>
                              </Box>

                              {/* Price per m² calculation */}
                              {listing.qm && listing.price && (
                                <Chip
                                  label={`${Math.round(
                                    parseInt(listing.price.replace(/[€.,\s]/g, '')) / 
                                    parseFloat(listing.qm.replace(',', '.'))
                                  ).toLocaleString('de-DE')} €/m²`}
                                  size="small"
                                  color="secondary"
                                  variant="outlined"
                                />
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
