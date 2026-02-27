#!/usr/bin/env bash
# gen-index.sh — Генератор индекса всех документов базы знаний
# Использование: bash scripts/gen-index.sh [корневая папка]
# По умолчанию ищет в текущей директории

set -euo pipefail

ROOT="${1:-$(pwd)}"
OUTPUT="$ROOT/INDEX.md"

echo "# INDEX — Полный индекс документов"  > "$OUTPUT"
echo ""                                    >> "$OUTPUT"
echo "> Автоматически сгенерировано: $(date '+%Y-%m-%d %H:%M')" >> "$OUTPUT"
echo ""                                    >> "$OUTPUT"
echo "[← Главная](./README.md)"           >> "$OUTPUT"
echo ""                                    >> "$OUTPUT"
echo "---"                                >> "$OUTPUT"
echo ""                                    >> "$OUTPUT"

# Дерево папок и файлов (исключаем .git и scripts)
echo "## Структура"                        >> "$OUTPUT"
echo ""                                    >> "$OUTPUT"
echo '```'                                 >> "$OUTPUT"
find "$ROOT" \
    -not -path "*/.git/*" \
    -not -path "*/scripts/*" \
    -not -name ".gitkeep" \
    | sort \
    | sed "s|$ROOT/||" \
    | sed "s|$ROOT||" \
    | grep -v "^$" \
    >> "$OUTPUT"
echo '```'                                 >> "$OUTPUT"
echo ""                                    >> "$OUTPUT"

# Список всех .md файлов с метаданными
echo "---"                                >> "$OUTPUT"
echo ""                                    >> "$OUTPUT"
echo "## Все документы"                    >> "$OUTPUT"
echo ""                                    >> "$OUTPUT"
echo "| Файл | Тема | Дата | Тип |"        >> "$OUTPUT"
echo "|------|------|------|-----|"         >> "$OUTPUT"

find "$ROOT" -name "*.md" \
    -not -path "*/.git/*" \
    -not -name "INDEX.md" \
    | sort \
    | while read -r file; do
        rel="${file#$ROOT/}"

        # Читаем метаданные из YAML-блока
        datum=$(grep -m1 "^datum:" "$file" 2>/dev/null | sed 's/datum: *//' || echo "—")
        typ=$(grep -m1 "^typ:" "$file" 2>/dev/null | sed 's/typ: *//' || echo "—")
        thema=$(grep -m1 "^thema:" "$file" 2>/dev/null | sed 's/thema: *//' || echo "—")

        # Первый заголовок файла как название
        title=$(grep -m1 "^# " "$file" 2>/dev/null | sed 's/^# //' || echo "$rel")

        echo "| [$title](./$rel) | $thema | $datum | $typ |" >> "$OUTPUT"
    done

echo ""                                    >> "$OUTPUT"
echo "---"                                >> "$OUTPUT"
echo "*Сгенерировано: $(date '+%Y-%m-%d')*" >> "$OUTPUT"

echo "Index сгенерирован: $OUTPUT"
