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
