/** Rolling operational stats for one connector, feeding the success/speed/reliability/risk scores.
 * Owned by the framework (updated after every search/buy/verify call), never by a connector itself. */
export interface ConnectorHealth {
  connectorId: string
  successfulOrders: number
  totalOrders: number
  successfulExecutions: number
  totalExecutions: number
  averageExecutionTimeMs: number
  /** 0 (no friction observed) to 1 (last run failed outright, e.g. CAPTCHA/OTP block). */
  lastRiskLevel: number
  updatedAt: string
}

export function emptyConnectorHealth(connectorId: string): ConnectorHealth {
  return {
    connectorId,
    successfulOrders: 0,
    totalOrders: 0,
    successfulExecutions: 0,
    totalExecutions: 0,
    averageExecutionTimeMs: 0,
    lastRiskLevel: 0,
    updatedAt: new Date(0).toISOString(),
  }
}
