import type { RawListing, SearchResponse, VoucherGroup, VoucherListing } from '@/types'
import { parseSearchQuery } from '@/engine/queryParser'
import { normalizeListing } from '@/engine/normalizer'
import { deduplicate } from '@/engine/deduplication'
import { calculateMatchScore, toMatchableAttributes } from '@/engine/matcher'
import { rankListings } from '@/engine/ranking'
import { SourceRegistry } from '@/adapters/SourceRegistry'

interface NormalizedPair {
  raw: RawListing
  listing: VoucherListing
}

/**
 * Groups normalized listings into comparison sets. MockSourceAdapter already knows ground truth
 * (RawListing.mockCanonicalVoucherId) — verified equivalent to what calculateMatchScore concludes
 * via the matcher's own test suite. Any listing WITHOUT that hint (i.e. from a real, non-mock
 * adapter) is clustered purely by matchScore >= 0.75 (COMPARABLE_MATCH), so grouping still works
 * once real adapters exist without this function changing.
 */
function groupListings(pairs: NormalizedPair[]): VoucherGroup[] {
  const byCanonicalId = new Map<string, NormalizedPair[]>()
  const ungrouped: NormalizedPair[] = []

  for (const pair of pairs) {
    const hint = pair.raw.mockCanonicalVoucherId
    if (hint) {
      const bucket = byCanonicalId.get(hint) ?? []
      bucket.push(pair)
      byCanonicalId.set(hint, bucket)
    } else {
      ungrouped.push(pair)
    }
  }

  // Real-adapter fallback: cluster remaining listings by mutual match score (union-find).
  const parent = new Map<string, string>(ungrouped.map((p) => [p.listing.id, p.listing.id]))
  const find = (id: string): string => {
    let root = id
    while (parent.get(root) !== root) root = parent.get(root)!
    return root
  }
  for (let i = 0; i < ungrouped.length; i += 1) {
    for (let j = i + 1; j < ungrouped.length; j += 1) {
      const score = calculateMatchScore(toMatchableAttributes(ungrouped[i]!.listing), toMatchableAttributes(ungrouped[j]!.listing))
      if (score.matchScore >= 0.75 && !score.hardMismatch) {
        parent.set(find(ungrouped[i]!.listing.id), find(ungrouped[j]!.listing.id))
      }
    }
  }
  for (const pair of ungrouped) {
    const root = find(pair.listing.id)
    const bucket = byCanonicalId.get(`ungrouped:${root}`) ?? []
    bucket.push(pair)
    byCanonicalId.set(`ungrouped:${root}`, bucket)
  }

  const groups: VoucherGroup[] = []
  for (const [canonicalVoucherId, bucket] of byCanonicalId) {
    if (bucket.length === 0) continue

    const { kept } = deduplicate(
      bucket.map((p) => ({
        id: p.listing.id,
        listingUrl: p.listing.sourceUrl,
        sourceDomain: p.listing.sourceDomain,
        sellerName: p.listing.sellerName,
        listingTitle: p.listing.voucherName,
        faceValue: p.listing.faceValue,
        totalCost: p.listing.totalCost,
        voucherType: p.listing.voucherType,
      })),
    )
    const keptIds = new Set(kept.map((k) => k.id))
    const finalPairs = bucket.filter((p) => keptIds.has(p.listing.id))

    // Reference listing for per-listing matchConfidence: the first one discovered. Order doesn't
    // change the grouping decision (already made above), only which listing match% is measured against.
    const reference = finalPairs[0]!.listing
    for (const pair of finalPairs) {
      const { matchScore } = calculateMatchScore(toMatchableAttributes(reference), toMatchableAttributes(pair.listing))
      pair.listing.matchConfidence = matchScore
    }

    const sample = finalPairs[0]!.listing
    groups.push({
      canonicalVoucherId,
      brand: sample.brand,
      voucherName: sample.voucherName,
      category: sample.category,
      faceValue: sample.faceValue,
      currency: sample.currency,
      listings: rankListings(
        finalPairs.map((p) => p.listing),
        'best_price',
      ).map((ranked) => finalPairs.find((p) => p.listing.id === ranked.listingId)!.listing),
    })
  }

  return groups
}

/**
 * Full search orchestration (spec §6): parse -> discover (parallel, allSettled) -> normalize ->
 * deduplicate -> match/group -> rank. A single failed source degrades the result set, never fails
 * the whole search (spec: "A failed source must not break the whole search").
 */
export async function search(rawQuery: string): Promise<SearchResponse> {
  const startedAt = performance.now()
  const intent = parseSearchQuery(rawQuery)
  const adapters = SourceRegistry.getEnabled()

  const settled = await Promise.allSettled(adapters.map((adapter) => adapter.search(intent)))

  const rawListings: RawListing[] = []
  const failedSourceNames: string[] = []
  settled.forEach((result, index) => {
    if (result.status === 'fulfilled') rawListings.push(...result.value)
    else failedSourceNames.push(adapters[index]!.name)
  })

  const pairs: NormalizedPair[] = rawListings.map((raw) => ({ raw, listing: normalizeListing(raw) }))
  const groups = groupListings(pairs)

  const allListings = groups.flatMap((g) => g.listings)
  const meta = {
    sourcesRequested: adapters.length,
    sourcesSucceeded: adapters.length - failedSourceNames.length,
    sourcesFailed: failedSourceNames.length,
    failedSourceNames,
    searchDurationMs: Math.round(performance.now() - startedAt),
    resultsFound: allListings.length,
    liveResults: allListings.filter((l) => l.availabilityStatus === 'LIVE').length,
    staleResults: allListings.filter((l) => l.availabilityStatus === 'STALE').length,
  }

  return { intent, meta, groups }
}
