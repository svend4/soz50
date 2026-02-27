#!/usr/bin/env bash
# wartung.sh — Скрипт обслуживания базы знаний
# Проверяет качество документов: метаданные, ссылки, устаревшие файлы
# Использование: bash scripts/wartung.sh [корневая папка]

set -euo pipefail

ROOT="${1:-$(pwd)}"
REPORT="$ROOT/WARTUNG-BERICHT.md"
ERRORS=0
WARNINGS=0

# Цвета для вывода в терминал
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_error()   { echo -e "${RED}[FEHLER]${NC} $*"; ERRORS=$((ERRORS + 1)); }
log_warn()    { echo -e "${YELLOW}[WARNUNG]${NC} $*"; WARNINGS=$((WARNINGS + 1)); }
log_ok()      { echo -e "${GREEN}[OK]${NC} $*"; }
log_info()    { echo -e "${BLUE}[INFO]${NC} $*"; }

echo "=============================================="
echo " Wartung der Wissensdatenbank"
echo " Обслуживание базы знаний"
echo " $(date '+%Y-%m-%d %H:%M')"
echo "=============================================="
echo ""

# Начало отчёта
{
echo "# Wartungsbericht / Отчёт об обслуживании"
echo ""
echo "> Автоматически сгенерирован: $(date '+%Y-%m-%d %H:%M')"
echo ""
echo "[← Главная](./README.md)"
echo ""
echo "---"
echo ""
} > "$REPORT"

# ── 1. Проверка метаданных ──────────────────────────────────────────────────
echo "── 1. Проверка метаданных в документах ──"
{
echo "## 1. Метаданные документов"
echo ""
echo "| Файл | Проблема |"
echo "|------|---------|"
} >> "$REPORT"

