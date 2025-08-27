# Stadt-Einstellungen Panel

## Übersicht
Das neue Settings-Panel ermöglicht es, die Mietpreise pro Quadratmeter für Dresden und Leipzig zentral zu verwalten. Diese Einstellungen werden automatisch in allen Cashflow-Berechnungen der Anwendung berücksichtigt.

## Funktionen

### 🏠 Stadt-spezifische Mietpreise
- **Dresden**: Standard 9,5 €/m² (anpassbar)
- **Leipzig**: Standard 9,8 €/m² (anpassbar)
- Dezimalwerte mit Komma (z.B. 9,5)

### 💾 Persistente Speicherung
- Einstellungen werden lokal im Browser gespeichert
- Automatisches Laden beim nächsten Besuch
- Fallback auf Standardwerte bei Fehlern

### 🔄 Automatische Aktualisierung
- Sofortige Anwendung in allen Berechnungen
- Cashflow-Chips aktualisieren sich automatisch
- Rechner-Modul verwendet aktuelle Werte

## Technische Details

### Context System
- `CitySettingsContext.tsx`: Zentrale Verwaltung der Einstellungen
- `useCitySettings()`: Hook für Zugriff auf Einstellungen
- Automatische localStorage-Synchronisation

### Komponenten
- `SettingsPanel.tsx`: Benutzeroberfläche für Einstellungen
- Integration in `App.tsx` und `Rechner.tsx`
- Routing unter `/settings`

### Integration
- `CashflowChip.tsx`: Verwendet Context-basierte Preise
- `Rechner.tsx`: Auto-Mietpreis basiert auf Context
- Rückwärtskompatibilität für bestehende Funktionen

## Navigation
- **Hauptseite**: "Einstellungen"-Button oben rechts
- **Rechner**: "Einstellungen"-Button neben "Zurück zur Suche"
- **Settings**: "Zurück zur Suche"-Button

## Bedienung
1. Auf "Einstellungen" klicken
2. Mietpreise anpassen (Komma als Dezimaltrennzeichen)
3. "Speichern" klicken
4. Erfolgsbestätigung abwarten
5. Sofortige Anwendung in allen Berechnungen

## Zusatzfunktionen
- **Zurücksetzen**: Wiederherstellen der Standardwerte
- **Validierung**: Nur positive Zahlen werden akzeptiert
- **Hinweise**: Hilfreiche Tipps zur Bedienung
