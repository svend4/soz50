# 00 Methodik — Методология

[← Главная](../README.md)

Правила, шаблоны и инструкции по работе с базой знаний.

---

## Содержание

| Папка / Файл | Назначение |
|-------------|-----------|
| [vorlagen/](./vorlagen/) | Шаблоны документов |
| [anleitungen/](./anleitungen/) | Инструкции по работе с базой |

---

## Принципы организации

### 1. Иерархия от общего к частному

```
Тема (SGB II)
  └── Подтема (Leistungen)
        └── Конкретный вопрос (KdU-Angemessenheit)
              └── Документ / случай / судебное решение
```

### 2. Имена файлов

```
YYYY-MM-DD_Kurztitel-mit-Bindestrichen.md

Примеры:
  2026-02-27_BSG-Urteil-KdU-Angemessenheit.md
  2026-01-01_Buergergeld-Regelsatz-2026.md
  Widerspruch-Vorlage-Jobcenter.md  (без даты — постоянный документ)
```

### 3. Метаданные в начале каждого файла

Каждый документ начинается с блока метаданных:

```markdown
---
datum: YYYY-MM-DD
typ: Gesetz | Urteil | Kommentar | Vorlage | Fallbeispiel | Aktuelles
thema: SGB II | SGB XII | AsylbLG | ...
schlagworte: [KdU, Angemessenheit, Widerspruch]
quelle: BGBl. / BSG B 14 AS .../... / Link
status: aktuell | veraltet | in-bearbeitung
---
```

### 4. Ссылки между документами

- Всегда используй **относительные ссылки**
- Каждая папка имеет свой `README.md` с навигацией
- Каждый `README.md` содержит ссылку "назад" к родительской папке

---

## Быстрые ссылки

- [Шаблон документа](./vorlagen/vorlage-dokument.md)
- [Шаблон для актуальных новостей](./vorlagen/vorlage-aktuelles.md)
- [Шаблон случая из практики](./vorlagen/vorlage-fallbeispiel.md)
- [Как добавить документ](./anleitungen/wie-dokument-hinzufuegen.md)
- [Как добавить случай](./anleitungen/wie-fallbeispiel-hinzufuegen.md)
- [Методы работы с большими объёмами информации](./anleitungen/methoden-grosse-datenmengen.md)
