import type { OrderStatus, ScoreBreakdown } from '../domain/index.js'

/** Persistence-shape entities. Storage-agnostic on purpose — the framework doesn't assume Postgres,
 * Prisma, or any specific ORM. A host application maps these onto whatever it actually uses. Never
 * name a table/collection after a vendor — these five are the only entities the framework needs. */

export interface OrderEntity {
  id: string
  productId: string
  connectorId: string | null
  status: OrderStatus
  sellingPrice: number
  purchasePrice: number | null
  currency: string
  failureReason: string | null
  createdAt: string
  updatedAt: string
}

export interface OfferEntity {
  id: string
  connectorId: string
  productId: string
  price: number
  currency: string
  checkoutAvailable: boolean
  finalScore: number | null
  lastUpdated: string
}

export interface ConnectorEntity {
  id: string
  name: string
  /** Lower number = tried first when scores tie. */
  priority: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface ExecutionLogEntity {
  id: string
  orderId: string
  connectorId: string
  attempt: number
  outcome: 'success' | 'failure'
  message: string
  createdAt: string
}

export interface RoutingDecisionEntity {
  id: string
  orderId: string
  selectedConnectorId: string | null
  candidateScores: ScoreBreakdown[]
  reason: string
  createdAt: string
}
