import { readFileSync } from 'node:fs'
import yaml from 'js-yaml'
import type { FrameworkConfig } from './config.schema.js'
import { DEFAULT_MAX_EXPECTED_EXECUTION_TIME_MS, DEFAULT_SCORING_WEIGHTS } from '../core/scoring/index.js'

export const DEFAULT_CONFIG: FrameworkConfig = {
  connectors: { enabled: [] },
  routing: { weights: DEFAULT_SCORING_WEIGHTS },
  execution: { maxAttempts: 2, timeoutMs: DEFAULT_MAX_EXPECTED_EXECUTION_TIME_MS * 2 },
}

/** Loads and validates a YAML config file, shallow-merging it over the framework defaults. Throws
 * if the file doesn't parse to an object — a malformed config is a deploy-time bug to surface loudly. */
export function loadConfig(filePath: string): FrameworkConfig {
  const raw = readFileSync(filePath, 'utf-8')
  const parsed = yaml.load(raw)
  if (parsed !== undefined && (typeof parsed !== 'object' || parsed === null)) {
    throw new Error(`Config file "${filePath}" did not parse to an object`)
  }
  return mergeConfig(DEFAULT_CONFIG, (parsed as Partial<FrameworkConfig>) ?? {})
}

export function mergeConfig(base: FrameworkConfig, override: Partial<FrameworkConfig>): FrameworkConfig {
  return {
    connectors: { enabled: override.connectors?.enabled ?? base.connectors.enabled },
    routing: { weights: { ...base.routing.weights, ...override.routing?.weights } },
    execution: { ...base.execution, ...override.execution },
  }
}
