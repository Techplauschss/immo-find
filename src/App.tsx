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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
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
  link: string
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
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minArea, setMinArea] = useState('')
  const [maxArea, setMaxArea] = useState('')
  const [minPricePerSqm, setMinPricePerSqm] = useState('')
  const [maxPricePerSqm, setMaxPricePerSqm] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [radius, setRadius] = useState('')
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [sortBy, setSortBy] = useState('')

  const sortListings = (listingsToSort: Listing[]) => {
    if (!sortBy) return listingsToSort

    return [...listingsToSort].sort((a, b) => {
      const priceA = parseInt(a.price.replace(/[€.,\s]/g, ''))
      const priceB = parseInt(b.price.replace(/[€.,\s]/g, ''))
      const qmA = parseFloat(a.qm.replace(',', '.'))
      const qmB = parseFloat(b.qm.replace(',', '.'))
      
      switch (sortBy) {
        case 'price-asc':
          return priceA - priceB
        case 'price-desc':
          return priceB - priceA
        case 'price-per-sqm-asc':
          return (priceA / qmA) - (priceB / qmB)
        case 'price-per-sqm-desc':
          return (priceB / qmB) - (priceA / qmA)
        case 'area-asc':
          return qmA - qmB
        case 'area-desc':
          return qmB - qmA
        default:
          return 0
      }
    })
  }

    const searchListings = async () => {
    if (!zipCode) {
      setError('Bitte geben Sie eine Postleitzahl ein')
      return
    }

    setLoading(true)
    setError('')
    setSearchPerformed(true)

    try {
      // Build URL with optional parameters
      let url = '/api/listings?'
      const params = []
      
      // Required parameters
      params.push(`zip_code=${zipCode}`)
      
      if (radius && radius.trim() !== '') {
        const radiusValue = parseInt(radius.replace(/[.,]/g, ''))
        params.push(`radius=${radiusValue}`)
      }
      
      if (maxPrice && maxPrice.trim() !== '') {
        const maxPriceValue = parseInt(maxPrice.replace(/[.,]/g, ''))
        params.push(`max_price=${maxPriceValue}`)
      }
      
      if (minPrice && minPrice.trim() !== '') {
        const minPriceValue = parseInt(minPrice.replace(/[.,]/g, ''))
        params.push(`min_price=${minPriceValue}`)
      }
      
      if (minArea && minArea.trim() !== '') {
        const minQm = parseInt(minArea.replace(/[.,]/g, ''))
        params.push(`min_qm=${minQm}`)
      }
      
      if (maxArea && maxArea.trim() !== '') {
        const maxQm = parseInt(maxArea.replace(/[.,]/g, ''))
        params.push(`max_qm=${maxQm}`)
      }
      
      if (minPricePerSqm && minPricePerSqm.trim() !== '') {
        const minPricePerSqmValue = parseInt(minPricePerSqm.replace(/[.,]/g, ''))
        params.push(`min_price_per_sqm=${minPricePerSqmValue}`)
      }
      
      if (maxPricePerSqm && maxPricePerSqm.trim() !== '') {
        const maxPricePerSqmValue = parseInt(maxPricePerSqm.replace(/[.,]/g, ''))
        params.push(`max_price_per_sqm=${maxPricePerSqmValue}`)
      }
      
      url += params.join('&')
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Daten')
      }

      const data: ApiResponse = await response.json()
      console.log('API Response:', data)
      
      // Filter listings
      const filteredListings = data.listings.filter(listing => {
        const price = parseInt(listing.price.replace(/[€.,\s]/g, ''))
        const qm = parseFloat(listing.qm.replace(',', '.'))
        const pricePerSqm = price / qm
        
        // Basic filter
        if (pricePerSqm <= 5 || pricePerSqm < 100) return false
        
        // Additional client-side filters for price per sqm
        if (minPricePerSqm && minPricePerSqm.trim() !== '') {
          const minPricePerSqmValue = parseInt(minPricePerSqm.replace(/[.,]/g, ''))
          if (pricePerSqm < minPricePerSqmValue) return false
        }
        
        if (maxPricePerSqm && maxPricePerSqm.trim() !== '') {
          const maxPricePerSqmValue = parseInt(maxPricePerSqm.replace(/[.,]/g, ''))
          if (pricePerSqm > maxPricePerSqmValue) return false
        }
        
        return true
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
                  {/* Location Row - PLZ and Radius */}
                  <Stack 
                    direction={{ xs: 'column', md: 'row' }} 
                    spacing={3}
                    justifyContent="center"
                  >
                    <Stack direction="row" spacing={2}>
                      <TextField
                        sx={{ maxWidth: '200px' }}
                        label="Postleitzahl"
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="z.B. 01067"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        variant="outlined"
                        required
                      />
                      
                      <TextField
                        sx={{ maxWidth: '200px' }}
                        label="Umkreis"
                        type="number"
                        value={radius}
                        onChange={(e) => setRadius(e.target.value)}
                        placeholder="z.B. 10"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              km
                            </InputAdornment>
                          ),
                        }}
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>

                  {/* First Row - Price Fields */}
                  <Stack 
                    direction={{ xs: 'column', md: 'row' }} 
                    spacing={3}
                    justifyContent="center"
                    flexWrap="wrap"
                  >
                    {/* Price Inputs */}
                    <Stack direction="row" spacing={2}>
                      <TextField
                        sx={{ maxWidth: '200px' }}
                        label="Mindestpreis"
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="z.B. 300000"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Euro color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        variant="outlined"
                      />
                      
                      <TextField
                        sx={{ maxWidth: '200px' }}
                        label="Maximalpreis"
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
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
                    </Stack>

                    {/* Price per SQM Inputs */}
                    <Stack direction="row" spacing={2}>
                      <TextField
                        sx={{ maxWidth: '180px' }}
                        label="Min €/m²"
                        type="number"
                        value={minPricePerSqm}
                        onChange={(e) => setMinPricePerSqm(e.target.value)}
                        placeholder="z.B. 1500"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Euro color="primary" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              /m²
                            </InputAdornment>
                          ),
                        }}
                        variant="outlined"
                      />
                      
                      <TextField
                        sx={{ maxWidth: '180px' }}
                        label="Max €/m²"
                        type="number"
                        value={maxPricePerSqm}
                        onChange={(e) => setMaxPricePerSqm(e.target.value)}
                        placeholder="z.B. 3000"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Euro color="primary" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              /m²
                            </InputAdornment>
                          ),
                        }}
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>

                  {/* Second Row - Area Fields */}
                  <Stack 
                    direction={{ xs: 'column', md: 'row' }} 
                    spacing={3}
                    justifyContent="center"
                  >
                    {/* Area Inputs */}
                    <Stack direction="row" spacing={2}>
                      <TextField
                        sx={{ maxWidth: '200px' }}
                        label="Min Quadratmeter"
                        type="number"
                        value={minArea}
                        onChange={(e) => setMinArea(e.target.value)}
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
                      
                      <TextField
                        sx={{ maxWidth: '200px' }}
                        label="Max Quadratmeter"
                        type="number"
                        value={maxArea}
                        onChange={(e) => setMaxArea(e.target.value)}
                        placeholder="z.B. 150"
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

                    {/* Sorting Dropdown */}
                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel>Sortierung</InputLabel>
                      <Select
                        value={sortBy}
                        label="Sortierung"
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <MenuItem value="">Keine Sortierung</MenuItem>
                        <MenuItem value="price-asc">Preis aufsteigend</MenuItem>
                        <MenuItem value="price-desc">Preis absteigend</MenuItem>
                        <MenuItem value="price-per-sqm-asc">€/m² aufsteigend</MenuItem>
                        <MenuItem value="price-per-sqm-desc">€/m² absteigend</MenuItem>
                        <MenuItem value="area-asc">Fläche aufsteigend</MenuItem>
                        <MenuItem value="area-desc">Fläche absteigend</MenuItem>
                      </Select>
                    </FormControl>
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
                    {sortListings(listings).map((listing, index) => (
                      <Card 
                        key={index}
                        elevation={3}
                        onClick={() => window.open(listing.link, '_blank')}
                        sx={{
                          height: '100%',
                          transition: 'all 0.3s ease-in-out',
                          cursor: 'pointer',
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
