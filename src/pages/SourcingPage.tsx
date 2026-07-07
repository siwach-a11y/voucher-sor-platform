import { useState } from 'react'
import type { GlobalSourceResult } from '@/types'
import { COUNTRIES } from '@/data/countries'
import { hasStoredKey, clearStoredKey, MISSING_KEY_ERROR } from '@/utils/apiKeyStore'
import { searchGlobalSources } from '@/services/sourcingSearchClient'
import { ApiKeyBanner } from '@/components/sourcing/ApiKeyBanner'
import { GlobalSourceCard } from '@/components/sourcing/GlobalSourceCard'
import { EmptyResults } from '@/components/vouchers/EmptyResults'
import { Skeleton } from '@/components/common/Skeleton'
import { Button } from '@/components/common/Button'
import { KeyRound, Search } from 'lucide-react'

export function SourcingPage() {
  const [query, setQuery] = useState('')
  const [targetCountry, setTargetCountry] = useState(COUNTRIES[0]!.name)
  const [hasKey, setHasKey] = useState(hasStoredKey())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<GlobalSourceResult[] | null>(null)

  async function handleSearch() {
    if (!query.trim()) return
    if (!hasStoredKey()) {
      setHasKey(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const found = await searchGlobalSources({ query: query.trim(), targetCountry })
      setResults(found)
    } catch (err) {
      if (err instanceof Error && err.name === MISSING_KEY_ERROR) {
        setHasKey(false)
      } else {
        setError(err instanceof Error ? err.message : 'Search failed.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-1 text-xl font-semibold text-navy-900">Global Sourcing</h1>
      <p className="mb-6 text-sm text-gray-500">
        Find real vendors anywhere in the world selling a voucher or gift card, priced in your target resale market.
      </p>

      {!hasKey && <ApiKeyBanner onSaved={() => setHasKey(true)} />}

      {hasKey && (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            icon={<KeyRound size={14} />}
            onClick={() => {
              clearStoredKey()
              setHasKey(false)
            }}
          >
            Remove API key
          </Button>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
          placeholder='e.g. "Steam Wallet" or "Amazon gift card"'
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none"
        />
        <select
          value={targetCountry}
          onChange={(event) => setTargetCountry(event.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none"
        >
          {COUNTRIES.map((country) => (
            <option key={country.name} value={country.name}>
              Sell into {country.name} ({country.currency})
            </option>
          ))}
        </select>
        <Button icon={<Search size={14} />} onClick={handleSearch} disabled={!query.trim() || isLoading}>
          Search
        </Button>
      </div>

      <p className="mt-2 text-[11px] text-gray-400">
        Results are AI-generated from a live web search and may be inaccurate — verify price and legitimacy on the
        vendor's own site before purchasing. Converted prices use fixed, illustrative demo exchange rates, not live
        rates.
      </p>

      <div className="mt-5">
        {isLoading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        )}

        {!isLoading && error && <EmptyResults title="Search failed" description={error} />}

        {!isLoading && !error && results && results.length === 0 && (
          <EmptyResults title="No sources found" description="Try a different brand or voucher type." />
        )}

        {!isLoading && !error && results && results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => (
              <GlobalSourceCard key={result.id} result={result} rank={index + 1} />
            ))}
          </div>
        )}

        {!isLoading && !error && !results && (
          <EmptyResults
            title="Search for a voucher to find global sources"
            description='Try "Steam Wallet" or "Google Play gift card" and pick which market you plan to resell into.'
          />
        )}
      </div>
    </div>
  )
}
