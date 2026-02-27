---
datum: 2026-02-27
typ: Methodik
thema: Allgemein
schlagworte: [Schlagworte, Taxonomie, Kontrolliertes-Vokabular]
status: aktuell
---

# Контролируемый словарь тегов / Kontrolliertes Vokabular (Schlagworte)

[← Methodik](./README.md)

> **Правило:** используй ТОЛЬКО теги из этого списка. Если нужного тега нет — добавь его сюда сначала, затем используй в документе. Это предотвращает дублирование (`KdU` vs `Unterkunftskosten` vs `Kosten-der-Unterkunft`).

---

## Как пользоваться

В YAML-блоке документа:
```yaml
schlagworte: [SGB-II, KdU, Widerspruch, Urteil-BSG]
```

- Только теги из этого списка
- Регистр: строчные буквы, дефис вместо пробела
- Максимум 6-8 тегов на документ (больше — размывает значение)

---

## 1. Правовые области (Rechtsgebiete)

| Тег | Расшифровка | Примечание |
|-----|-------------|-----------|
| `SGB-II` | SGB II Bürgergeld | Основной закон о Bürgergeld |
| `SGB-III` | SGB III Arbeitsförderung | Пособие по безработице (ALG I) |
| `SGB-VIII` | SGB VIII Kinder- und Jugendhilfe | Помощь детям и молодёжи |
| `SGB-XI` | SGB XI Pflegeversicherung | Страхование по уходу |
| `SGB-XII` | SGB XII Sozialhilfe | Социальная помощь |
| `AsylbLG` | Asylbewerberleistungsgesetz | Выплаты просителям убежища |
| `AufenthG` | Aufenthaltsgesetz | Закон о пребывании |
| `AsylG` | Asylgesetz | Закон об убежище |
| `Grundgesetz` | Grundgesetz | Конституция Германии |
| `EMRK` | Europäische Menschenrechtskonvention | Европейская конвенция |
| `DSGVO` | Datenschutz-Grundverordnung | Защита данных |
| `VwGO` | Verwaltungsgerichtsordnung | Административный процесс |
| `SGG` | Sozialgerichtsgesetz | Социальный процесс |

---

## 2. Тематические теги (Thematisch)

### 2.1 Leistungen (выплаты)

| Тег | Значение |
|-----|---------|
| `Regelbedarf` | Regelbedarf (§20 SGB II / §27a SGB XII) |
| `KdU` | Kosten der Unterkunft (§22 SGB II) — никогда не `Unterkunftskosten` |
| `Mehrbedarf` | Mehrbedarf (§21 SGB II) |
| `Einmalleistung` | Единовременные выплаты |
| `Bildungspaket` | Bildungs- und Teilhabepaket |
| `Krankenversicherung` | Kranken- und Pflegeversicherung |
| `Sozialgeld` | Sozialgeld (§23 SGB II) |
| `Grundsicherung` | Grundsicherung im Alter (SGB XII) |
| `Pflegegeld` | Pflegegeld (SGB XI) |
| `Asylbewerberleistungen` | Leistungen nach AsylbLG |
| `Analogleistungen` | Analogleistungen (§2 AsylbLG) |

### 2.2 Wohnen (жильё)

| Тег | Значение |
|-----|---------|
| `Unterkunft` | Unterkunft allgemein |
| `Angemessenheit` | Angemessenheit der KdU |
| `Schluessiges-Konzept` | Schlüssiges Konzept (BSG-Rechtsprechung) |
| `Umzug` | Umzug / Wohnungswechsel |
| `Mietschulden` | Mietschulden / Wohnungserhalt |
| `Obdachlosigkeit` | Wohnungslosigkeit / Obdachlosigkeit |
| `Wohnheim` | Gemeinschaftsunterkunft / Wohnheim |
| `Heizkosten` | Heizkosten (Teil der KdU) |

### 2.3 Verfahren (процессуальное)

