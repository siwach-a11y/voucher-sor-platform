import type { ConnectorRegistry } from '../../connectors/index.js'
import type { ConnectorHealth, Product, PurchaseRequest, PurchaseResult, RoutingDecision, SearchRequest, SearchResult } from '../../domain/index.js'
import type { ScoringCandidate } from '../scoring/index.js'
import type { ScoringService } from '../scoring/index.js'
import type { ExecutionEngine } from '../execution/index.js'
import type { EventBus } from '../events/index.js'
import { emptyConnectorHealth } from '../../domain/index.js'

export interface RouteRequest {
  orderId: string
  product: Product
  /** Defaults to 5% — how far the live price may drift from the searched price before aborting. */
  maxPriceDriftPercent?: number
}

export interface RouteOutcome {
  decision: RoutingDecision
  result: PurchaseResult | null
}

/**
 * Generic Smart Order Routing engine:
 *
 *   offers = await connector.search()  →  calculateScore()  →  sort()  →  chooseBest()  →  connector.buy()
 *
 * Never references a concrete vendor — only the ConnectorRegistry, VendorConnector interface, and
 * ScoringService. Connector health (success/speed/reliability/risk history) is supplied by the
 * caller via `healthProvider`, keeping this engine free of any persistence/storage assumption.
 */
export class RoutingEngine {
  constructor(
    private readonly registry: ConnectorRegistry,
    private readonly scoring: ScoringService,
    private readonly execution: ExecutionEngine,
    private readonly eventBus: EventBus,
    private readonly healthProvider: (connectorId: string) => ConnectorHealth = emptyConnectorHealth,
  ) {}

  async route(request: RouteRequest): Promise<RouteOutcome> {
    const connectors = this.registry.list()
    const searchRequest: SearchRequest = { product: request.product }

    this.eventBus.publish({ type: 'search.started', orderId: request.orderId, message: `Searching ${connectors.length} connector(s) for "${request.product.name}"` })

    const bestOfferByConnector = new Map<string, SearchResult>()
    const candidates: ScoringCandidate[] = []

    for (const connector of connectors) {
      const offers = await connector.search(searchRequest).catch(() => [] as SearchResult[])
      const available = offers.filter((offer) => offer.checkoutAvailable && offer.inStock !== false)
      if (available.length === 0) continue

      const cheapest = available.reduce((a, b) => (a.price <= b.price ? a : b))
      bestOfferByConnector.set(connector.id, cheapest)

      const health = this.healthProvider(connector.id)
      candidates.push({
        connectorId: connector.id,
        price: cheapest.price,
        successfulOrders: health.successfulOrders,
        totalOrders: health.totalOrders,
        averageExecutionTimeMs: health.averageExecutionTimeMs,
        successfulExecutions: health.successfulExecutions,
        totalExecutions: health.totalExecutions,
        riskLevel: health.lastRiskLevel,
      })
    }

    this.eventBus.publish({ type: 'search.completed', orderId: request.orderId, message: `${candidates.length} connector(s) returned an available offer` })

    const ranked = this.scoring.rank(candidates)
    const winner = ranked[0]

    const decision: RoutingDecision = {
      productId: request.product.id,
      candidates: ranked,
      selectedConnectorId: winner?.connectorId ?? null,
      reason: winner
        ? `Connector ${winner.connectorId} selected with score ${winner.finalScore.toFixed(3)}` +
          (ranked[1] ? `, beating runner-up ${ranked[1]!.connectorId} (${ranked[1]!.finalScore.toFixed(3)}).` : ' — sole eligible candidate.')
        : 'No eligible connector returned an available offer.',
      decidedAt: new Date().toISOString(),
    }
    this.eventBus.publish({ type: 'routing.decided', orderId: request.orderId, message: decision.reason, metadata: decision })

    if (!decision.selectedConnectorId || !winner) return { decision, result: null }

    const connector = this.registry.get(decision.selectedConnectorId)
    const offer = bestOfferByConnector.get(decision.selectedConnectorId)
    if (!connector || !offer) return { decision, result: null }

    const purchaseRequest: PurchaseRequest = {
      orderId: request.orderId,
      connectorId: connector.id,
      externalId: offer.externalId,
      expectedPrice: offer.price,
      currency: offer.currency,
      maxPriceDriftPercent: request.maxPriceDriftPercent ?? 5,
    }

    const result = await this.execution.execute(connector, purchaseRequest)
    return { decision, result }
  }
}
