#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

backup_dir="${BACKUP_DIR:?Defina BACKUP_DIR con una ruta absoluta para los respaldos}"
env_file="${ENV_FILE:-.env.production}"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"

if [[ "$backup_dir" != /* ]]; then
  echo "BACKUP_DIR debe ser una ruta absoluta." >&2
  exit 1
fi

if [[ ! -d "$backup_dir" ]]; then
  echo "BACKUP_DIR no existe: $backup_dir" >&2
  exit 1
fi

if [[ ! -f "$env_file" ]]; then
  echo "No se encontró el archivo de entorno: $env_file" >&2
  exit 1
fi

compose=(docker compose --env-file "$env_file" -f docker-compose.production.yml)

"${compose[@]}" exec -T db pg_dump -U la_reserva -d la_reserva \
  | gzip > "$backup_dir/la-reserva-db-$timestamp.sql.gz"

docker run --rm \
  -v la-reserva_product_uploads:/source:ro \
  -v "$backup_dir:/backup" \
  alpine:3.21 \
  tar -C /source -czf "/backup/la-reserva-uploads-$timestamp.tar.gz" .

echo "Respaldo creado en $backup_dir"
