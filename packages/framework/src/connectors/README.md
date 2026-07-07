# Connectors

This directory contains only the **connector contract** — the interface every vendor integration
must implement, and the abstract Playwright base class that provides reusable browser utilities.

**Do not create vendor folders here.** No `steam/`, `amazon/`, `giftcard-supplier/`, or any other
vendor-named directory belongs in this package. The framework must compile and run with zero
knowledge of any real vendor, website, domain, or API.

## What's here

- `base/connector.interface.ts` — the `VendorConnector` interface (`id`, `name`, `search`, `buy`, `verify`).
- `base/playwright.connector.ts` — `PlaywrightConnector`, an abstract class with reusable browser
  lifecycle helpers (launch, context creation, screenshots, retry-with-backoff). It implements no
  vendor logic — every abstract method is left for a concrete subclass to fill in.
- `registry.ts` — `ConnectorRegistry`, the single place the framework looks up connector instances
  by id. Connectors are registered at startup (typically from `config/`), never hardcoded.

## Adding a real vendor connector

Vendor connectors belong in **your own project**, not in this framework. To add one:

```ts
import { PlaywrightConnector } from '@voucher-sor/framework'
import type { PurchaseRequest, PurchaseResult, SearchRequest, SearchResult, VerificationResult, VerifyRequest } from '@voucher-sor/framework'

export class MyConnector extends PlaywrightConnector {
  readonly id = 'my-connector'
  readonly name = 'My Connector'

  protected async login(context, page) {
    // your login flow
  }

  async search(request: SearchRequest): Promise<SearchResult[]> {
    // your search flow — return real, observed results only
  }

  async buy(request: PurchaseRequest): Promise<PurchaseResult> {
    // your checkout flow
  }

  async verify(request: VerifyRequest): Promise<VerificationResult> {
    // your confirmation flow
  }
}
```

Then register it with the `ConnectorRegistry` at startup:

```ts
const registry = new ConnectorRegistry()
registry.register(new MyConnector())
```

The routing, scoring, and execution engines never need to change — they only ever see the
`VendorConnector` interface.
