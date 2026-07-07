import type { ConnectorRegistry } from '../connectors/index.js'
import type { RoutingEngine, RouteRequest } from '../core/routing/index.js'

/** Framework-agnostic route handlers — plain functions, not tied to Express/Fastify/anything else.
 * Wire these into whatever HTTP framework your project already uses. */

export interface ConnectorSummary {
  id: string
  name: string
}

export function listConnectorsHandler(registry: ConnectorRegistry) {
  return async (): Promise<ConnectorSummary[]> => registry.list().map((connector) => ({ id: connector.id, name: connector.name }))
}

export function routeOrderHandler(routing: RoutingEngine) {
  return async (request: RouteRequest) => routing.route(request)
}
