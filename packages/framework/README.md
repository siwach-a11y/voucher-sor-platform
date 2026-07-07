# @voucher-sor/framework

A vendor-agnostic Smart Order Routing (SOR) framework for browser-automation purchase execution.

This package is **not** a voucher marketplace and contains **no vendor implementations, websites,
domains, APIs, or products** — real or fictional. Think of it the way you'd think of a payment
gateway SDK, a database driver, or an ORM adapter: it defines the contract and the plumbing, and
your project supplies the concrete integrations.

## Folder structure

```text
src/
  core/
    routing/      RoutingEngine — search → score → sort → choose → buy
    scoring/      ScoringService — calculate/normalize/explain a connector's score
    execution/    ExecutionEngine — browser lifecycle, retries, timeouts, screenshots, events
    scheduler/    Scheduler — refreshOffers / refreshHealth / retryOrders jobs
    queue/        JobQueue interface + an in-memory reference implementation
    events/       EventBus — generic pub/sub for framework lifecycle events

  connectors/
    base/
      connector.interface.ts   VendorConnector — the only contract the framework depends on
      playwright.connector.ts  PlaywrightConnector — abstract base with reusable browser utilities
    registry.ts    ConnectorRegistry — register/unregister/get/list, loaded dynamically
    README.md      Do not put vendor folders here — see below

  domain/          Generic product/order/routing/execution types
  database/        Generic entities (Order, Offer, Connector, ExecutionLog, RoutingDecision) +
                    storage-agnostic Repository<T> interfaces
  api/             Framework-agnostic route handler functions
  ui/              Presentational React components (Connector / Status / Score / Execution Time / Buy)
  shared/          Small dependency-free utilities (clamp, id generation)
  config/          YAML config loader + schema (connectors.enabled, routing.weights)
```

## How routing works

```text
Purchase Request
  ↓
Available Connectors (ConnectorRegistry.list())
  ↓
Scores (ScoringService.rank())
  ↓
Best Connector
  ↓
Execution (ExecutionEngine.execute() → connector.buy())
```

Score formula:

```text
score = priceWeight × priceScore
      + successWeight × successScore
      + speedWeight × speedScore
      + reliabilityWeight × reliabilityScore
      − riskWeight × riskScore
```

Weights are configurable via `config/default.config.yaml` (or your own YAML file loaded with
`loadConfig()`) and validated to sum to 1.0.

## Adding a real vendor connector

Vendor connectors are never part of this framework — you write them in your own project by
extending `PlaywrightConnector`:

```ts
import { PlaywrightConnector, ConnectorRegistry } from '@voucher-sor/framework'
import type { PurchaseRequest, PurchaseResult, SearchRequest, SearchResult, VerificationResult, VerifyRequest } from '@voucher-sor/framework'

class MyConnector extends PlaywrightConnector {
  readonly id = 'my-connector'
  readonly name = 'My Connector'

  protected async login(context, page) {
    /* your login flow */
  }

  async search(request: SearchRequest): Promise<SearchResult[]> {
    /* your search flow */
    return []
  }

  async buy(request: PurchaseRequest): Promise<PurchaseResult> {
    /* your checkout flow */
    throw new Error('not implemented')
  }

  async verify(request: VerifyRequest): Promise<VerificationResult> {
    /* your confirmation flow */
    return { verified: false }
  }
}

const registry = new ConnectorRegistry()
registry.register(new MyConnector())
```

See `src/connectors/README.md` for the full contract and invariants (one connector instance per
order, isolated browser context, never share sessions across orders).

## Quick start

```ts
import {
  ConnectorRegistry,
  ScoringService,
  ExecutionEngine,
  RoutingEngine,
  EventBus,
  loadConfig,
} from '@voucher-sor/framework'

const config = loadConfig('./sor.config.yaml')
const registry = new ConnectorRegistry()
// registry.register(new MyConnector()) for each connector listed in config.connectors.enabled

const eventBus = new EventBus()
const scoring = new ScoringService(config.routing.weights)
const execution = new ExecutionEngine(eventBus, config.execution)
const routing = new RoutingEngine(registry, scoring, execution, eventBus)

const outcome = await routing.route({
  orderId: 'order_1',
  product: { id: 'product_1', name: 'Example Product' },
})
```

This example is illustrative — it deliberately references no real product, vendor, or URL. If you
need a concrete implementation, write it as a `PlaywrightConnector` subclass in your own project.
