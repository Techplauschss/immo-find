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
import CalculatorIcon from './CalculatorIcon'
import SearchIcon from './SearchIcon'
import CashflowChip, { getCashflowValue } from './CashflowChip'

// Types
interface Listing {
  price: string
  qm: string
  location: string
  link: string
  foundRentValue?: number // Optional: gefundener Mietpreis durch Scraping
}

interface ApiResponse {
  listings: Listing[]
  count: number
}

// Available cities for property search
const zipCodeOptions = [
  { value: '01069', label: 'Dresden', city: 'Dresden' },
  { value: '04109', label: 'Leipzig', city: 'Leipzig' },
]

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
  const navigate = useNavigate()
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minArea, setMinArea] = useState('')
  const [maxArea, setMaxArea] = useState('')
  const [minPricePerSqm, setMinPricePerSqm] = useState('')
  const [maxPricePerSqm, setMaxPricePerSqm] = useState('')
  const [zipCode, setZipCode] = useState('01069') // Dresden als Standard
  const [radius, setRadius] = useState('')
  const [avgPricePerSqm, setAvgPricePerSqm] = useState('')
  const [loadingAvgPrice, setLoadingAvgPrice] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [showOnlyPositiveCashflow, setShowOnlyPositiveCashflow] = useState(false)
  const [scrapingCard, setScrapingCard] = useState<string | null>(null) // Für die Loading-Animation über der Card

  // Helper function to get city from zipCode
  const getCityFromZipCode = (zipCode: string) => {
    const option = zipCodeOptions.find(option => option.value === zipCode)
    return option ? option.city : 'Dresden' // Default to Dresden
  }

  // LocalStorage functions for persistent found rent values
  const saveFoundRentValues = (listings: Listing[]) => {
    const rentValues: { [link: string]: number } = {}
    listings.forEach(listing => {
      if (listing.foundRentValue && listing.foundRentValue > 0) {
        rentValues[listing.link] = listing.foundRentValue
      }
    })
    localStorage.setItem('foundRentValues', JSON.stringify(rentValues))
  }

  const loadFoundRentValues = (): { [link: string]: number } => {
    try {
      const saved = localStorage.getItem('foundRentValues')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }

  const restoreFoundRentValues = (listings: Listing[]): Listing[] => {
    const savedValues = loadFoundRentValues()
    return listings.map(listing => ({
      ...listing,
      foundRentValue: savedValues[listing.link] || listing.foundRentValue
    }))
  }
  const [sortBy, setSortBy] = useState('')

  // Storage keys for localStorage
  const STORAGE_KEYS = {
    searchData: 'immo-find-search-data',
    searchParams: 'immo-find-search-params',
    lastSearch: 'immo-find-last-search'
  }

  // Save search data to localStorage
  const saveSearchData = (searchData: { listings: Listing[], searchParams: any, sortBy: string, showOnlyPositiveCashflow: boolean }) => {
    try {
      localStorage.setItem(STORAGE_KEYS.searchData, JSON.stringify(searchData.listings))
      localStorage.setItem(STORAGE_KEYS.searchParams, JSON.stringify({
        ...searchData.searchParams,
        showOnlyPositiveCashflow: searchData.showOnlyPositiveCashflow
      }))
      localStorage.setItem(STORAGE_KEYS.lastSearch, Date.now().toString())
    } catch (error) {
      console.error('Fehler beim Speichern der Suchdaten:', error)
    }
  }

  // Load search data from localStorage
  const loadSearchData = () => {
    try {
      const savedListings = localStorage.getItem(STORAGE_KEYS.searchData)
      const savedParams = localStorage.getItem(STORAGE_KEYS.searchParams)
      const lastSearchTime = localStorage.getItem(STORAGE_KEYS.lastSearch)

      // Check if data exists and is not older than 1 hour
      if (savedListings && savedParams && lastSearchTime) {
        const oneHour = 60 * 60 * 1000 // 1 hour in milliseconds
        const timeDifference = Date.now() - parseInt(lastSearchTime)
        
        if (timeDifference < oneHour) {
          const listings: Listing[] = JSON.parse(savedListings)
          const params = JSON.parse(savedParams)
          
          // Restore search parameters
          setMinPrice(params.minPrice || '')
          setMaxPrice(params.maxPrice || '')
          setMinArea(params.minArea || '')
          setMaxArea(params.maxArea || '')
          setMinPricePerSqm(params.minPricePerSqm || '')
          setMaxPricePerSqm(params.maxPricePerSqm || '')
          setZipCode(params.zipCode || '01069')
          setRadius(params.radius || '')
          setSortBy(params.sortBy || '')
          setShowOnlyPositiveCashflow(params.showOnlyPositiveCashflow || false)
          
          // Restore listings and search state
          const restoredListings = restoreFoundRentValues(listings)
          setListings(restoredListings)
          setSearchPerformed(true)
          
          return true // Data was loaded
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Suchdaten:', error)
    }
    return false // No data was loaded
  }

  // Load search data and average price on component mount
  useEffect(() => {
    const dataLoaded = loadSearchData()
    
    // If no data was loaded, fetch average price for default city
    if (!dataLoaded) {
      fetchAveragePrice('01069')
    } else {
      // If data was loaded, fetch average price for the restored zipCode
      fetchAveragePrice(zipCode)
    }
  }, [])

  // Update localStorage when sortBy changes and we have listings
  useEffect(() => {
    if (listings.length > 0 && searchPerformed) {
      const searchParams = {
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        minPricePerSqm,
        maxPricePerSqm,
        zipCode,
        radius,
        sortBy
      }
      
      saveSearchData({
        listings,
        searchParams,
        sortBy,
        showOnlyPositiveCashflow
      })
    }
  }, [sortBy])

  // Update localStorage when cashflow filter changes and we have listings
  useEffect(() => {
    if (listings.length > 0 && searchPerformed) {
      const searchParams = {
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        minPricePerSqm,
        maxPricePerSqm,
        zipCode,
        radius,
        sortBy
      }
      
      saveSearchData({
        listings,
        searchParams,
        sortBy,
        showOnlyPositiveCashflow
      })
    }
  }, [showOnlyPositiveCashflow])

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

  const filterListings = (listingsToFilter: Listing[]) => {
    if (!showOnlyPositiveCashflow) return listingsToFilter
    
    return listingsToFilter.filter(listing => {
      const cashflowValue = getCashflowValue(listing.price, listing.qm, getCityFromZipCode(zipCode))
      return cashflowValue >= 0
    })
  }

  const fetchAveragePrice = async (zipCode: string) => {
    if (!zipCode || zipCode.length < 5) {
      setAvgPricePerSqm('')
      return
    }

    setLoadingAvgPrice(true)
    try {
      // TODO: Hier würde die echte API-Abfrage stehen
      // Für jetzt verwenden wir Dummy-Daten basierend auf der PLZ
      
      // Simuliere API-Aufruf
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Dummy-Daten basierend auf PLZ (erste zwei Ziffern für Regionen)
      const region = zipCode.substring(0, 2)
      const dummyPrices: { [key: string]: number } = {
        '01': 2870, // Dresden
        '04': 2950, // Leipzig
        '10': 8500, // Berlin
        '20': 7200, // Hamburg  
        '30': 4800, // Hannover
        '40': 4200, // Düsseldorf
        '50': 5200, // Köln
        '60': 6800, // Frankfurt
        '70': 5800, // Stuttgart
        '80': 9200, // München
        '90': 4600, // Nürnberg
      }
      
      const avgPrice = dummyPrices[region] || 3500 // Fallback-Wert
      setAvgPricePerSqm(avgPrice.toLocaleString('de-DE'))
    } catch (err) {
      console.error('Fehler beim Laden des Durchschnittspreises:', err)
      setAvgPricePerSqm('')
    } finally {
      setLoadingAvgPrice(false)
    }
  }

    const searchListings = async () => {
    if (!zipCode) {
      setError('Bitte geben Sie eine Postleitzahl ein')
      return
    }

    setLoading(true)
    setError('')
    setSearchPerformed(true)
    // Clear any existing listings to show fresh results
    setListings([])

    try {
      // Build URL with optional parameters
      let url = '/api/listings?'
      
      // Use specific endpoints for certain cities
      if (zipCode === '01069') {
        url = '/api/dresden-listings?'
      } else if (zipCode === '04109') {
        url = '/api/leipzig-listings?'
      }
      
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
      
      // Check if listings exist in response
      if (!data || !data.listings || !Array.isArray(data.listings)) {
        console.error('Invalid API response structure:', data)
        throw new Error('Ungültige API-Antwort: Keine Immobilien-Daten gefunden')
      }
      
      // Filter listings
      const filteredListings = data.listings.filter(listing => {
        const price = parseInt(listing.price.replace(/[€.,\s]/g, ''))
        const qm = parseFloat(listing.qm.replace(',', '.'))
        const pricePerSqm = price / qm
        
        // Basic filter
        if (pricePerSqm <= 5 || pricePerSqm < 100) return false
        
        // Filter by radius if specified
        if (radius && radius.trim() !== '') {
          const radiusValue = parseInt(radius.replace(/[.,]/g, ''))
          // Extract distance from location string (e.g. "Dresden (5 km)" -> 5)
          const distanceMatch = listing.location.match(/\((\d+(?:[.,]\d+)?)\s*km\)/)
          if (distanceMatch) {
            const distance = parseFloat(distanceMatch[1].replace(',', '.'))
            if (distance > radiusValue) return false
          }
        }
        
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
      
      // Restore found rent values for the new listings
      const restoredListings = restoreFoundRentValues(filteredListings)
      setListings(restoredListings)
      
      // Save search data to localStorage for reload persistence
      const searchParams = {
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        minPricePerSqm,
        maxPricePerSqm,
        zipCode,
        radius,
        sortBy
      }
      
      saveSearchData({
        listings: filteredListings,
        searchParams,
        sortBy,
        showOnlyPositiveCashflow
      })
      
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
          <Box sx={{ position: 'relative', mb: 6 }}>
            {/* Rechner Button - Top Left */}
            <Button
              variant="outlined"
              onClick={() => navigate('/rechner')}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Rechner
            </Button>

            {/* Settings Button - Top Right */}
            <Button
              variant="outlined"
              onClick={() => navigate('/settings')}
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
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

            <Box textAlign="center">
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
                      <FormControl sx={{ maxWidth: '250px' }}>
                        <InputLabel>Stadt</InputLabel>
                        <Select
                          value={zipCode}
                          label="Stadt"
                          onChange={(e) => {
                            setZipCode(e.target.value)
                            fetchAveragePrice(e.target.value)
                          }}
                          startAdornment={
                            <InputAdornment position="start">
                              <LocationOn color="primary" />
                            </InputAdornment>
                          }
                          required
                          renderValue={(selected) => {
                            const selectedOption = zipCodeOptions.find(option => option.value === selected)
                            return selectedOption ? selectedOption.city : ''
                          }}
                        >
                          {zipCodeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              <Box>
                                <Typography variant="body1">{option.city}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {option.value}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
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

                      {/* Average Price Display */}
                      <TextField
                        sx={{ maxWidth: '250px' }}
                        label="Ø Kaufpreis/m² in PLZ"
                        value={loadingAvgPrice ? 'Wird geladen...' : avgPricePerSqm ? `${avgPricePerSqm} €/m²` : ''}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <InputAdornment position="start">
                              <Euro color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        variant="outlined"
                        disabled={!avgPricePerSqm && !loadingAvgPrice}
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
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  justifyContent="space-between" 
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={2}
                  sx={{ mb: 3 }}
                >
                  <Typography variant="h5" component="h3" color="white">
                    {!loading && (
                      filterListings(listings).length > 0 
                        ? `${filterListings(listings).length} Immobilien gefunden` 
                        : 'Keine Immobilien gefunden'
                    )}
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    {/* Cashflow Filter Toggle Button - only show when listings exist */}
                    {listings.length > 0 && (
                      <Button
                        variant="contained"
                        onClick={() => setShowOnlyPositiveCashflow(!showOnlyPositiveCashflow)}
                        startIcon={
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: showOnlyPositiveCashflow ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                              border: showOnlyPositiveCashflow ? 'none' : '1.5px solid rgba(255, 255, 255, 0.6)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              transform: showOnlyPositiveCashflow ? 'scale(1)' : 'scale(0.8)',
                            }}
                          />
                        }
                        sx={{
                          borderRadius: '25px',
                          px: 4,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          minWidth: 'auto',
                          whiteSpace: 'nowrap',
                          background: showOnlyPositiveCashflow 
                            ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                            : 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(10px)',
                          border: showOnlyPositiveCashflow 
                            ? 'none' 
                            : '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          boxShadow: showOnlyPositiveCashflow 
                            ? '0 8px 25px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                            : '0 4px 15px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                          '&:hover': {
                            background: showOnlyPositiveCashflow 
                              ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                              : 'rgba(255, 255, 255, 0.25)',
                            transform: 'translateY(-2px) scale(1.02)',
                            boxShadow: showOnlyPositiveCashflow 
                              ? '0 12px 35px rgba(34, 197, 94, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                              : '0 8px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                          },
                          '&:active': {
                            transform: 'translateY(-1px) scale(0.98)',
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        Nur positive Cashflows
                      </Button>
                    )}

                    {/* Sorting Dropdown */}
                    {listings.length > 0 && (
                      <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel sx={{ color: 'white' }}>Sortierung</InputLabel>
                        <Select
                          value={sortBy}
                          label="Sortierung"
                          onChange={(e) => setSortBy(e.target.value)}
                          sx={{
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'white',
                            },
                            '& .MuiSvgIcon-root': {
                              color: 'white',
                            },
                          }}
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
                    )}
                  </Stack>
                </Stack>

                {filterListings(listings).length > 0 && (
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
                    {sortListings(filterListings(listings)).map((listing, index) => {
                      // Calculate cashflow to determine card styling
                      const cashflowValue = getCashflowValue(listing.price, listing.qm, getCityFromZipCode(zipCode))
                      const isNegativeCashflow = cashflowValue < 0
                      
                      return (
                        <Card 
                          key={index}
                          elevation={3}
                          onClick={() => window.open(listing.link, '_blank')}
                          sx={{
                            height: '100%',
                            position: 'relative',
                            transition: 'all 0.3s ease-in-out',
                            cursor: 'pointer',
                            backgroundColor: 'background.paper', // Keep white background
                            boxShadow: isNegativeCashflow 
                              ? '0 0 20px rgba(220, 38, 38, 0.4)' // Red glow effect for negative cashflow
                              : '0 0 20px rgba(34, 197, 94, 0.4)', // Green glow effect for positive cashflow
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: isNegativeCashflow 
                                ? '0 8px 30px rgba(220, 38, 38, 0.5), 0 0 25px rgba(220, 38, 38, 0.3)' // Enhanced red glow on hover
                                : '0 8px 30px rgba(34, 197, 94, 0.5), 0 0 25px rgba(34, 197, 94, 0.3)', // Enhanced green glow on hover
                            },
                          }}
                        >
                        <CalculatorIcon 
                          price={listing.price}
                          qm={listing.qm}
                          city={getCityFromZipCode(zipCode)}
                        />
                        <SearchIcon 
                          link={listing.link}
                          qm={listing.qm}
                          city={getCityFromZipCode(zipCode)}
                          onSearchStart={() => setScrapingCard(listing.link)}
                          onSearchEnd={() => setScrapingCard(null)}
                          onValueFound={(value) => {
                            // Update das Listing mit dem gefundenen Mietpreis
                            setListings(prevListings => {
                              const updatedListings = prevListings.map(l => 
                                l.link === listing.link 
                                  ? { ...l, foundRentValue: value }
                                  : l
                              )
                              // Speichere die gefundenen Werte persistent
                              saveFoundRentValues(updatedListings)
                              return updatedListings
                            })
                          }}
                        />
                        {scrapingCard === listing.link && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 10,
                              borderRadius: 2,
                            }}
                          >
                            <CircularProgress size={40} />
                          </Box>
                        )}
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

                              {/* Chips with reduced spacing */}
                              <Stack spacing={0.5}>
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

                                {/* Cashflow display */}
                                <CashflowChip 
                                  price={listing.price}
                                  qm={listing.qm}
                                  city={getCityFromZipCode(zipCode)}
                                  customRentValue={listing.foundRentValue}
                                />
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      )
                    })}
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
