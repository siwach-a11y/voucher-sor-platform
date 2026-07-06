import { clamp01, weightedSum } from '@/utils/score'

export interface DeduplicationCandidate {
  listingUrl: string
  sourceDomain: string
  sellerName: string
  listingTitle: string
  faceValue: number
  totalCost: number
  voucherType: string
}

export type DuplicateDecision = 'AUTO_MERGE' | 'SOFT_DUPLICATE' | 'KEEP_SEPARATE'

function canonicalizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return `${parsed.hostname.replace(/^www\./, '')}${parsed.pathname}`.replace(/\/+$/, '').toLowerCase()
  } catch {
    return url.trim().toLowerCase()
  }
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean),
  )
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1
  const intersection = [...a].filter((token) => b.has(token)).length
  const union = new Set([...a, ...b]).size
  return union === 0 ? 0 : intersection / union
}

function urlSimilarity(a: string, b: string): number {
  const ca = canonicalizeUrl(a)
  const cb = canonicalizeUrl(b)
  if (ca === cb) return 1
  return jaccardSimilarity(tokenize(ca.replace(/[/.]/g, ' ')), tokenize(cb.replace(/[/.]/g, ' ')))
}

function priceSimilarity(a: number, b: number): number {
  const denom = Math.max(a, b) || 1
  return clamp01(1 - Math.abs(a - b) / denom)
}

/** DuplicateProbability (spec §20): weighted similarity across seven signals. */
export function calculateDuplicateProbability(a: DeduplicationCandidate, b: DeduplicationCandidate): number {
  return weightedSum([
    [urlSimilarity(a.listingUrl, b.listingUrl), 0.3],
    [a.sourceDomain.toLowerCase() === b.sourceDomain.toLowerCase() ? 1 : 0, 0.2],
    [a.sellerName.trim().toLowerCase() === b.sellerName.trim().toLowerCase() ? 1 : 0, 0.15],
    [jaccardSimilarity(tokenize(a.listingTitle), tokenize(b.listingTitle)), 0.15],
    [a.faceValue === b.faceValue ? 1 : 0, 0.1],
    [priceSimilarity(a.totalCost, b.totalCost), 0.05],
    [a.voucherType === b.voucherType ? 1 : 0, 0.05],
  ])
}

export function classifyDuplicate(probability: number): DuplicateDecision {
  if (probability >= 0.9) return 'AUTO_MERGE'
  if (probability >= 0.7) return 'SOFT_DUPLICATE'
  return 'KEEP_SEPARATE'
}

/**
 * Deduplicates a flat list of candidates using union-find over AUTO_MERGE pairs only —
 * SOFT_DUPLICATE pairs are flagged (spec: "flag for review or soft merge") but kept as separate
 * listings in V1 rather than silently merged, since merging isn't reversible once displayed.
 */
export function deduplicate<T extends DeduplicationCandidate & { id: string }>(
  candidates: T[],
): { kept: T[]; softDuplicateIds: Set<string> } {
  const parent = new Map<string, string>(candidates.map((c) => [c.id, c.id]))

  function find(id: string): string {
    let root = id
    while (parent.get(root) !== root) root = parent.get(root)!
    return root
  }
  function union(a: string, b: string): void {
    parent.set(find(a), find(b))
  }

  const softDuplicateIds = new Set<string>()

  for (let i = 0; i < candidates.length; i += 1) {
    for (let j = i + 1; j < candidates.length; j += 1) {
      const probability = calculateDuplicateProbability(candidates[i]!, candidates[j]!)
      const decision = classifyDuplicate(probability)
      if (decision === 'AUTO_MERGE') union(candidates[i]!.id, candidates[j]!.id)
      else if (decision === 'SOFT_DUPLICATE') {
        softDuplicateIds.add(candidates[i]!.id)
        softDuplicateIds.add(candidates[j]!.id)
      }
    }
  }

  const seenRoots = new Set<string>()
  const kept: T[] = []
  for (const candidate of candidates) {
    const root = find(candidate.id)
    if (seenRoots.has(root)) continue
    seenRoots.add(root)
    kept.push(candidate)
  }

  return { kept, softDuplicateIds }
}
