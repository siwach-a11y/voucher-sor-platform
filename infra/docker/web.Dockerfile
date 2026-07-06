# infra/docker/web.Dockerfile
# Multi-stage build for apps/web (Next.js App Router). apps/web/next.config.mjs sets
# `output: "export"` — the app is a fully static bundle (no Node server, no SSR, no API routes),
# so the runtime image is just nginx serving apps/web/out/.

FROM node:20-alpine AS base
WORKDIR /repo

# ---- deps ----
FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci

# ---- build ----
FROM base AS build
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_API_BASE_URL is inlined into the static bundle at build time — the deployed
# apps/api instance this points to must be reachable from the browser (CORS is already open).
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ARG PAGES_BASE_PATH=""
ENV PAGES_BASE_PATH=$PAGES_BASE_PATH
RUN npm run build -w packages/shared-types --if-present
RUN npm run build -w apps/web

# ---- runtime ----
FROM nginx:1.27-alpine AS runtime
COPY --from=build /repo/apps/web/out /usr/share/nginx/html

EXPOSE 80
