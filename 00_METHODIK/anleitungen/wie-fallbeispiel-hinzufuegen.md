---
datum: 2026-02-27
typ: Anleitung
thema: Fallbeispiel hinzufügen
schlagworte: [Methodik, Anleitung, Fallbeispiel, Vorlage]
status: aktuell
---

# Wie füge ich ein Fallbeispiel hinzu?

[← Anleitungen](./README.md) | [← Methodik](../README.md)

> Fallbeispiele sind das praktische Herzstück der Wissensbasis.
> Sie verbinden **Theorie** (Gesetz/Paragraf) mit **Praxis** (konkreter Fall).
> Gut dokumentierte Fälle helfen allen — bei ähnlichen Situationen in der Beratung.

---

## Schritt 1: Dateinamen wählen

```
Format: YYYY-MM-DD_Kurztitel.md

Beispiele:
  2026-02-15_KdU-Widerspruch-schlüssiges-Konzept.md
  2026-03-01_Pflegegrad-Widerspruch-erhöhung.md
  2026-01-20_AsylbLG-Psychotherapie-Paragraph6.md

Regeln:
  → Datum: aktuelles Datum (wann Fall dokumentiert)
  → Titel: kurz, beschreibend, mit Bindestrichen
  → Keine Umlaute im Dateinamen (ue, ae, oe, ss)
  → Keine Leerzeichen
```

---

## Schritt 2: Richtigen Ordner wählen

```
04_FALLBEISPIELE/
  SGB_II/           → Bürgergeld-Fälle (KdU, Sanktionen, Mehrbedarf)
  SGB_XII/          → Sozialhilfe-Fälle (Grundsicherung, HzL)
  Jugendhilfe/      → SGB VIII-Fälle (HzE, Inobhutnahme, UhV)
  Auslaenderrecht/  → AsylbLG, Aufenthalt, Dublin
  SGB_XI/           → Pflege-Fälle (Pflegegrad, Leistungen)
  Sonstiges/        → Übergreifende oder seltene Fälle
```

---

## Schritt 3: Datei aus Vorlage erstellen

**Mit Skript (empfohlen):**
```bash
bash scripts/new-doc.sh fallbeispiel 04_FALLBEISPIELE/SGB_II "KdU Widerspruch"
# → Erstellt: 04_FALLBEISPIELE/SGB_II/2026-MM-DD_KdU-Widerspruch.md
```

**Manuell:** Vorlage kopieren:
```bash
cp 00_METHODIK/vorlagen/vorlage-fallbeispiel.md \
   04_FALLBEISPIELE/SGB_II/2026-02-27_Mein-Fall.md
```

---

## Schritt 4: Vorlage ausfüllen

Die Vorlage hat folgende Abschnitte — alle ausfüllen:

### Pflichtfelder (YAML-Block oben)

```yaml
---
datum: 2026-02-27          ← Datum der Dokumentation
typ: Fallbeispiel
thema: KdU                 ← Hauptthema (1-2 Wörter)
schlagworte: [KdU, Widerspruch, § 22 SGB II]   ← Tags für Suche
rechtsgrundlage: § 22 SGB II                   ← Wichtigster Paragraph
status: abgeschlossen | laufend | Vorlage
ergebnis: erfolgreich | erfolglos | laufend     ← Ausgang des Falls
---
```

### Pflichtabschnitte im Text

```
## Ausgangssituation
  → Wer ist der Klient? (anonymisiert!)
  → Was ist passiert? (Bescheid, Situation)
  → Welche Leistung ist betroffen?

## Rechtliche Einordnung
  → Welche §§ sind relevant?
  → Was sagt das Gesetz?
  → Gibt es Rechtsprechung dazu?

## Vorgehensweise
  → Was wurde getan? (Widerspruch, Antrag, Klage?)
  → Welche Dokumente wurden eingereicht?
  → Welche Fristen waren zu beachten?

## Ergebnis
  → Wie lief es aus?
  → Was hat funktioniert / nicht funktioniert?

## Lernpunkte
  → Was ist die wichtigste Erkenntnis?
  → Wie lässt sich das auf ähnliche Fälle übertragen?
```

---

## Schritt 5: Anonymisierung prüfen!

```
WICHTIG: Datenschutz hat oberste Priorität!

→ Namen: Immer ersetzen durch "Klient", "Frau M.", "Familie K."
→ Adressen: Nie konkrete Straßen/Hausnummern
→ Aktenzeichen: Nur wenn öffentlich (Gerichtsurteil)
→ Geburtsdaten: Nur Jahrgang ("Person, Jahrgang 1975")
→ Arbeitgeber: "Reinigungsfirma" statt echter Name

Prüffragen:
  □ Könnte die Person anhand dieser Infos identifiziert werden?
  □ Sind alle Namen entfernt?
  □ Sind genaue Adressen entfernt?
  □ Ist das Aktenzeichen intern (→ weglassen)?
```

---

## Schritt 6: Link im README.md der Kategorie hinzufügen

```
In 04_FALLBEISPIELE/SGB_II/README.md ergänzen:

| [KdU-Widerspruch schlüssiges Konzept](./YYYY-MM-DD_Titel.md) | § 22 SGB II | YYYY-MM-DD | erfolgreich |
```

---

## Qualitätskriterien — gutes Fallbeispiel

```
✓ Anonymisiert (keine identifizierbaren Daten)
✓ Konkrete Rechtsnormen genannt (§§)
✓ Klare Struktur (Ausgangslage → Vorgehen → Ergebnis)
✓ Lernpunkte explizit benannt
✓ Auf ähnliche Fälle übertragbar
✓ Ergebnis dokumentiert (auch wenn negativ!)
✓ Links zu relevanten Grundlagendokumenten

✗ Nur vage Beschreibung ohne rechtliche Einordnung
✗ Nicht anonymisiert
✗ Kein Ergebnis (Fall "noch offen" ohne Update)
✗ Zu lang ohne klare Struktur
```

---

## Vorlage anzeigen

Die vollständige Vorlage: [vorlage-fallbeispiel.md](../vorlagen/vorlage-fallbeispiel.md)

Beispiel-Fallbeispiele zur Orientierung:
- [KdU-Widerspruch (SGB II)](../../04_FALLBEISPIELE/SGB_II/2026-02-27_KdU-Widerspruch-Angemessenheit.md)
- [SPFH abgelehnt (Jugendhilfe)](../../04_FALLBEISPIELE/Jugendhilfe/2026-02-27_SPFH-Antrag-abgelehnt-Widerspruch.md)
- [AsylbLG § 6 Psychotherapie](../../04_FALLBEISPIELE/Auslaenderrecht/2026-02-27_AsylbLG-Psychotherapie-Paragraph6.md)

---

## Смотри также

- [Wie Dokument hinzufügen](./wie-dokument-hinzufuegen.md)
- [Vorlage Fallbeispiel](../vorlagen/vorlage-fallbeispiel.md)
- [Alle Fallbeispiele](../../04_FALLBEISPIELE/)
