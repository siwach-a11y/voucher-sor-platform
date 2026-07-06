#!/bin/sh
# Entrypoint for infra/docker/api-demo.Dockerfile — the single-container, free-tier demo deployment.
# No external Postgres/Redis: this container bundles its own ephemeral Postgres, seeds it fresh on
# every cold start, then runs the Fastify API in the foreground. Data does not persist across
# restarts/cold starts by design (see docs — this is a demo, not the production architecture).
set -e

PGDATA=${PGDATA:-/var/lib/postgresql/data}

# Alpine's postgresql package doesn't create this (unlike Debian's, which does via init scripts),
# and /run may be a fresh tmpfs each container start, so this can't just be done once at build time.
mkdir -p /run/postgresql
chown postgres:postgres /run/postgresql

if [ ! -s "$PGDATA/PG_VERSION" ]; then
  echo "[demo-entrypoint] Initializing fresh Postgres data directory..."
  su-exec postgres initdb -D "$PGDATA" --auth=trust >/tmp/initdb.log 2>&1
fi

echo "[demo-entrypoint] Starting Postgres..."
if ! su-exec postgres pg_ctl -D "$PGDATA" -l /tmp/postgres.log -o "-c listen_addresses=127.0.0.1 -c port=5432" -w start; then
  echo "[demo-entrypoint] pg_ctl start failed — postgres log follows:" >&2
  cat /tmp/postgres.log >&2
  exit 1
fi

echo "[demo-entrypoint] Waiting for Postgres to accept connections..."
i=0
until su-exec postgres pg_isready -q; do
  i=$((i + 1))
  if [ "$i" -ge 30 ]; then
    echo "[demo-entrypoint] Postgres did not become ready in time" >&2
    cat /tmp/postgres.log >&2
    exit 1
  fi
  sleep 1
done

echo "[demo-entrypoint] Pushing Prisma schema..."
npx --no-install prisma db push --schema=packages/db/prisma/schema.prisma --accept-data-loss --skip-generate

echo "[demo-entrypoint] Seeding demo data..."
node packages/db/dist/seed.js

echo "[demo-entrypoint] Starting API server..."
exec node apps/api/dist/server.js
