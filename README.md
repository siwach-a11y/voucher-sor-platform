# VoucherHub

**Search once. Compare everything.**

An AI-powered voucher discovery and price-comparison dashboard. VoucherHub discovers real voucher
listings across multiple external sources, normalizes them into one schema, matches equivalent
vouchers, compares prices, ranks verified offers, and sends users to the exact external listing
when they click **Buy at Store**.

VoucherHub does not process payments, store credit cards, hold a wallet, or buy vouchers
automatically — it is a discovery, verification, and routing layer, not an execution layer.

## Stack

React 18/19 + Vite + TypeScript + Tailwind CSS v4 + React Router. No backend in V1 — mock source
adapters (`src/adapters/MockSourceAdapter.ts`) simulate multi-source discovery, latency, and
partial failures against a realistic dataset (`src/data/mockListings.ts`).

## Getting started

```bash
npm install
npm run dev       # Vite dev server
npm run test      # vitest — engine formulas + full search pipeline (54 tests)
npm run typecheck # tsc -b
npm run build     # production build
```

## Architecture

Deterministic scoring lives entirely in `src/engine/` — pricing, matching, freshness, availability,
confidence, ranking, and deduplication are all pure, unit-tested functions. AI/heuristics are only
used for query understanding (`src/engine/queryParser.ts`); every price, discount, match score, and
ranking decision is calculated by ordinary arithmetic, never inferred.

```
src/
  engine/       pricing, matcher, freshness, availability, confidence, ranking, deduplication, queryParser
  adapters/     SourceAdapter interface + MockSourceAdapter + SourceRegistry
  services/     searchService (orchestration), redirectService (Buy at Store), watchlistService, priceAlertService, historyService
  components/   layout, search, vouchers (result cards, detail panel), dashboard, common
  pages/        Dashboard, Search, Watchlist, Alerts, Categories, History, Settings
  data/         mock listings, sources, categories
  types/        shared domain types
```

Watchlist, price alerts, and search history persist to `localStorage` only — there's no account
system or server-side storage in V1.
