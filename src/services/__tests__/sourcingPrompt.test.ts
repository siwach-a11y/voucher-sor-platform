import { describe, expect, it } from 'vitest'
import { buildSourcingPrompt, parseSourcingResults, rankSourcingResults } from '@/services/sourcingPrompt'

describe('buildSourcingPrompt', () => {
  it('tells the agent to search globally, not just within the target market', () => {
    const prompt = buildSourcingPrompt({ query: 'Steam Wallet', targetCountry: 'Sri Lanka' })
    expect(prompt).toContain('ANYWHERE IN THE WORLD')
    expect(prompt).toContain('Steam Wallet')
    expect(prompt).toContain('Sri Lanka')
    expect(prompt).toContain('LKR')
  })
})

describe('parseSourcingResults', () => {
  const validJson = JSON.stringify({
    results: [
      { brand: 'Steam', sourceCountry: 'United States', sourceCurrency: 'USD', price: 20, sellerType: 'official', url: 'https://store.steampowered.com', trustScore: 95 },
      { brand: 'Steam', sourceCountry: 'Singapore', sourceCurrency: 'SGD', price: 27, sellerType: 'marketplace', url: 'https://example.sg/steam', trustScore: 55 },
    ],
  })

  it('parses a well-formed JSON response and converts price into the target currency', () => {
    const results = parseSourcingResults(validJson, 'Sri Lanka')
    expect(results).toHaveLength(2)
    expect(results[0]!.targetCurrency).toBe('LKR')
    // 20 USD at the fixed demo rate (1 USD = 300 LKR) should convert to roughly 6000 LKR.
    expect(results[0]!.convertedPrice).toBeCloseTo(6000, 0)
  })

  it('extracts JSON from a markdown code fence', () => {
    const fenced = `Here you go:\n\`\`\`json\n${validJson}\n\`\`\``
    const results = parseSourcingResults(fenced, 'Sri Lanka')
    expect(results).toHaveLength(2)
  })

  it('drops a result missing a required field rather than fabricating it', () => {
    const missingPrice = JSON.stringify({ results: [{ brand: 'Steam', sourceCountry: 'US', sourceCurrency: 'USD', sellerType: 'official', url: 'https://x.com' }] })
    expect(parseSourcingResults(missingPrice, 'Sri Lanka')).toEqual([])
  })

  it('returns an empty array for unparseable text instead of throwing', () => {
    expect(parseSourcingResults('not json at all', 'Sri Lanka')).toEqual([])
  })
})

describe('rankSourcingResults', () => {
  it('sorts by converted price ascending', () => {
    const results = parseSourcingResults(
      JSON.stringify({
        results: [
          { brand: 'A', sourceCountry: 'US', sourceCurrency: 'USD', price: 50, sellerType: 'official', url: 'https://a.com', trustScore: 80 },
          { brand: 'B', sourceCountry: 'US', sourceCurrency: 'USD', price: 10, sellerType: 'official', url: 'https://b.com', trustScore: 80 },
        ],
      }),
      'Sri Lanka',
    )
    const ranked = rankSourcingResults(results)
    expect(ranked[0]!.brand).toBe('B')
    expect(ranked[1]!.brand).toBe('A')
  })

  it('breaks ties on price by higher trust score first', () => {
    const results = parseSourcingResults(
      JSON.stringify({
        results: [
          { brand: 'LowTrust', sourceCountry: 'US', sourceCurrency: 'USD', price: 10, sellerType: 'marketplace', url: 'https://a.com', trustScore: 30 },
          { brand: 'HighTrust', sourceCountry: 'US', sourceCurrency: 'USD', price: 10, sellerType: 'official', url: 'https://b.com', trustScore: 90 },
        ],
      }),
      'Sri Lanka',
    )
    const ranked = rankSourcingResults(results)
    expect(ranked[0]!.brand).toBe('HighTrust')
  })
})
