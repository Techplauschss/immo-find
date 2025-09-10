import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Rechner from './Rechner.tsx'
import SettingsPanel from './SettingsPanel.tsx'
import { CitySettingsProvider } from './contexts/CitySettingsContext.tsx'
import { backgroundWakeup } from './utils/apiWakeup'

// Starte API Wake-up im Hintergrund beim App-Start
backgroundWakeup()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CitySettingsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/rechner" element={<Rechner />} />
          <Route path="/settings" element={<SettingsPanel />} />
        </Routes>
      </BrowserRouter>
    </CitySettingsProvider>
  </StrictMode>,
)
