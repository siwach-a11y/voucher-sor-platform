import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { search } from '@/services/searchService'

describe('searchService.search (full pipeline integration)', () => {
  // MockSourceAdapter uses Math.random() for simulated latency AND a per-source failure chance
  // (ClickCard Bazaar is intentionally flaky — see SourceRegistry). Pin it high so these
  // correctness tests aren't flaky; failure-path behavior is exercised by the UI, not asserted here.
  beforeAll(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
  })
  afterAll(() => {
    vi.restoreAllMocks()
  })

  it('finds the Starbucks THB 500 group and ranks the live cheapest listing first', async () => {
    const response = await search('Starbucks voucher 500')

    expect(response.intent.brand).toBe('Starbucks')
    const group = response.groups.find((g) => g.faceValue === 500 && g.brand === 'Starbucks')
    expect(group).toBeDefined()
    // 5 sources listed starbucks_500 in the mock data.
    expect(group!.listings.length).toBe(5)

    // Every listing in one group must be a real match against the others (spec: never group NO_MATCH items).
    for (const listing of group!.listings) {
      expect(listing.matchConfidence).toBeGreaterThanOrEqual(0.75)
    }

    // The cheapest listing (clickcard, 450, STALE) must not rank first — mirrors the spec §3 example.
    expect(group!.listings[0]!.totalCost).not.toBe(450)
  })

  it('never groups the THB 500 and THB 1000 Starbucks vouchers together (hard mismatch on face value)', async () => {
    const response = await search('Starbucks')
    const groups = response.groups.filter((g) => g.brand === 'Starbucks')
    expect(groups.length).toBeGreaterThanOrEqual(2)
    const faceValues = new Set(groups.map((g) => g.faceValue))
    expect(faceValues.has(500)).toBe(true)
    expect(faceValues.has(1000)).toBe(true)
  })

  it('reports search metadata (sources requested/succeeded, live/stale counts)', async () => {
    const response = await search('Steam 500')
    expect(response.meta.sourcesRequested).toBeGreaterThan(0)
    expect(response.meta.sourcesSucceeded + response.meta.sourcesFailed).toBe(response.meta.sourcesRequested)
    expect(response.meta.resultsFound).toBeGreaterThan(0)
  })

  it('returns an empty result set (not a thrown error) for a query with no matching brand', async () => {
    const response = await search('CompletelyUnknownBrandXYZ 999')
    expect(response.groups).toEqual([])
  })
}, 20000)
