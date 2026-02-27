#!/usr/bin/env bash
# check-links.sh — Проверка внутренних ссылок в базе знаний
# Использование: bash scripts/check-links.sh [корневая папка]
# Ищет битые относительные ссылки в Markdown-файлах

set -euo pipefail

ROOT="${1:-$(pwd)}"
ERRORS=0
CHECKED=0

echo "======================================"
echo " Link-Checker — Interne Links"
echo " $(date '+%Y-%m-%d %H:%M')"
echo "======================================"
echo ""

# Находим все .md файлы
while IFS= read -r file; do
    dir=$(dirname "$file")

    # Извлекаем все ссылки вида [text](./path) или [text](../path)
    while IFS= read -r link; do
        CHECKED=$((CHECKED + 1))

        # Убираем якоря (#section)
        link_clean="${link%%#*}"

        # Пропускаем пустые и внешние ссылки (http, mailto)
        if [[ -z "$link_clean" ]] || [[ "$link_clean" == http* ]] || [[ "$link_clean" == mailto* ]]; then
            continue
        fi

        # Строим абсолютный путь
        if [[ "$link_clean" == /* ]]; then
            target="$ROOT$link_clean"
        else
            target="$dir/$link_clean"
        fi

        # Нормализуем путь
        # Используем python если доступен, иначе простая проверка
        if command -v python3 &>/dev/null; then
            target=$(python3 -c "import os; print(os.path.normpath('$target'))" 2>/dev/null || echo "$target")
        fi

        # Проверяем существование
        if [[ ! -e "$target" ]]; then
            echo "  FEHLER: $file"
            echo "          → Link: $link_clean"
            echo "          → Erwartet: $target"
            echo ""
            ERRORS=$((ERRORS + 1))
        fi

    done < <(grep -oP '\[.*?\]\(\K[^)]+' "$file" 2>/dev/null || true)

done < <(find "$ROOT" -name "*.md" -not -path "*/.git/*" | sort)

echo "======================================"
echo "Geprüfte Links: $CHECKED"
if [[ $ERRORS -eq 0 ]]; then
    echo "✓ Alle internen Links OK!"
else
    echo "✗ Fehler gefunden: $ERRORS"
    echo "  Bitte oben aufgeführte Links korrigieren."
fi
echo "======================================"
