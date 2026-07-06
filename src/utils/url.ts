export type RoutingLabel = 'DIRECT LISTING' | 'PRODUCT SELECTION REQUIRED' | 'SEARCH RESULT' | 'CATEGORY PAGE' | 'HOMEPAGE'

/** Maps a RoutingQuality score (spec §18) to the human-readable label shown in the UI. */
export function routingQualityLabel(routingQuality: number): RoutingLabel {
  if (routingQuality >= 1.0) return 'DIRECT LISTING'
  if (routingQuality >= 0.8) return 'PRODUCT SELECTION REQUIRED'
  if (routingQuality >= 0.6) return 'SEARCH RESULT'
  if (routingQuality >= 0.3) return 'CATEGORY PAGE'
  return 'HOMEPAGE'
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
