# infra/docker/api.Dockerfile
# Multi-stage build for apps/api (Fastify HTTP API, port 4000).
# No Playwright here — the API never touches a browser, it only reads/writes Postgres
# and enqueues BullMQ jobs onto Redis for apps/worker to execute.

FROM node:20-alpine AS base
WORKDIR /repo

# ---- deps: install full workspace dependency graph (npm workspaces need the root lockfile) ----
FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY packages/sor-engine/package.json packages/sor-engine/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/logger/package.json packages/logger/package.json
COPY packages/vendor-agents/package.json packages/vendor-agents/package.json
COPY apps/api/package.json apps/api/package.json
RUN npm ci

# ---- build: compile shared packages + apps/api ----
FROM base AS build
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
RUN npm run db:generate
RUN npm run build -w packages/shared-types -w packages/sor-engine -w packages/db -w packages/logger --if-present
RUN npm run build -w apps/api --if-present

# ---- runtime: slim image, only what's needed to run the compiled server ----
FROM node:20-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/package.json ./package.json
COPY --from=build /repo/packages ./packages
COPY --from=build /repo/apps/api ./apps/api

EXPOSE 4000
CMD ["node", "apps/api/dist/index.js"]
