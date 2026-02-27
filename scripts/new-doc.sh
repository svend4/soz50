#!/usr/bin/env bash
# new-doc.sh — Создать новый документ по шаблону
#
# Использование:
#   bash scripts/new-doc.sh <тип> <путь/к/папке> <название>
#
# Типы: dokument | aktuelles | fallbeispiel
#
# Пример:
#   bash scripts/new-doc.sh aktuelles 03_AKTUELLES/2026/Februar "Buergergeld-Regelsatz-2026"
#   bash scripts/new-doc.sh fallbeispiel 04_FALLBEISPIELE/SGB_II "KdU-Widerspruch-Muenchen"

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TYP="${1:-dokument}"
ZIEL_ORDNER="$ROOT/${2:-}"
TITEL="${3:-Neues-Dokument}"

DATUM="$(date '+%Y-%m-%d')"
DATEINAME="${DATUM}_${TITEL}.md"
ZIEL="$ZIEL_ORDNER/$DATEINAME"

# Выбор шаблона
case "$TYP" in
    aktuelles)
        VORLAGE="$ROOT/00_METHODIK/vorlagen/vorlage-aktuelles.md"
        ;;
    fallbeispiel)
        VORLAGE="$ROOT/00_METHODIK/vorlagen/vorlage-fallbeispiel.md"
        ;;
    *)
        VORLAGE="$ROOT/00_METHODIK/vorlagen/vorlage-dokument.md"
        ;;
esac

# Проверки
if [ ! -d "$ZIEL_ORDNER" ]; then
    echo "Ошибка: папка '$ZIEL_ORDNER' не существует."
    echo "Создать? (y/n)"
    read -r antwort
    if [ "$antwort" = "y" ]; then
        mkdir -p "$ZIEL_ORDNER"
        echo "Папка создана: $ZIEL_ORDNER"
    else
        exit 1
    fi
fi

if [ -f "$ZIEL" ]; then
    echo "Ошибка: файл уже существует: $ZIEL"
    exit 1
fi

# Копируем шаблон и подставляем дату
sed "s/YYYY-MM-DD/$DATUM/g" "$VORLAGE" > "$ZIEL"

echo ""
echo "Документ создан: $ZIEL"
echo ""
echo "Следующие шаги:"
echo "  1. Отредактируй файл: $ZIEL"
echo "  2. Добавь ссылку в: $ZIEL_ORDNER/README.md"
echo "  3. Обнови индекс: bash scripts/gen-index.sh"
echo ""
