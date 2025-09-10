// API Wake-up Service
// Sendet eine stille Anfrage an die API beim App-Start, um den Server aus dem Sleep-Modus zu wecken

import { buildApiUrl } from './api'

let wakeupAttempted = false

/**
 * Weckt die API mit einer stillen Health-Check Anfrage auf
 * Wird nur einmal pro App-Session ausgeführt
 */
export async function wakeupApi(): Promise<void> {
  // Verhindere mehrfache Wake-up Aufrufe in derselben Session
  if (wakeupAttempted) {
    return
  }
  
  wakeupAttempted = true
  
  try {
    console.log('🔄 Wecke API-Server auf...')
    
    // Verwende einen simplen Health-Check Endpoint oder einen beliebigen leichten Endpoint
    // Falls kein /health Endpoint existiert, verwenden wir einen einfachen Listings-Call
    const wakeupUrl = buildApiUrl('health') // oder 'listings' falls kein health endpoint
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout
    
    const response = await fetch(wakeupUrl, {
      method: 'GET',
      signal: controller.signal,
      // Keine besonderen Header erforderlich - einfach nur eine Anfrage
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      console.log('✅ API-Server erfolgreich aufgewacht')
    } else {
      console.log('⚠️ API-Server antwortet, aber mit Status:', response.status)
    }
    
  } catch (error) {
    // Fehler beim Wake-up sind nicht kritisch - App soll trotzdem funktionieren
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('⏱️ Wake-up Timeout - Server braucht länger zum Aufwachen')
    } else {
      console.log('⚠️ Wake-up fehlgeschlagen:', error)
    }
  }
}

/**
 * Startet Wake-up im Hintergrund ohne die App zu blockieren
 */
export function backgroundWakeup(): void {
  // Promise bewusst nicht awaiten - soll im Hintergrund laufen
  wakeupApi().catch(() => {
    // Stille Behandlung - Wake-up Fehler sollen die App nicht beeinträchtigen
  })
}
