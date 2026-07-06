# @voucher-sor/vendor-agents

Playwright-based browser automation for the AI Voucher Smart Order Routing Platform. This package
has two halves: `src/core/base-vendor-agent.ts` + `src/core/execution-router.ts` drive the
*purchase* side (login → search → add to cart → checkout → pay → extract voucher → verify) for one
order at a time, while `src/core/base-crawler.ts` + `src/normalization/normalize-offer.ts` drive the
*discovery* side (searching a vendor's catalog and normalizing what it returns into the shape the SOR
engine scores). `src/agents/generic-vendor-agent.ts` and `src/crawlers/generic-vendor-crawler.ts` are
worked examples that prove the abstractions out end to end against placeholder/generic selectors —
they are not verified against any real vendor site. This is browser automation for a legitimate
commercial marketplace (compare-and-buy across suppliers with no APIs); it never attempts to bypass
CAPTCHAs, bypass authentication, or evade bot detection, and any OTP/3-D Secure prompt during payment
pauses the order for a human instead of being completed automatically.

The single most important invariant in this package: **one `BaseVendorAgent` instance backs exactly
one order, and must be constructed with a brand-new, isolated `BrowserContext` (and `Page`) that is
never reused across orders.** `ExecutionRouter.execute()` enforces this by calling
`browser.newContext()` fresh for every `execute()` call and always releasing it via `agent.dispose()`
in a `finally` block, so cleanup happens whether the order succeeds, fails, or pauses for approval.
Reusing a context across orders would leak one customer's cookies, session, and cart into another's
run — never do it, even for a "quick" fix.

`ExecutionRouter.execute()` is the only method the rest of the system needs to call — it looks up a
`VendorAgentFactory` by `request.vendorId`, throws immediately for an unregistered vendor (a config
bug, not something to swallow), builds the agent, and calls the single public
`agent.runFullPurchaseFlow(request)` orchestration method. `runFullPurchaseFlow` itself never throws:
every stage is wrapped in retry-with-backoff, failures are tagged with the failing `VendorAgentStage`
and returned as a failed `ExecutionResult`, and an OTP/3-D Secure prompt during `payment()` returns
`requiredUserApproval: true` instead of failing, so a worker can persist `awaiting_user_approval` and
resume later.

## Onboarding a new vendor

1. **Try `GenericVendorAgent` + `GenericVendorCrawler` first.** Most vendor sites fit the same shape
   (search box → product link → add-to-cart button → checkout → payment form → voucher code on a
   confirmation page). Build a `VendorSelectorConfig` (for checkout) and a
   `VendorCrawlerSelectorConfig` (for catalog search) with that vendor's real CSS selectors, register
   a `VendorAgentFactory` for the new `vendorId` (e.g.
   `(ctx, page) => new GenericVendorAgent(vendorId, ctx, page, selectors)`), and wire it into the
   `ExecutionRouter`'s `agentFactories` map.
2. **Subclass `BaseVendorAgent` / `BaseCrawler` directly** only when a vendor's flow is genuinely
   unusual (multi-step checkout, non-standard OTP detection, a catalog that needs pagination or an
   API-shaped JSON response instead of DOM scraping) — implement the same abstract hooks
   (`login`, `search`, `selectProduct`, `addToCart`, `checkout`, `payment`, `extractVoucher`,
   `verify`, `readCurrentPrice` / `searchProducts`) with real Playwright calls for that site.
3. Either way, run the new crawler's raw output through `normalizeOffer()` before it reaches the SOR
   engine, and never write code that fills in an OTP or 3-D Secure field automatically — `payment()`
   must return `{ requiresUserApproval: true }` and let a human take it from there.
