import type { ScoringWeights } from '../domain/index.js'

export interface FrameworkConfig {
  connectors: {
    /** Connector ids to activate — the registry only loads what's listed here. */
    enabled: string[]
  }
  routing: {
    weights: ScoringWeights
  }
  execution: {
    maxAttempts: number
    timeoutMs: number
  }
}
