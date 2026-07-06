# Voucher SOR Platform

AI Voucher Smart Order Routing platform — a voucher marketplace where no supplier has an API.
The system uses Playwright browser automation to search, compare, purchase, and retrieve digital
vouchers across vendor websites. A Smart Order Routing engine scores every vendor's offer on
price, success rate, checkout speed, stock confidence, and reliability (minus a risk penalty) —
never on price alone — then an Execution Router runs the winning vendor's checkout in an isolated
browser context.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full system design (scoring formula,
sequence/component diagrams, wireframes) and [`docs/ROADMAP.md`](docs/ROADMAP.md) for the phased
build-out plan.

**Live demo:** https://siwach-a11y.github.io/voucher-sor-platform/ — a real, working demo (search,
vendor comparison, buy, order tracking with a live status transition) backed by a free-tier Cloud
Run deployment, not just a hosted static shell. See [Demo deployment](#demo-deployment) below for
what that trades away vs. the real architecture.

## Prerequisites

- Node.js 20+
- Docker (for Postgres/Redis, or the full containerized stack)

## Quickstart

```bash
# 1. Configure environment
cp .env.example .env

# 2. Install workspace dependencies
npm install

# 3. Start Postgres + Redis (+ api/worker/web) in Docker
npm run docker:up
# ...or run infra manually:
# docker compose -f infra/docker/docker-compose.yml up --build

# 4. Apply the database schema and generate the Prisma client
npm run db:migrate
npm run db:generate

# 5. Seed sample data (products/vendors/offers)
npm run seed -w packages/db

# 6. Run each app in dev mode (separate terminals)
npm run dev:api      # Fastify API on :4000
npm run dev:worker   # BullMQ crawl/scoring/execution workers
npm run dev:web      # Next.js frontend on :3000
```

Then open http://localhost:3000.

## Static frontend build

`apps/web` builds to a fully static bundle (`output: "export"` in `next.config.mjs` — no Node
server, no SSR; every page fetches `NEXT_PUBLIC_API_BASE_URL` client-side at runtime). To build and
preview it standalone:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000 npm run build -w apps/web
npx serve apps/web/out
```

The output in `apps/web/out/` can be deployed to any static host (GitHub Pages, S3, Cloudflare
Pages, or the nginx-based `infra/docker/web.Dockerfile`/`infra/k8s/web-deployment.yaml`) as long as
`apps/api` is reachable from the browser (CORS is already open). For a sub-path deployment (e.g.
GitHub Pages project sites), set `PAGES_BASE_PATH=/repo-name` at build time.

## Demo deployment

The live demo is two pieces:

1. **`apps/web`** — static export, deployed to GitHub Pages via `npm run deploy:pages -w apps/web`
   (see [Static frontend build](#static-frontend-build) above), pointed at the demo API's URL.
2. **A single free-tier Cloud Run container** (`infra/docker/api-demo.Dockerfile`) — bundles an
   ephemeral Postgres *inside the same container* as `apps/api`, seeded fresh on every cold start,
   and runs with `DEMO_MODE=true` so order execution happens synchronously in-request
   (`apps/api/src/lib/demo-execution.ts`) instead of via BullMQ/a worker — there's no Redis, no
   worker, no Playwright/Chromium in this image at all. This trades persistence (data resets on
   cold start/restart) and real queue-based execution for near-zero cost. It is **not** what
   `infra/docker/api.Dockerfile` + `infra/docker/worker.Dockerfile` + `infra/k8s/` describe — those
   are the real, documented architecture (Cloud SQL + Memorystore + BullMQ workers + Playwright).

To redeploy the demo API after a change:

```bash
npm run deploy:demo-api:build   # Cloud Build: infra/docker/api-demo.Dockerfile -> gcr.io image
npm run deploy:demo-api:run     # gcloud run deploy voucher-sor-demo-api --allow-unauthenticated
```

`--allow-unauthenticated` is required — this is a public API with no session/API-key layer that a
static frontend calls directly from anonymous browsers — but it's also a real access-control change,
so it's called out explicitly here rather than being silent inside the script.

Then rebuild and redeploy the frontend pointing at the (possibly new) Cloud Run URL:

```bash
PAGES_BASE_PATH=/voucher-sor-platform \
  NEXT_PUBLIC_API_BASE_URL=https://voucher-sor-demo-api-962218194776.asia-southeast1.run.app \
  npm run build -w apps/web
npm run deploy:pages -w apps/web
```

## Repo Layout

```
apps/
  api/      Fastify HTTP API (port 4000)
  worker/   BullMQ workers (crawl, scoring, execution queues)
  web/      Next.js frontend (port 3000)
packages/
  shared-types/   Domain types shared by every app/package
  sor-engine/     Smart Order Routing scoring engine (pure functions)
  vendor-agents/  Playwright vendor automation + Execution Router
  db/             Prisma schema + client
  logger/         Shared pino logger + structured event logging
infra/
  docker/   Dockerfiles + docker-compose.yml
  k8s/      Reference Kubernetes manifests
docs/
  ARCHITECTURE.md   Full system design
  ROADMAP.md        Phased implementation plan
```
