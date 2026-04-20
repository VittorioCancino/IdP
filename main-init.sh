#!/usr/bin/env bash

set -Eeuo pipefail

readonly SPINNER_FRAMES=(
  '|'
  '/'
  '-'
  '\\'
)

spinner_active=0

cleanup() {
  if ((spinner_active)); then
    printf '\n'
  fi
}

fail() {
  printf 'Error: %s\n' "$1" >&2
  exit 1
}

log_step() {
  printf '\n==> %s\n' "$1"
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

wait_for_postgres() {
  local timeout_seconds="${1:-60}"
  local message="${2:-Waiting for PostgreSQL to accept connections}"
  local start_time=$SECONDS
  local frame_index=0

  spinner_active=1

  while true; do
    if docker compose exec -T hydra-postgres sh -c \
      'pg_isready -h 127.0.0.1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
      >/dev/null 2>&1; then
      spinner_active=0
      printf '\r%s done.\033[K\n' "$message"
      return 0
    fi

    if ((SECONDS - start_time >= timeout_seconds)); then
      spinner_active=0
      printf '\r%s timed out after %ss.\033[K\n' "$message" "$timeout_seconds" >&2
      return 1
    fi

    printf '\r%s %s' \
      "$message" \
      "${SPINNER_FRAMES[frame_index % ${#SPINNER_FRAMES[@]}]}"
    sleep 0.1
    ((frame_index += 1))
  done
}

main() {
  trap cleanup EXIT INT TERM

  require_command docker

  [[ -f .env ]] || fail 'Missing .env. Copy .env.example to .env before running this script.'
  docker compose version >/dev/null 2>&1 || fail 'Docker Compose plugin is required.'
  docker compose config >/dev/null

  log_step 'Resetting full Docker stack'
  docker compose down -v --remove-orphans

  log_step 'Starting Hydra PostgreSQL'
  docker compose up -d hydra-postgres

  printf '\n'
  wait_for_postgres 60 'Waiting for Hydra PostgreSQL to accept connections'

  log_step 'Running Hydra migrations'
  docker compose run --rm hydra migrate sql up -e --yes --config /etc/config/hydra/hydra.yml

  log_step 'Starting full platform'
  docker compose up --build
}

main "$@"
