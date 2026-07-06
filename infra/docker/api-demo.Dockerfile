# infra/docker/api-demo.Dockerfile
# Single-container, free-tier-friendly deployment of apps/api for the public GitHub Pages demo.
# Bundles its own ephemeral Postgres (no Cloud SQL/Memorystore, no worker/Playwright/Redis) — see
# infra/docker/demo-entrypoint.sh and apps/api/src/lib/demo-execution.ts (DEMO_MODE=true makes order
# execution run synchronously in-process instead of via a BullMQ queue). This trades persistence and
# queue-based execution for near-zero cost; the real, documented architecture (Cloud SQL + Memorystore
# + apps/worker) is what infra/docker/api.Dockerfile and infra/k8s/ describe.

FROM node:20-alpine AS base
WORKDIR /repo
# Prisma's engine-selection heuristic shells out to `openssl version` to pick the right prebuilt
# engine binary; without it present it silently guesses wrong (openssl-1.1.x on an openssl-3 image)
# and the engine binary fails to even load, producing a garbled non-JSON "schema engine response".
RUN apk add --no-cache openssl

# ---- deps ----
# Every workspace's package.json must be present for `npm ci` to resolve the single monorepo
# lockfile identically to a local install (a partial copy changes hoisting/dedupe decisions —
# e.g. ioredis's exact-pin-to-match-bullmq trick silently landed in the wrong place without this).
FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY packages/sor-engine/package.json packages/sor-engine/package.json
COPY packages/logger/package.json packages/logger/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/vendor-agents/package.json packages/vendor-agents/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci

# ---- build ----
FROM base AS build
# Copy the WHOLE deps-stage tree, not just /repo/node_modules — npm's dedupe/hoisting nests some
# packages under a workspace's own node_modules (e.g. apps/api/node_modules/ioredis, pinned to
# match bullmq's bundled version exactly) instead of the root node_modules.
COPY --from=deps /repo ./
COPY . .
# `prisma generate` requires DATABASE_URL to be a syntactically valid value at build time even
# though it never connects — the real value is set in the runtime stage below.
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
RUN npm run build -w packages/shared-types
RUN npm run build -w packages/logger
RUN npm run build -w packages/sor-engine
RUN npm run build -w packages/db
RUN npm run build -w apps/api

# ---- runtime ----
FROM node:20-alpine AS runtime
RUN apk add --no-cache postgresql16 su-exec openssl
WORKDIR /repo
ENV NODE_ENV=production
ENV DEMO_MODE=true
ENV PGDATA=/var/lib/postgresql/data
ENV DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/postgres?schema=public"

COPY --from=build /repo/node_modules ./node_modules
# ioredis/@ioredis/commands live here, not in the root node_modules above — see the build-stage note.
COPY --from=build /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /repo/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=build /repo/packages/shared-types/package.json ./packages/shared-types/package.json
COPY --from=build /repo/packages/logger/dist ./packages/logger/dist
COPY --from=build /repo/packages/logger/package.json ./packages/logger/package.json
COPY --from=build /repo/packages/sor-engine/dist ./packages/sor-engine/dist
COPY --from=build /repo/packages/sor-engine/package.json ./packages/sor-engine/package.json
COPY --from=build /repo/packages/db/dist ./packages/db/dist
COPY --from=build /repo/packages/db/package.json ./packages/db/package.json
COPY --from=build /repo/packages/db/prisma ./packages/db/prisma
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/apps/api/package.json ./apps/api/package.json

RUN mkdir -p /var/lib/postgresql/data && chown -R postgres:postgres /var/lib/postgresql
COPY infra/docker/demo-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
