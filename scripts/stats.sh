#!/usr/bin/env bash
# stats.sh — Статистика базы знаний
# Использование: bash scripts/stats.sh [корневая папка]

set -euo pipefail

ROOT="${1:-$(pwd)}"

echo "======================================"
echo " Wissensbasis — Statistik"
echo " $(date '+%Y-%m-%d %H:%M')"
echo "======================================"
echo ""

# Общее количество файлов
total_md=$(find "$ROOT" -name "*.md" -not -path "*/.git/*" | wc -l)
readme_count=$(find "$ROOT" -name "README.md" -not -path "*/.git/*" | wc -l)
content_count=$((total_md - readme_count))

echo "📄 Dokumente gesamt:     $total_md"
echo "   davon README.md:      $readme_count"
echo "   davon Inhaltsdocs:    $content_count"
echo ""

# По разделам
echo "--- Nach Bereich ---"
for dir in 00_METHODIK 01_SOZIALRECHT 02_SOZIALARBEIT 03_AKTUELLES 04_FALLBEISPIELE 05_RESSOURCEN; do
    if [ -d "$ROOT/$dir" ]; then
        count=$(find "$ROOT/$dir" -name "*.md" -not -path "*/.git/*" 2>/dev/null | wc -l)
        printf "  %-30s %3d Dateien\n" "$dir" "$count"
    fi
done
echo ""

# По типу (из YAML-блока)
echo "--- Nach Dokumenttyp ---"
for typ in Kommentar Fallbeispiel Aktuelles Anleitung Vorlage; do
    count=$(grep -rl "^typ: $typ" "$ROOT" --include="*.md" 2>/dev/null | wc -l)
    printf "  %-20s %3d\n" "$typ" "$count"
done
echo ""

# Fallbeispiele по результату
echo "--- Fallbeispiele nach Ergebnis ---"
for ergebnis in erfolgreich erfolglos laufend; do
    count=$(grep -rl "^ergebnis: $ergebnis" "$ROOT" --include="*.md" 2>/dev/null | wc -l)
    printf "  %-20s %3d\n" "$ergebnis" "$count"
done
echo ""

# Последние добавленные файлы
echo "--- Zuletzt geänderte Dokumente (Top 5) ---"
find "$ROOT" -name "*.md" -not -path "*/.git/*" -not -name "INDEX.md" \
    | xargs ls -lt 2>/dev/null \
    | head -5 \
    | awk '{print "  " $NF}' \
    | sed "s|$ROOT/||"
echo ""

# Размер базы
total_lines=$(find "$ROOT" -name "*.md" -not -path "*/.git/*" \
    | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
echo "📊 Gesamtzeilen (alle .md): $total_lines"
echo ""
echo "======================================"
