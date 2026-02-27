---
datum: 2026-02-27
typ: Methodik
thema: Allgemein
schlagworte: [Suche, Recherche, Boolean, OSINT, Checkliste]
status: aktuell
---

# Поиск — Краткая справка / Suche — Kurzreferenz

[← Methodik](../README.md)

> Шпаргалка по стратегиям поиска. Распечатай или держи под рукой.

---

## 1. Булевы операторы / Boole'sche Operatoren

### Везде работает (universell)

| Оператор | Синтаксис | Что делает | Пример |
|---------|-----------|-----------|--------|
| И (AND) | `AND` или пробел | Оба слова | `Widerspruch Jobcenter` |
| ИЛИ (OR) | `OR` | Хотя бы одно | `SGB II OR SGB XII` |
| НЕ (NOT) | `NOT` или `-` | Исключить слово | `Wohnung -Eigenheim` |
| Фраза | `"..."` | Точное совпадение | `"angemessene Unterkunft"` |
| Маска | `*` | Любое окончание | `Beschäftig*` |
| Группировка | `( )` | Приоритет | `(SGB II OR XII) AND KdU` |

### В командной строке (grep / ripgrep)

```bash
# Поиск в базе знаний
grep -r "KdU" /home/user/soz50/                    # рекурсивно
grep -rl "KdU" /home/user/soz50/ --include="*.md"  # только имена файлов
grep -rn "KdU" /home/user/soz50/                    # с номерами строк
grep -ri "KdU" /home/user/soz50/                    # без учёта регистра

# ripgrep (быстрее)
rg "KdU" /home/user/soz50/
rg -l "KdU" /home/user/soz50/                      # только файлы
rg "KdU.*Angemessenheit" /home/user/soz50/          # оба слова в строке
rg -i "widerspruch" /home/user/soz50/ -t md         # только .md, без регистра

# Поиск с контекстом
rg -C 3 "Schluessiges Konzept" /home/user/soz50/    # 3 строки вокруг
```

### В Git (поиск по истории)

```bash
# Что изменилось в конкретном файле
git log --follow -p 00_METHODIK/anleitungen/methoden-grosse-datenmengen.md

# Когда появился термин в базе
git log -S "KdU-Angemessenheit" --all

# Все изменения за последние 30 дней
git log --since="30 days ago" --oneline
```

---

## 2. Google / Bing — Операторы расширенного поиска

```
site:sozialgerichtsbarkeit.de               ← только с этого сайта
site:bsg.bund.de "§22 SGB II"              ← сайт + фраза
filetype:pdf Bürgergeld Widerspruch 2026   ← только PDF
intitle:KdU Angemessenheit                  ← слово в заголовке
inurl:urteil sgb-ii                         ← слово в URL
"B 14 AS" site:bsg.bund.de                 ← номер дела на сайте BSG
2024..2026 SGB XII Grundsicherung           ← диапазон лет

# Комбинации
site:sozialgerichtsbarkeit.de "§22 SGB II" "schlüssiges Konzept" -site:sozialgericht.de
```

---

## 3. Поиск в юридических базах Германии

### gesetze-im-internet.de
```
Прямой URL к параграфу:
https://www.gesetze-im-internet.de/sgb_2/__22.html

Поиск через Google:
site:gesetze-im-internet.de §22 SGB II
```

### dejure.org
```
Полнотекстовый поиск: Suchfeld oben rechts
Параграф с практикой: dejure.org/gesetze/SGB_II/22.html
Перекрёстные ссылки: автоматически к каждому параграфу
```

### sozialgerichtsbarkeit.de
```
Поиск по норме: Rechtsgebiet → SGB II → §22
Поиск по суду: BSG / LSG (Land) / SG
Полнотекстовый: "schlüssiges Konzept" + SGB II
```

---

## 4. Поиск в этой базе знаний

### По тегам (schlagworte)
```bash
grep -rl "KdU" /home/user/soz50/ --include="*.md"
grep -rl "schlagworte:.*Widerspruch" /home/user/soz50/ --include="*.md"
```

### По типу документа
```bash
grep -rl "^typ: Urteil" /home/user/soz50/ --include="*.md"
grep -rl "^typ: Vorlage" /home/user/soz50/ --include="*.md"
```

