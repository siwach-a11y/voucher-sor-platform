import type { AvailabilityStatus, ConfidenceBreakdown, ConfidenceLabel, SellerType } from '@/types'
import { isValidUrl } from '@/utils/url'
import { clamp01, weightedSum } from '@/utils/score'

export interface ConfidenceInputs {
  listingUrl: string
  routingQuality: number
  sellingPrice: number
  availabilityStatus: AvailabilityStatus
  brand: string
  voucherName: string
  faceValue: number
  sellerType: SellerType
}

/**
 * ExtractionConfidence proxy: how reliable a source's page structure typically is to extract from.
 * Real adapters would report this per-extraction (spec §7's `extraction_method` field); until real
 * adapters exist, seller type is a reasonable deterministic stand-in — official stores generally
 * publish more structured, stable product pages than reseller listings.
 */
const EXTRACTION_CONFIDENCE_BY_SELLER: Record<SellerType, number> = {
  official: 1,
  marketplace: 0.85,
  reseller: 0.7,
  unknown: 0.5,
}

function urlConfidence(url: string, routingQuality: number): number {
  if (!isValidUrl(url)) return 0
  return clamp01(0.5 + 0.5 * routingQuality)
}

function priceConfidence(sellingPrice: number): number {
  return sellingPrice > 0 ? 1 : 0
}

function availabilityConfidence(status: AvailabilityStatus): number {
  if (status === 'UNKNOWN') return 0.3
  return 1
}

function productIdentityConfidence(brand: string, voucherName: string, faceValue: number): number {
  const hasBrand = brand.trim().length > 0
  const hasName = voucherName.trim().length > 0
  const hasFaceValue = faceValue > 0
  const present = [hasBrand, hasName, hasFaceValue].filter(Boolean).length
  return present / 3
}

/** Exported so UI components can label an already-computed evidenceConfidence without recomputing it (spec §14 bands). */
export function classifyConfidence(score: number): ConfidenceLabel {
  if (score >= 0.9) return 'VERY_HIGH'
  if (score >= 0.8) return 'HIGH'
  if (score >= 0.65) return 'MEDIUM'
  return 'LOW'
}

/** EvidenceConfidence (spec §14): weighted sum of five 0-1 evidence-quality components. */
export function calculateEvidenceConfidence(inputs: ConfidenceInputs): ConfidenceBreakdown {
  const url = urlConfidence(inputs.listingUrl, inputs.routingQuality)
  const price = priceConfidence(inputs.sellingPrice)
  const availability = availabilityConfidence(inputs.availabilityStatus)
  const identity = productIdentityConfidence(inputs.brand, inputs.voucherName, inputs.faceValue)
  const extraction = EXTRACTION_CONFIDENCE_BY_SELLER[inputs.sellerType]

  const evidenceConfidence = weightedSum([
    [url, 0.3],
    [price, 0.25],
    [availability, 0.2],
    [identity, 0.15],
    [extraction, 0.1],
  ])

  return {
    urlConfidence: url,
    priceConfidence: price,
    availabilityConfidence: availability,
    productIdentityConfidence: identity,
    extractionConfidence: extraction,
    evidenceConfidence,
    label: classifyConfidence(evidenceConfidence),
  }
}