MISSING_META=0
while IFS= read -r file; do
    rel="${file#$ROOT/}"

    # Пропускаем шаблоны, системные файлы и README (навигационные, без YAML)
    if [[ "$file" == *"/vorlagen/"* ]] || \
       [[ "$rel" == "INDEX.md" ]] || \
       [[ "$rel" == "WARTUNG-BERICHT.md" ]] || \
       [[ "$(basename "$file")" == "README.md" ]]; then
        continue
    fi

    has_yaml=false
    missing_fields=()

    # Проверяем наличие YAML-блока
    if grep -q "^---" "$file" 2>/dev/null; then
        has_yaml=true
    fi

    if ! $has_yaml; then
        log_warn "Нет YAML-метаданных: $rel"
        echo "| \`$rel\` | Нет YAML-блока метаданных |" >> "$REPORT"
        MISSING_META=$((MISSING_META + 1))
        continue
    fi

    # Проверяем обязательные поля
    for field in datum typ thema status; do
        if ! grep -q "^${field}:" "$file" 2>/dev/null; then
            missing_fields+=("$field")
        fi
    done

    # Проверка статуса in-bearbeitung (может быть давно)
    if grep -q "^status: in-bearbeitung" "$file" 2>/dev/null; then
        datum=$(grep -m1 "^datum:" "$file" 2>/dev/null | sed 's/datum: *//' || echo "")
        log_warn "Статус 'in-bearbeitung' с $datum: $rel"
        echo "| \`$rel\` | Статус: in-bearbeitung (с $datum) |" >> "$REPORT"
        WARNINGS=$((WARNINGS + 1))
    fi

    if [ ${#missing_fields[@]} -gt 0 ]; then
        fields_str=$(IFS=', '; echo "${missing_fields[*]}")
        log_warn "Отсутствуют поля [$fields_str]: $rel"
        echo "| \`$rel\` | Отсутствуют поля: $fields_str |" >> "$REPORT"
        MISSING_META=$((MISSING_META + 1))
    fi

done < <(find "$ROOT" -name "*.md" \
    -not -path "*/.git/*" \
    -not -name "INDEX.md" \
    -not -name "WARTUNG-BERICHT.md" \
    | sort)

if [ "$MISSING_META" -eq 0 ]; then
    log_ok "Все документы имеют корректные метаданные"
    echo "| — | Все документы в порядке ✅ |" >> "$REPORT"
fi
echo "" >> "$REPORT"

# ── 2. Проверка внутренних ссылок ──────────────────────────────────────────
echo ""
echo "── 2. Проверка внутренних ссылок ──"
{
echo "## 2. Внутренние ссылки"
echo ""
echo "| Файл | Сломанная ссылка |"
echo "|------|----------------|"
} >> "$REPORT"

BROKEN_LINKS=0
while IFS= read -r file; do
    rel="${file#$ROOT/}"
    dir=$(dirname "$file")

    # Пропускаем шаблоны (vorlagen/) — там placeholder-ссылки
    [[ "$file" == *"/vorlagen/"* ]] && continue

    # Извлекаем все внутренние Markdown-ссылки (не HTTP)
    # Примечание: ссылки внутри code-блоков тоже захватываются (ограничение grep)
    # Workaround: пропускаем ссылки на явно несуществующие placeholder-имена
    while IFS= read -r link; do
        # Убираем якоря (#...)
        target="${link%%#*}"
        [ -z "$target" ] && continue

        # Пропускаем placeholder-имена (не реальные файлы)
        filename_only="${target##*/}"
        case "$filename_only" in
            Dateiname.md|YYYY-MM-DD_Titel.md|Beispiel.md|placeholder.md) continue ;;
        esac

        # Строим абсолютный путь
        if [[ "$target" == /* ]]; then
            abs_path="$ROOT$target"
        else
            abs_path="$dir/$target"
        fi

        # Нормализуем путь
        abs_path=$(realpath -m "$abs_path" 2>/dev/null || echo "$abs_path")

        if [ ! -e "$abs_path" ]; then
            log_error "Сломана ссылка [$link] в: $rel"
            echo "| \`$rel\` | \`$link\` — файл не найден |" >> "$REPORT"
            BROKEN_LINKS=$((BROKEN_LINKS + 1))
        fi
    done < <(grep -oP '\]\(\K[^)]+' "$file" 2>/dev/null | grep -v "^http" | grep -v "^mailto" || true)

done < <(find "$ROOT" -name "*.md" \
    -not -path "*/.git/*" \
    -not -name "WARTUNG-BERICHT.md" \
    | sort)

if [ "$BROKEN_LINKS" -eq 0 ]; then
    log_ok "Сломанных ссылок не найдено"
    echo "| — | Все ссылки корректны ✅ |" >> "$REPORT"
fi
echo "" >> "$REPORT"

# ── 3. Поиск документов без README-ссылки ──────────────────────────────────
echo ""
echo "── 3. Документы, не упомянутые в README своей папки ──"
{
echo "## 3. Документы без ссылки в README"
echo ""
echo "| Документ | Папка README |"
echo "|---------|-------------|"
} >> "$REPORT"

UNLINKED=0
while IFS= read -r file; do
    rel="${file#$ROOT/}"
    dir=$(dirname "$file")
    readme="$dir/README.md"
    filename=$(basename "$file")

    # Пропускаем README и системные файлы
    [[ "$filename" == "README.md" ]] && continue
    [[ "$rel" == "INDEX.md" ]] && continue
    [[ "$rel" == "WARTUNG-BERICHT.md" ]] && continue
    [[ "$file" == *"/vorlagen/"* ]] && continue

    if [ -f "$readme" ]; then
        if ! grep -qF "$filename" "$readme" 2>/dev/null; then
            log_warn "Не упомянут в README: $rel"
            echo "| \`$rel\` | Не найден в \`${readme#$ROOT/}\` |" >> "$REPORT"
            UNLINKED=$((UNLINKED + 1))
        fi
    fi
done < <(find "$ROOT" -name "*.md" \
    -not -path "*/.git/*" \
    | sort)

if [ "$UNLINKED" -eq 0 ]; then
    log_ok "Все документы упомянуты в своих README"
    echo "| — | Все документы в README ✅ |" >> "$REPORT"
fi
echo "" >> "$REPORT"

# ── 4. Поиск пустых папок ──────────────────────────────────────────────────
echo ""
echo "── 4. Пустые папки ──"
{
echo "## 4. Пустые папки"
echo ""
} >> "$REPORT"

EMPTY_DIRS=0
while IFS= read -r dir; do
    rel="${dir#$ROOT/}"
    # Считаем файлы (без .git)
    count=$(find "$dir" -maxdepth 1 -name "*.md" | wc -l)
    if [ "$count" -eq 0 ]; then
        log_warn "Пустая папка (нет .md): $rel"
        echo "- \`$rel\` — нет .md файлов" >> "$REPORT"
        EMPTY_DIRS=$((EMPTY_DIRS + 1))
    fi
done < <(find "$ROOT" -mindepth 1 -type d \
    -not -path "*/.git*" \
    -not -path "*/scripts*" \
    | sort)

if [ "$EMPTY_DIRS" -eq 0 ]; then
    log_ok "Пустых папок нет"
    echo "Пустых папок не найдено ✅" >> "$REPORT"
fi
echo "" >> "$REPORT"

# ── 5. Статистика базы ─────────────────────────────────────────────────────
echo ""
echo "── 5. Статистика ──"
total_md=$(find "$ROOT" -name "*.md" -not -path "*/.git/*" | wc -l)
total_dirs=$(find "$ROOT" -type d -not -path "*/.git*" -not -path "*/scripts*" | wc -l)
aktuell=$(find "$ROOT" -name "*.md" -not -path "*/.git/*" \
    -exec grep -l "^status: aktuell" {} \; 2>/dev/null | wc -l)
veraltet=$(find "$ROOT" -name "*.md" -not -path "*/.git/*" \
    -exec grep -l "^status: veraltet" {} \; 2>/dev/null | wc -l)
in_bear=$(find "$ROOT" -name "*.md" -not -path "*/.git/*" \
    -exec grep -l "^status: in-bearbeitung" {} \; 2>/dev/null | wc -l)

{
echo "## 5. Статистика базы знаний"
echo ""
echo "| Показатель | Значение |"
echo "|-----------|---------|"
echo "| Всего документов (.md) | $total_md |"
echo "| Всего папок | $total_dirs |"
echo "| Статус: aktuell | $aktuell |"
echo "| Статус: veraltet | $veraltet |"
echo "| Статус: in-bearbeitung | $in_bear |"
echo ""
} >> "$REPORT"

log_info "Документов: $total_md | Папок: $total_dirs | aktuell: $aktuell | veraltet: $veraltet"

# ── Итоговый отчёт ─────────────────────────────────────────────────────────
echo ""
echo "=============================================="
{
echo "---"
echo ""
echo "## Итог / Zusammenfassung"
echo ""
echo "| | Количество |"
echo "|-|-----------|"
echo "| 🔴 Ошибки (Fehler) | $ERRORS |"
echo "| 🟡 Предупреждения (Warnungen) | $WARNINGS |"
echo ""
echo "---"
echo ""
echo "*Отчёт сгенерирован: $(date '+%Y-%m-%d %H:%M')*"
echo "*Скрипт: \`scripts/wartung.sh\`*"
} >> "$REPORT"

if [ "$ERRORS" -gt 0 ]; then
    echo -e "${RED}Итог: $ERRORS ошибок, $WARNINGS предупреждений${NC}"
    echo -e "Отчёт: $REPORT"
    exit 1
elif [ "$WARNINGS" -gt 0 ]; then
    echo -e "${YELLOW}Итог: 0 ошибок, $WARNINGS предупреждений${NC}"
    echo -e "Отчёт: $REPORT"
    exit 0
else
    echo -e "${GREEN}Итог: всё в порядке ✅${NC}"
    echo -e "Отчёт: $REPORT"
    exit 0
fi