| Тег | Значение |
|-----|---------|
| `Widerspruch` | Widerspruchsverfahren |
| `Klage` | Klage beim Sozialgericht |
| `Berufung` | Berufung beim LSG |
| `Revision` | Revision beim BSG |
| `Verfassungsbeschwerde` | Verfassungsbeschwerde beim BVerfG |
| `EinstwRechtsschutz` | Einstweiliger Rechtsschutz (§86b SGG) |
| `Akteneinsicht` | Akteneinsicht (§25 SGB X) |
| `Aufhebung` | Aufhebung von Bescheiden (§45/§48 SGB X) |
| `Erstattung` | Erstattungsansprüche |
| `Frist` | Fristen, Fristerstreckung |

### 2.4 Санкции и ограничения

| Тег | Значение |
|-----|---------|
| `Sanktionen` | Sanktionen (§31 SGB II) |
| `Leistungskuerzung` | Leistungsminderung |
| `Sperrzeiten` | Sperrzeiten (ALG I) |
| `Versagung` | Versagung von Leistungen |

### 2.5 Personen / Zielgruppen

| Тег | Bedeutung |
|-----|----------|
| `Alleinerziehende` | Alleinerziehende |
| `Gefluechtete` | Geflüchtete / Asylsuchende |
| `Obdachlose` | Wohnungslose |
| `Aeltere` | Ältere Menschen (Grundsicherung) |
| `Pflegebeduerftige` | Pflegebedürftige |
| `Kinder-Jugendliche` | Kinder und Jugendliche |
| `Behinderung` | Menschen mit Behinderung |
| `EU-Buerger` | EU-Bürger (Freizügigkeit, Leistungsausschluss) |
| `Drittstaatsangehoerige` | Drittstaatsangehörige |

---

## 3. Типы документов (Dokumenttypen)

| Тег | Значение |
|-----|---------|
| `Gesetz` | Gesetzestext, Norm |
| `Urteil-BSG` | Urteil des Bundessozialgerichts |
| `Urteil-LSG` | Urteil eines Landessozialgerichts |
| `Urteil-SG` | Urteil eines Sozialgerichts |
| `Urteil-BVerfG` | Urteil des Bundesverfassungsgerichts |
| `Kommentar` | Rechtlicher Kommentar |
| `Vorlage` | Musterschreiben / Vorlage |
| `Formular` | Amtliches Formular |
| `Leitfaden` | Leitfaden / Orientierungshilfe |
| `Statistik` | Statistische Daten |
| `Pressemitteilung` | Pressemitteilung |
| `Aktuelles` | Aktuelle Änderungen |

---

## 4. Теги процесса (Prozess-Tags)

| Тег | Значение |
|-----|---------|
| `Muster` | Musterdokument (zum Kopieren) |
| `Checkliste` | Checkliste |
| `Fristenkontrolle` | Wichtige Fristen enthalten |
| `Verfassungsrecht` | Verfassungsrechtliche Dimension |
| `EuGH` | Europäischer Gerichtshof |
| `EGMR` | Europäischer Gerichtshof für Menschenrechte |

---

## 5. Теги для информационной работы (Informationsarbeit)

| Тег | Значение |
|-----|---------|
| `OSINT` | Open Source Intelligence |
| `Recherche` | Recherchearbeit |
| `Datenschutz` | Datenschutz / DSGVO |
| `Anonymisiert` | Anonymisierte Daten |
| `Menschenrechte` | Menschenrechtsarbeit |
| `Dokumentation` | Dokumentationsarbeit |

---

## Как добавить новый тег

1. Убедись, что аналогичного тега нет (проверь синонимы)
2. Добавь в соответствующий раздел этого файла
3. Укажи значение и примечание
4. Сделай `git commit` с сообщением `добавлен тег: [тег]`

**Не используй:** пробелы, умлауты в тегах (`Kdu` вместо `KdU` нет — правильно `KdU`), слишком общие теги (`Recht`, `Soziales`).

---

*Создан: 2026-02-27 | Статус: aktuell*
