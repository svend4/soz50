# WritingOS — Personal Knowledge OS

> React-App für strukturiertes juristisches Schreiben mit KI-Integration.
> Entwickelt für: Widersprüche, Klagen, Fallakten, Budget-Anträge (§ 29 SGB IX).

---

## Schnellstart

```bash
# Abhängigkeiten installieren
npm install react react-dom

# Mit Vite (empfohlen)
npm create vite@latest writing-os -- --template react
cp WritingOS.jsx src/App.jsx
npm run dev
```

Oder direkt in ein bestehendes React-Projekt kopieren:

```bash
cp WritingOS.jsx src/components/WritingOS.jsx
```

```jsx
import WritingOS from './components/WritingOS';
export default function App() { return <WritingOS />; }
```

---

## Abhängigkeiten

| Paket | Version | Zweck |
|-------|---------|-------|
| `react` | ≥ 18 | Core |
| `react-dom` | ≥ 18 | DOM-Rendering |

Keine weiteren Abhängigkeiten — nur React und Browser-APIs.

---

## Claude API einrichten

WritingOS ruft die Anthropic Claude API direkt aus dem Browser auf.

### API-Key setzen

```javascript
// In der Browser-Konsole (DevTools → Console):
localStorage.setItem('claudeKey', 'sk-ant-...');
```

Oder im App-Interface: Einstellungen → API Key.

**Modell:** `claude-sonnet-4-20250514` (konfigurierbar in `callAI()`)

### Datenschutz

- API-Key wird nur in `localStorage` gespeichert, niemals an Dritte gesendet
- Alle Dokumente bleiben lokal im Browser (`localStorage`, key `wos7`)
- Keine Server-Kommunikation außer direkt zu `api.anthropic.com`

---

## Datenspeicherung

WritingOS speichert alle Projekte im `localStorage` des Browsers:

```javascript
localStorage.getItem('wos7')  // JSON-Array aller Projekte
```

### Export

| Format | Funktion | Beschreibung |
|--------|---------|-------------|
| **MHT** | `exportDOC(proj)` | HTML-Archiv mit Styles |
| **PDF** | `exportPDF(proj)` | Browser-Druckdialog |
| **Fallpaket** | `exportCasePackage(projects)` | ZIP aller Dokumente |

### Backup / Sync

```bash
# Lokales Backup aus DevTools Console:
copy(localStorage.getItem('wos7'))
# → Einfügen in wos7-backup-YYYY-MM-DD.json

# Wiederherstellen:
localStorage.setItem('wos7', '<JSON-Inhalt>')
```

---

## Vorlagen (Templates)

WritingOS enthält folgende Rechtsvorlagen:

| Key | Titel | SGB |
|-----|-------|-----|
| `widerspruch` | Widerspruch gegen Bescheid | SGB X § 83 |
| `klage` | Klage beim Sozialgericht | SGG § 54 |
| `s7so9925` | Muster: S 7 SO 99/25 Dresden | SGB XII + IX |
| `akteneinsicht` | Akteneinsicht § 25 SGB X | SGB X |
| `pkh` | Prozesskostenhilfe-Antrag | ZPO §§ 114 ff. |
| `budget29` | Antrag Persönliches Budget | SGB IX § 29 |
| `dissertation` | Akademische Arbeit | — |

---

## Features

### KI-Rollen

| Rolle | Funktion |
|-------|---------|
| `editor` | Grammatik und Stil |
| `critic` | Kritische Analyse |
| `lawyer` | Juristische Prüfung |
| `coauthor` | Inhaltliche Ergänzung |
| `translate` | Übersetzung |

### Ansichten

- **doc** — Dokumentenansicht mit Blöcken
- **graph** — SVG-Wissensgraph (Paragraph-Verknüpfungen)
- **split** — Zwei Dokumente nebeneinander
- **timeline** — Chronologische Ansicht
- **history** — Änderungshistorie (Track Changes)

### Werkzeuge

- Pomodoro-Timer (25/5 Min)
- Fristen-Widget mit Farbkodierung
- Budget-Rechner § 29 SGB IX (5 Kategorien)
- Fußnoten und Bibliographie (KI-formatiert)
- Spracheingabe (Web Speech API)
- Lesezeichen und Tags
- Suchen & Ersetzen

---

## Verzeichnisstruktur

```
app/
├── WritingOS.jsx        ← Hauptkomponente (alles-in-einer-Datei)
└── README.md            ← Diese Datei
```

---

## Fallakte S 7 SO 99/25

WritingOS enthält eine Vorlage für das Verfahren S 7 SO 99/25 (Sozialgericht Dresden).
Details zur Fallakte: [04_FALLBEISPIELE/SGB_IX/S7-SO-99-25-Fallakte.md](../04_FALLBEISPIELE/SGB_IX/S7-SO-99-25-Fallakte.md)

Rechtliche Grundlage: [SGB IX § 29 Persönliches Budget](../01_SOZIALRECHT/03_SGB_XII_Sozialhilfe/Eingliederungshilfe/SGB-IX-Paragraph29-Persoenliches-Budget.md)

---

*Erstellt: 2026-10-23 | Teil der [Wissensbasis Sozialrecht](../README.md)*
