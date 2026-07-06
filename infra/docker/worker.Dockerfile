# infra/docker/worker.Dockerfile
# Multi-stage build for apps/worker (BullMQ workers: crawl / scoring / execution queues).
#
# WHY THIS IMAGE INSTALLS A REAL BROWSER AT BUILD TIME:
# The execution queue's job handler launches an isolated Playwright BrowserContext per order
# (see packages/vendor-agents ExecutionRouter) to actually click through a vendor's checkout —
# there is no vendor API to call instead. Playwright's `npx playwright install` step downloads a
# specific, version-pinned Chromium build plus the OS-level shared libraries (`--with-deps`) that
# headless Chromium needs (fonts, libnss3, libatk, etc). Doing this at container BUILD time — not
# at pod startup — keeps cold-start fast and deterministic, avoids surprise network calls to the
# Playwright CDN from inside production/k8s (which may be firewalled), and guarantees every worker
# replica runs the exact same browser build the code was tested against.

FROM node:20-alpine AS base
WORKDIR /repo

# ---- deps ----
FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY packages/sor-engine/package.json packages/sor-engine/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/logger/package.json packages/logger/package.json
COPY packages/vendor-agents/package.json packages/vendor-agents/package.json
COPY apps/worker/package.json apps/worker/package.json
RUN npm ci

# ---- build ----
FROM base AS build
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
RUN npm run db:generate
RUN npm run build -w packages/shared-types -w packages/sor-engine -w packages/db -w packages/logger -w packages/vendor-agents --if-present
RUN npm run build -w apps/worker --if-present

# ---- runtime: Debian slim (not alpine) because Playwright's --with-deps installer targets
# glibc-based distros; the official Playwright base images are Debian for this reason. ----
FROM node:20-bookworm-slim AS runtime
WORKDIR /repo
ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/repo/.playwright-browsers

COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/package.json ./package.json
COPY --from=build /repo/packages ./packages
COPY --from=build /repo/apps/worker ./apps/worker

# Bakes the Chromium binary + required OS libs into the image (see rationale above).
RUN npx playwright install --with-deps chromium

# No EXPOSE — the worker has no HTTP listener, it only consumes BullMQ jobs from Redis.
CMD ["node", "apps/worker/dist/index.js"]