### По статусу
```bash
grep -rl "^status: in-bearbeitung" /home/user/soz50/ --include="*.md"
grep -rl "^status: veraltet" /home/user/soz50/ --include="*.md"
```

### По дате
```bash
grep -rl "^datum: 2026" /home/user/soz50/ --include="*.md"
grep -rl "^datum: 2025" /home/user/soz50/ --include="*.md"
```

### Комплексный поиск (AND)
```bash
# Документы о KdU со статусом aktuell
grep -rl "KdU" /home/user/soz50/ --include="*.md" | \
  xargs grep -l "status: aktuell"

# Случаи из практики (SGB II) с 2026 года
grep -rl "^typ: Fallbeispiel" /home/user/soz50/ --include="*.md" | \
  xargs grep -l "^datum: 2026"
```

### Индекс (быстрый обзор)
```bash
# Открыть INDEX.md (обновить сначала)
bash scripts/gen-index.sh
cat INDEX.md | grep -i "KdU"
```

---

## 5. Стратегия поиска — алгоритм

```
Шаг 1: СФОРМУЛИРУЙ ВОПРОС
  ↓
  Что именно ищешь? (норма / решение суда / шаблон / прецедент)
  Ключевые слова? Синонимы?

Шаг 2: НАЧНИ ШИРОКО, СУЖАЙ
  ↓
  Broad: "KdU" → 50 результатов
  Narrow: "KdU Angemessenheit schlüssiges Konzept 2025" → 5 результатов

Шаг 3: ИСПОЛЬЗУЙ НЕСКОЛЬКО ИСТОЧНИКОВ
  ↓
  База знаний → dejure.org → sozialgerichtsbarkeit.de → bsg.bund.de

Шаг 4: СНЕЖНЫЙ КОМ (Snowballing)
  ↓
  Нашёл документ → смотри его источники → кто на него ссылается?

Шаг 5: ДОКУМЕНТИРУЙ ПУТЬ ПОИСКА
  ↓
  Записывай, где искал, когда, с какими словами
  Это поможет воспроизвести поиск позже
```

---

## 6. Поиск OSINT — быстрая шпаргалка

```
Кто стоит за сайтом?
  whois domain.de
  → Registrar, Admin, DNS

Архивная копия страницы:
  web.archive.org/web/*/https://domain.de/seite
  archive.ph/URL

Метаданные документа (EXIF):
  exiftool dokument.pdf
  → автор, дата создания, программа, ГПС-координаты

Связанные сайты / Subdomains:
  site:domain.de (в Google)

Расширенный поиск в Handelsregister:
  https://www.handelsregister.de → полное имя компании

Персоны в официальных реестрах:
  Bundesanzeiger → компании + публикации
  Transparenzregister → настоящие владельцы (UBO)
```

---

## 7. Чеклисты

### Перед началом поиска
- [ ] Сформулирован конкретный вопрос
- [ ] Определены ключевые слова и синонимы
- [ ] Выбраны релевантные источники
- [ ] Определён критерий "достаточно найдено"

### После поиска / При сохранении результата
- [ ] Сохранена оригинальная ссылка (URL + дата)
- [ ] Создана архивная копия (archive.ph или Wayback)
- [ ] Заполнены метаданные в документе
- [ ] Добавлена перекрёстная ссылка в README папки
- [ ] Верифицировано ≥2 независимыми источниками (если важно)

---

## 8. Полезные горячие клавиши (в VS Code / Obsidian)

| Действие | VS Code | Obsidian |
|---------|---------|---------|
| Поиск по всем файлам | `Ctrl+Shift+F` | `Ctrl+Shift+F` |
| Быстрое открытие файла | `Ctrl+P` | `Ctrl+O` |
| Поиск по текущему файлу | `Ctrl+F` | `Ctrl+F` |
| Заменить во всех файлах | `Ctrl+Shift+H` | — |
| Переход к строке | `Ctrl+G` | — |

---

*Создан: 2026-02-27 | Статус: aktuell*
*Смотри также: [Полное руководство по работе с большими данными](./methoden-grosse-datenmengen.md#9-стратегии-поиска)*
