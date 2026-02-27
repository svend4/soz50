# Wie füge ich ein Dokument hinzu?
# Как добавить документ?

[← Methodik](../README.md)

---

## Шаг 1: Определи место в структуре

Двигайся от общего к частному:

```
Вопрос: "Сколько платят по Bürgergeld за жильё?"

→ 01_SOZIALRECHT/          (социальное право)
  → 02_SGB_II_Buergergeld/ (Bürgergeld)
    → Leistungen/           (выплаты)
      → ЗДЕСЬ               (конкретный документ про KdU)
```

Если подходящей папки нет — создай её и добавь `README.md`.

---

## Шаг 2: Выбери шаблон

| Тип документа | Шаблон |
|--------------|--------|
| Общий документ (закон, параграф, комментарий) | [vorlage-dokument.md](../vorlagen/vorlage-dokument.md) |
| Актуальное (новый закон, решение) | [vorlage-aktuelles.md](../vorlagen/vorlage-aktuelles.md) |
| Случай из практики | [vorlage-fallbeispiel.md](../vorlagen/vorlage-fallbeispiel.md) |

---

## Шаг 3: Имя файла

```
YYYY-MM-DD_Kurztitel-mit-Bindestrichen.md
```

Постоянные документы (не привязанные к дате):
```
Thema-Stichwort.md
```

---

## Шаг 4: Заполни метаданные

Каждый файл начинается с блока:

```yaml
---
datum: 2026-02-27
typ: Kommentar
thema: SGB II
schlagworte: [KdU, Angemessenheit]
quelle: BSG B 14 AS 50/20 R
status: aktuell
---
```

---

## Шаг 5: Добавь ссылку в README.md папки

Открой `README.md` той папки, куда добавил документ, и добавь строку в таблицу:

```
| Dateiname.md | Kurzbeschreibung |
```
*(Markdown-Syntax: `[Dateiname.md](./Dateiname.md)`)*

---

## Шаг 6: Добавь перекрёстные ссылки

Если документ связан с другими разделами — добавь ссылки в раздел "Смотри также".

---

## Автоматизация

Скрипт `scripts/gen-index.sh` автоматически обновляет индексы.
Запусти после добавления документов:

```bash
bash scripts/gen-index.sh
```
