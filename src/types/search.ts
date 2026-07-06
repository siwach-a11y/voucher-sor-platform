import type { VoucherGroup } from './voucher'

export interface SearchIntent {
  rawQuery: string
  brand?: string
  category?: string
  faceValue?: number
  currency?: string
  voucherType?: string
  country?: string
}

export interface SourceSearchMeta {
  sourcesRequested: number
  sourcesSucceeded: number
  sourcesFailed: number
  failedSourceNames: string[]
  searchDurationMs: number
  resultsFound: number
  liveResults: number
  staleResults: number
}

export interface SearchResponse {
  intent: SearchIntent
  meta: SourceSearchMeta
  groups: VoucherGroup[]
}
