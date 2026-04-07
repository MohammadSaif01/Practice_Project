#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

WITH_EDGE="${1:-}"

if [[ ! -f ".env.prod" ]]; then
  echo "Missing .env.prod. Creating from .env.prod.example..."
  cp .env.prod.example .env.prod
  echo "Update .env.prod and run again."
  exit 1
fi

if [[ "$WITH_EDGE" == "--with-edge" ]]; then
  docker compose --env-file .env.prod -f docker-compose.prod.yml -f docker-compose.edge.yml up -d --build
  docker compose --env-file .env.prod -f docker-compose.prod.yml -f docker-compose.edge.yml ps
else
  docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
  docker compose --env-file .env.prod -f docker-compose.prod.yml ps
fi
