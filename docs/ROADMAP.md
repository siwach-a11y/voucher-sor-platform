# Roadmap — AI Voucher Smart Order Routing Platform

Phased build-out. Each phase should ship something runnable, not just design docs.

## Phase 0 — Foundations (done)

- [x] Monorepo scaffold: npm workspaces (`apps/*`, `packages/*`), shared `tsconfig.base.json`.
- [x] `packages/shared-types` — domain interfaces for product, vendor, offer, order, scoring,
      routing log, and the `VendorAgent` contract.
- [x] `packages/db` — Prisma schema (`User`, `Product`, `Vendor`, `VendorStats`, `Offer`,
      `Order`, `RoutingLog`, `EventLog`).
- [x] `packages/sor-engine` — scoring formulas + weights implemented and unit-tested.
- [x] `infra/` (Docker + k8s reference manifests) and `docs/ARCHITECTURE.md` / `docs/ROADMAP.md`.

## Phase 1 — Vendor Discovery MVP

- [ ] Onboard 2-3 real vendor crawlers in `packages/vendor-agents` (search + product-page
      scraping only, no checkout yet).
- [ ] Normalize `RawVendorOffer` → `Offer` and validate data quality (price sanity checks,
      stock-status confidence, duplicate detection).
- [ ] Populate `VendorStats` with real crawl-derived numbers (start success rate/reliability at
      neutral defaults until execution data exists).
- [ ] Manual/CLI trigger for a crawl run before wiring the scheduler.

## Phase 2 — SOR Engine Live

- [ ] Wire `apps/worker`'s scoring queue to recompute `Offer.finalScore` on
      `SCORING_RECALC_INTERVAL_MINUTES` using real `VendorStats`.
- [ ] Expose the vendor-comparison UI (`/products/[id]`) reading live scored offers.
- [ ] Dry-run mode: `decideRoute()` runs and writes `RoutingLog` on every simulated order, but no
      purchase executes — validates routing quality before real money moves.
- [ ] Add an internal view of `RoutingLog.decisionReason` history to sanity-check the weights.

## Phase 3 — Execution

- [ ] Implement a real Playwright checkout flow end-to-end for the first vendor (login → search →
      verify price → cart → checkout → payment → extract voucher → verify).
- [ ] Integrate tokenized payment (no raw card storage — see `PAYMENT_PROVIDER_API_KEY`).
- [ ] OTP / 3-D Secure pause-and-resume: `awaiting_user_approval` order status, notify via
      `USER_APPROVAL_WEBHOOK_URL`, resume execution on user approval (see the alt-branch in the
      ARCHITECTURE.md sequence diagram).
- [ ] Voucher extraction + `verify()` before marking an order `completed`.

## Phase 4 — Scale-Out

- [ ] Onboard additional vendors beyond the first (target: full vendor roster from Phase 1).
- [ ] Tune BullMQ execution-queue `concurrency` per pod against real Chromium memory footprint.
- [ ] Deploy `infra/k8s/worker-hpa.yaml`, validate scale-up/down behavior under load.
- [ ] Harden retry/failure recovery: BullMQ `attempts` + backoff tuning, dead-letter handling for
      orders that exhaust retries, alerting on repeated `VendorAgentStage` failures.

## Phase 5 — Production Hardening

- [ ] Logging/alerting dashboards over `EventLog` (crawl health, CAPTCHA rate, browser crash
      rate, payment failure rate, voucher extraction failure rate).
- [ ] Voucher-validation safeguards: stronger `verify()` checks, duplicate/reused-code detection,
      user-facing dispute flow for bad vouchers.
- [ ] Security review of payment handling (tokenization boundary, secrets management, PCI
      posture) before enabling real customer traffic at volume.
- [ ] Load-test the full pipeline (crawl → score → route → execute) end-to-end.
