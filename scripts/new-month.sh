#!/usr/bin/env bash
# new-month.sh — Создать структуру нового месяца в 03_AKTUELLES
#
# Использование:
#   bash scripts/new-month.sh [YYYY] [Monat]
#
# Пример:
#   bash scripts/new-month.sh 2026 März
#   bash scripts/new-month.sh          # текущий месяц автоматически

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Определяем год и месяц
JAHR="${1:-$(date '+%Y')}"
MONAT_NR=$(date '+%m')
MONAT_DE="${2:-}"

# Немецкие названия месяцев
declare -A MONATE=(
  ["01"]="Januar" ["02"]="Februar" ["03"]="März"
  ["04"]="April"  ["05"]="Mai"     ["06"]="Juni"
  ["07"]="Juli"   ["08"]="August"  ["09"]="September"
  ["10"]="Oktober" ["11"]="November" ["12"]="Dezember"
)

if [ -z "$MONAT_DE" ]; then
  MONAT_DE="${MONATE[$MONAT_NR]}"
fi

ZIEL="$ROOT/03_AKTUELLES/$JAHR/$MONAT_DE"
DATUM="$(date '+%Y-%m-%d')"

if [ -d "$ZIEL" ]; then
  echo "Ordner existiert bereits: $ZIEL"
  exit 0
fi

# Создаём папку года если нет
mkdir -p "$ZIEL"

# README.md для года (если нет)
JAHR_README="$ROOT/03_AKTUELLES/$JAHR/README.md"
if [ ! -f "$JAHR_README" ]; then
cat > "$JAHR_README" << EOF
# Aktuelles $JAHR

[← Aktuelles](../README.md) | [← Главная](../../README.md)

---

## Месяцы

| Месяц | Документы |
|-------|----------|
| [$MONAT_DE](./$MONAT_DE/) | $MONAT_DE $JAHR |

---

## Ключевые изменения $JAHR

*(добавляйте сюда краткое резюме важных изменений)*
EOF
  echo "Jahr-README erstellt: $JAHR_README"
else
  # Добавляем месяц в таблицу года
  echo "Jahr-README existiert — bitte Monat manuell eintragen: $JAHR_README"
fi

# README.md для месяца
cat > "$ZIEL/README.md" << EOF
# $MONAT_DE $JAHR

[← $JAHR](../README.md) | [← Aktuelles](../../README.md)

---

## Документы этого месяца

*(здесь будут документы — добавляй по шаблону)*

---

## Шаблон

Создай файл: \`$JAHR-MM-TT_Thema.md\`

Шаблон: [00_METHODIK/vorlagen/vorlage-aktuelles.md](../../../00_METHODIK/vorlagen/vorlage-aktuelles.md)
EOF

echo ""
echo "Ordner erstellt: $ZIEL"
echo "README erstellt: $ZIEL/README.md"
echo ""
echo "Nächste Schritte:"
echo "  1. Neue Dokumente anlegen: bash scripts/new-doc.sh aktuelles 03_AKTUELLES/$JAHR/$MONAT_DE 'Thema'"
echo "  2. Index aktualisieren: bash scripts/gen-index.sh"
