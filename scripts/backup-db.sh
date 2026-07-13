#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

CONTAINER_NAME="${POSTGRES_CONTAINER:-hexa-postgres}"
POSTGRES_DB_NAME="${POSTGRES_DB:-hexa}"
POSTGRES_USER_NAME="${POSTGRES_USER:-hexa}"
POSTGRES_PASSWORD_VALUE="${POSTGRES_PASSWORD:-hexa}"
CONTAINER_DUMP_PATH="//tmp/hexa.dump"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
OUTPUT_PATH="${1:-$ROOT_DIR/backups/hexa-$TIMESTAMP.dump}"

case "$OUTPUT_PATH" in
  /*|[A-Za-z]:/*) ;;
  *) OUTPUT_PATH="$ROOT_DIR/$OUTPUT_PATH" ;;
esac

mkdir -p "$(dirname "$OUTPUT_PATH")"

OUTPUT_DIR="$(dirname "$OUTPUT_PATH")"
OUTPUT_FILE="$(basename "$OUTPUT_PATH")"
COPIED_DUMP_PATH="$OUTPUT_DIR/hexa.dump"

docker exec -e PGPASSWORD="$POSTGRES_PASSWORD_VALUE" "$CONTAINER_NAME" \
  pg_dump -h localhost -U "$POSTGRES_USER_NAME" -d "$POSTGRES_DB_NAME" -Fc -f "$CONTAINER_DUMP_PATH"

rm -f "$COPIED_DUMP_PATH" "$OUTPUT_PATH"
docker cp "$CONTAINER_NAME:$CONTAINER_DUMP_PATH" "$OUTPUT_DIR/"
mv "$COPIED_DUMP_PATH" "$OUTPUT_DIR/$OUTPUT_FILE"
docker exec "$CONTAINER_NAME" rm -f "$CONTAINER_DUMP_PATH"

printf 'Backup written to %s\n' "$OUTPUT_PATH"
