---
datum: YYYY-MM-DD
typ: Vorlage
thema: Menschenrechte
schlagworte: [Menschenrechte, Dokumentation, Rechtsverletzung, Anonymisiert]
status: aktuell
---

# Шаблон: Документирование нарушения прав / Rechtsverletzung-Dokumentation

[← Vorlagen](./README.md) | [← Methodik](../README.md)

> Для правозащитников, адвокатов, НКО и социальных работников.
> Основано на международных стандартах документирования нарушений прав человека.
>
> ⚠️ **Все личные данные хранить отдельно, зашифровано. Этот файл содержит только анонимизированные данные.**

---

## Шаблон для копирования

Имя файла: `FALL-YYYY-NNN_Kurztitel.md`

```yaml
---
fall_id: FALL-YYYY-NNN
datum_ereignis: YYYY-MM-DD       # дата нарушения
datum_erfassung: YYYY-MM-DD      # дата записи в базу
datum_letzte_aenderung: YYYY-MM-DD
erfasst_von: [Kürzel-Sachbearbeiter]
status: erfasst | in-bearbeitung | verifiziert | gemeldet | abgeschlossen | archiviert
vertraulichkeit: intern | vertraulich | geheim
anonymisiert: ja                 # ОБЯЗАТЕЛЬНО ja перед добавлением в базу
themen: [SGB-II, Menschenrechte, ...]
---
```

# Fall: [Краткое описание без имён]

## 1. Краткое резюме (Zusammenfassung)

*(1-3 предложения: что произошло, кто пострадал, кто ответственен)*

**Тип нарушения:** Diskriminierung | Rechtswidriger Bescheid | Körperverletzung | Inhaftierung | Abschiebung | Zwangsräumung | Sonstiges

**Ответственный орган / Akteur:**

**Последствия для пострадавшего:**

---

## 2. Пострадавшие (Betroffene) — только анонимно

*(Если несколько пострадавших — повтори блок)*

| Поле | Значение |
|------|---------|
| ID пострадавшего | `OP-YYYY-NNN` |
| Пол | m / w / divers / unbekannt |
| Возраст (приблизительно) | ca. XX Jahre |
| Правовой статус | Bürgergeld-Bezug / Asylbewerber / Obdachlos / ... |
| Место | [город / район — не точный адрес] |
| Уязвимые факторы | Minderjährig / Krankheit / Behinderung / Schwangerschaft / ... |

⚠️ Полные персональные данные: `PERSONALDATEN/OP-YYYY-NNN` [зашифровано, отдельно]

---

## 3. Описание события (Sachverhalt)

*(Хронологически. Только факты, без оценок. Кто? Что? Где? Когда? Как?)*

### Предшествующие обстоятельства

### Событие

**Дата и время:** YYYY-MM-DD, ca. HH:MM Uhr
**Место:** [общее описание — не точный адрес]
**Участники со стороны власти / Behörde:**

### Непосредственные последствия

---

## 4. Доказательства (Beweise)

| ID | Тип | Описание | Хранение | Хеш-сумма | Достоверность |
|----|-----|---------|---------|----------|--------------|
| `BEW-YYYY-001` | Foto | | verschlüsselt | SHA256:... | hoch |
| `BEW-YYYY-002` | Zeuge | Aussage Zeuge `ZG-001` | verschlüsselt | — | mittel |
| `BEW-YYYY-003` | Dokument | Bescheid vom YYYY-MM-DD | Originaldatei | SHA256:... | hoch |

**Цепочка хранения доказательств (Chain of Custody):**
- [ ] Все доказательства получены с сохранением оригиналов
- [ ] Хеш-суммы созданы при получении
- [ ] Журнал доступа ведётся
- [ ] Резервные копии: минимум 3 копии в 2 местах

---

## 5. Свидетели (Zeugen) — только анонимно

| ID | Тип | Степень надёжности | Согласие на показания |
|----|-----|-------------------|-----------------------|
| `ZG-001` | Augenzeuge | hoch | ja / nein / eingeschränkt |

⚠️ Контактные данные свидетелей: `PERSONALDATEN/ZG-YYYY-NNN` [зашифровано, отдельно]

---

## 6. Правовой анализ (Rechtliche Einordnung)

### Нарушенные нормы

| Норма | Содержание | Как нарушена |
|-------|-----------|-------------|
| GG Art. 1 | Menschenwürde | |
| EMRK Art. 3 | Folterverbot | |
| § XX SGB II | | |

### Ответственность

**Прямая ответственность (Unmittelbare Verantwortung):**

**Институциональная ответственность:**

**Надзорный орган:**

---

## 7. Предпринятые и запланированные шаги

### Уже предпринято

- [ ] Дата: YYYY-MM-DD — [действие]
- [ ] Widerspruch eingereicht: YYYY-MM-DD (Frist: YYYY-MM-DD)
- [ ] Strafanzeige: YYYY-MM-DD bei [Behörde]
- [ ] Dienstaufsichtsbeschwerde: YYYY-MM-DD

### Запланировано

- [ ] Klage bis: YYYY-MM-DD
- [ ] Meldung an: [UN / EGMR / Ombudsmann / Presse]
- [ ] Vernetzung mit: [Organisationen]

### Сроки (Fristen) — КРИТИЧЕСКИ ВАЖНО

| Фриcт | Дата | Статус |
|-------|------|--------|
| Widerspruchsfrist | YYYY-MM-DD | ⚠️ ausstehend |
| Klagefrist | YYYY-MM-DD | |

---

## 8. Сообщения и публичность (Meldungen)

| Дата | Куда | Форма | Статус | Ответ |
|------|------|-------|--------|-------|
| YYYY-MM-DD | Ombudsmann | Schriftlich | eingereicht | ausstehend |
| YYYY-MM-DD | Presse (anonym) | Hintergrundgespräch | | |

---

## 9. Итог (Ergebnis)

*(Заполняется по завершении дела)*

**Итог для пострадавшего:**

**Итог правовой / Rechtlicher Ausgang:**

**Прецедентное значение:**

---

## 10. Чему учит этот случай (Lessons Learned)

*(Что важно для аналогичных случаев? Какие методы сработали? Что изменить?)*

---

## Смотри также

- [Аналогичные случаи](../../04_FALLBEISPIELE/)
- [Правовые нормы](../../01_SOZIALRECHT/)
- [Методы документирования](../anleitungen/methoden-grosse-datenmengen.md#5-методы-для-правозащитников)

---

*Создан: YYYY-MM-DD | Статус: erfasst*
*Все персональные данные хранятся отдельно, зашифровано. Этот файл — анонимизированный.*
