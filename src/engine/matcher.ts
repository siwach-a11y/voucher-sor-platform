import type { MatchLabel, MatchScoreBreakdown, VoucherListing } from '@/types'
import { clamp01, weightedSum } from '@/utils/score'

export interface MatchableAttributes {
  brand: string
  faceValue: number
  currency: string
  voucherType: VoucherListing['voucherType']
  country: string
  redemptionChannel?: string
  geographicRestriction?: string
}

/** Face values within this fraction of each other are treated as "the same", not a hard mismatch. */
const FACE_VALUE_TOLERANCE = 0.02

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function brandMatch(a: MatchableAttributes, b: MatchableAttributes): number {
  return normalize(a.brand) === normalize(b.brand) ? 1 : 0
}

function faceValueMatch(a: MatchableAttributes, b: MatchableAttributes): number {
  if (a.faceValue === b.faceValue) return 1
  const diff = Math.abs(a.faceValue - b.faceValue)
  const denom = Math.max(a.faceValue, b.faceValue) || 1
  return clamp01(1 - diff / denom)
}

function voucherTypeMatch(a: MatchableAttributes, b: MatchableAttributes): number {
  if (a.voucherType === b.voucherType) return 1
  if (a.voucherType === 'unknown' || b.voucherType === 'unknown') return 0.5
  return 0
}

function currencyMatch(a: MatchableAttributes, b: MatchableAttributes): number {
  return normalize(a.currency) === normalize(b.currency) ? 1 : 0
}

function redemptionCompatibility(a: MatchableAttributes, b: MatchableAttributes): number {
  if (!a.redemptionChannel || !b.redemptionChannel) return 0.7
  return normalize(a.redemptionChannel) === normalize(b.redemptionChannel) ? 1 : 0.3
}

function geographicCompatibility(a: MatchableAttributes, b: MatchableAttributes): number {
  if (!a.geographicRestriction || !b.geographicRestriction) return 0.7
  if (normalize(a.geographicRestriction) === normalize(b.geographicRestriction)) return 1
  // Coarse heuristic: if one restriction string contains the other (e.g. "Bangkok metro only" vs
  // "Thailand only"), treat them as compatible (same broader market) rather than mismatched.
  const norm1 = normalize(a.geographicRestriction)
  const norm2 = normalize(b.geographicRestriction)
  return norm1.includes(norm2) || norm2.includes(norm1) ? 0.8 : 0.4
}

/** Hard mismatch rules (spec §10) — evaluated before weighted scoring, and override it entirely. */
function findHardMismatch(a: MatchableAttributes, b: MatchableAttributes): string | undefined {
  if (normalize(a.brand) !== normalize(b.brand)) return 'Different brand'
  if (normalize(a.currency) !== normalize(b.currency)) return 'Incompatible currencies'
  if (faceValueMatch(a, b) < 1 - FACE_VALUE_TOLERANCE) return 'Materially different face value'
  if (a.voucherType !== 'unknown' && b.voucherType !== 'unknown' && a.voucherType !== b.voucherType) {
    return 'Digital vs. physical delivery changes usability'
  }
  // Structured country mismatch takes priority over the free-text geographicRestriction heuristic
  // below — every listing now carries an explicit country, a far more reliable signal than parsing
  // restriction strings.
  if (normalize(a.country) !== normalize(b.country)) return 'Different country market'
  if (geographicCompatibility(a, b) <= 0.4) return 'Different geographic redemption market'
  return undefined
}

function classify(score: number): MatchLabel {
  if (score >= 0.9) return 'EXACT_MATCH'
  if (score >= 0.75) return 'COMPARABLE_MATCH'
  if (score >= 0.6) return 'POSSIBLE_MATCH'
  return 'NO_MATCH'
}

/**
 * MatchScore (spec §10): weighted sum of six 0-1 components, but a hard mismatch always forces
 * NO_MATCH regardless of the weighted result — title similarity is never used as the sole signal
 * (spec §11: "Never allow title similarity alone to establish equivalence").
 */
export function calculateMatchScore(a: MatchableAttributes, b: MatchableAttributes): MatchScoreBreakdown {
  const hardMismatchReason = findHardMismatch(a, b)

  const brand = brandMatch(a, b)
  const faceValue = faceValueMatch(a, b)
  const voucherType = voucherTypeMatch(a, b)
  const currency = currencyMatch(a, b)
  const redemption = redemptionCompatibility(a, b)
  const geographic = geographicCompatibility(a, b)

  const rawScore = weightedSum([
    [brand, 0.3],
    [faceValue, 0.25],
    [voucherType, 0.15],
    [currency, 0.1],
    [redemption, 0.1],
    [geographic, 0.1],
  ])

  const matchScore = hardMismatchReason ? Math.min(rawScore, 0.59) : rawScore

  return {
    brandMatch: brand,
    faceValueMatch: faceValue,
    voucherTypeMatch: voucherType,
    currencyMatch: currency,
    redemptionCompatibility: redemption,
    geographicCompatibility: geographic,
    matchScore,
    label: hardMismatchReason ? 'NO_MATCH' : classify(matchScore),
    hardMismatch: Boolean(hardMismatchReason),
    hardMismatchReason,
  }
}

export function toMatchableAttributes(listing: VoucherListing): MatchableAttributes {
  return {
    brand: listing.brand,
    faceValue: listing.faceValue,
    currency: listing.currency,
    voucherType: listing.voucherType,
    country: listing.country,
    redemptionChannel: listing.redemptionChannel,
    geographicRestriction: listing.geographicRestriction,
  }
}
