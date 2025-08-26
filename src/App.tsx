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
  CssBaseline
} from '@mui/material'
import {
  Search,
  Euro,
  SquareFoot
} from '@mui/icons-material'
import './App.css'

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
                    startIcon={<Search />}
                    sx={{
                      py: 2,
                      background: 'linear-gradient(45deg, #2563eb 30%, #7c3aed 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1d4ed8 30%, #6d28d9 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
                      },
                    }}
                  >
                    Immobilien suchen
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
