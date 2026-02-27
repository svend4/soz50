---
datum: 2026-02-27
typ: Ressource
thema: Allgemein
schlagworte: [Tools, Software, Informationsmanagement, Recherche, OSINT]
status: aktuell
---

# Инструменты для работы с информацией — Справочник
# Tools für Informationsmanagement — Referenz

[← Ressourcen](../README.md)

> Практический справочник программ и платформ. Обновляется по мере появления новых инструментов.

---

## Управление знаниями (Wissensmanagement)

| Инструмент | Лицензия | Особенности | Для кого |
|-----------|---------|-------------|----------|
| **Obsidian** | Freemium | Markdown, граф связей, плагины | Личная база знаний |
| **Zettlr** | Open Source | Markdown, академическое письмо, Zotero | Исследователи |
| **Logseq** | Open Source | Граф знаний, ежедневные заметки | Личная база |
| **Joplin** | Open Source | Зашифрованные заметки, Nextcloud sync | Конфиденциальное |
| **Notion** | Freemium | Гибкие БД, командная работа | Команды |
| **DokuWiki** | Open Source | Вики, плоские файлы, selfhosted | Команды |
| **MediaWiki** | Open Source | Как Wikipedia, масштабируемо | Большие команды |

---

## Управление литературой (Literaturverwaltung)

| Инструмент | Лицензия | Формат | Для кого |
|-----------|---------|--------|----------|
| **Zotero** | Open Source | BibTeX, RIS | Все исследователи |
| **JabRef** | Open Source | BibTeX | LaTeX-пользователи |
| **Citavi** | Платно (Bildungsrabatt) | Proprietary | Немецкие вузы |
| **Mendeley** | Бесплатно | BibTeX, RIS | Социальная функция |

---

## Управление документами (Dokumentenmanagement)

| Инструмент | Тип | Описание |
|-----------|-----|---------|
| **Paperless-ngx** | Selfhosted | OCR, теги, полнотекстовый поиск; ideal für Scanns |
| **Nextcloud** | Selfhosted / Cloud | Файлы + совместная работа + задачи |
| **Alfresco Community** | Selfhosted | Enterprise DMS, open source версия |

---

## OSINT и расследовательские инструменты

| Инструмент | Применение | Тип |
|-----------|-----------|-----|
| **Maltego** | Граф связей между объектами | Коммерческий |
| **SpiderFoot** | Автоматический OSINT | Open Source |
| **Shodan** | Поиск по интернет-устройствам | Freemium |
| **ExifTool** | Метаданные файлов и фото | Open Source |
| **Tabula** | Извлечение таблиц из PDF | Open Source |
| **OpenRefine** | Очистка и нормализация данных | Open Source |
| **ICIJ Datashare** | Анализ больших массивов документов | Open Source |
| **Overview** | Кластеризация документов | Open Source |

---

## Правозащитные инструменты (Menschenrechtsarbeit)

| Инструмент | Применение |
|-----------|-----------|
| **Uwazi** | Платформа для документирования нарушений прав |
| **KoBoToolbox** | Мобильный сбор данных в поле (оффлайн) |
| **ODK (Open Data Kit)** | Структурированные формы для полевой работы |
| **ActivityInfo** | Гуманитарный мониторинг, М&Е |

**Ссылки:**
- Uwazi: https://uwazi.io
- KoBoToolbox: https://www.kobotoolbox.org
- ODK: https://getodk.org

---

## Безопасность и конфиденциальность

| Инструмент | Применение |
|-----------|-----------|
| **VeraCrypt** | Шифрование файлов и дисков |
| **KeePassXC** | Менеджер паролей (локальный) |
| **Bitwarden** | Менеджер паролей (облако, open source) |
| **Signal** | Зашифрованная коммуникация |
| **ProtonMail** | Зашифрованная почта |
| **OnionShare** | Анонимная передача файлов через Tor |
| **Tails OS** | Операционная система без следов |

---

## OCR и обработка документов

| Инструмент | Применение |
|-----------|-----------|
| **Tesseract** | Open source OCR, немецкий язык |
| **OCRmyPDF** | Добавляет текстовый слой в PDF |
| **ABBYY FineReader** | Коммерческий, высокое качество |

```bash
# Добавить OCR-слой к немецкому PDF:
ocrmypdf --language deu eingabe.pdf ausgabe.pdf
```

---

## Поиск и индексирование

| Инструмент | Применение |
|-----------|-----------|
| **ripgrep (rg)** | Очень быстрый поиск по файлам |
| **fzf** | Интерактивный нечёткий поиск |
| **Elasticsearch** | Масштабируемый полнотекстовый поиск |
| **Typesense** | Быстрый поиск, проще Elasticsearch |
| **MeiliSearch** | Open source, лёгкое развёртывание |

---

## Управление задачами и проектами

| Инструмент | Тип | Применение |
|-----------|-----|-----------|
| **Nextcloud Tasks** | Selfhosted | CalDAV, интеграция с календарём |
| **Trello** | Cloud | Доски, карточки, сроки |
| **Wekan** | Selfhosted | Open source альтернатива Trello |
| **Jira** | Cloud | Для крупных команд |

---

## Для исследователей — систематические обзоры

| Инструмент | Применение |
|-----------|-----------|
| **Rayyan** | Скрининг статей для систематических обзоров |
| **Covidence** | Полный workflow систематического обзора |
| **CADIMA** | Бесплатный, немецкий |
| **Distiller SR** | Коммерческий |

---

## Немецкие специализированные базы данных

| Ресурс | Содержание | URL |
|--------|-----------|-----|
| **gesetze-im-internet.de** | Все федеральные законы | https://www.gesetze-im-internet.de |
| **sozialgerichtsbarkeit.de** | Решения социальных судов | https://www.sozialgerichtsbarkeit.de |
| **dejure.org** | Законы + практика + перекрёстные ссылки | https://dejure.org |
| **juris.de** | Комплексная юридическая база (частично платно) | https://www.juris.de |
| **beck-online.de** | Комментарии Beck (платно) | https://beck-online.de |
| **Bundesanzeiger** | Официальные объявления | https://www.bundesanzeiger.de |
| **Handelsregister** | Реестр компаний | https://www.handelsregister.de |

---

## Веб-архивирование

| Инструмент | Применение |
|-----------|-----------|
| **web.archive.org** | Архивные версии сайтов |
| **archive.ph** | Быстрое архивирование страниц |
| **HTTrack** | Скачать сайт полностью (локально) |
| **Wget** | Командная строка, рекурсивная загрузка |

```bash
# Сохранить страницу с зависимостями:
wget --mirror --convert-links --page-requisites URL
```

---

## Версионирование и резервное копирование

| Инструмент | Применение |
|-----------|-----------|
| **Git** | Версионирование текстовых файлов (как эта база) |
| **Restic** | Зашифрованные резервные копии |
| **BorgBackup** | Дедупликация + шифрование |
| **rclone** | Синхронизация с облачными хранилищами |

---

*Создан: 2026-02-27 | Статус: aktuell*
*Смотри также: [Методы работы с большими данными](../../00_METHODIK/anleitungen/methoden-grosse-datenmengen.md)*
