import type { SourceSearchMeta } from '@/types'

export function SearchSummary({ query, meta }: { query: string; meta: SourceSearchMeta }) {
  return (
    <div className="text-sm text-gray-500">
      <span className="font-medium text-navy-900">{meta.resultsFound}</span> listings found for &ldquo;{query}&rdquo; across{' '}
      <span className="font-medium text-navy-900">{meta.sourcesSucceeded}</span> of {meta.sourcesRequested} sources
      {meta.sourcesFailed > 0 && (
        <span className="text-stale"> ({meta.sourcesFailed} source{meta.sourcesFailed === 1 ? '' : 's'} unavailable)</span>
      )}
      {' · '}
      <span className="font-medium text-live">{meta.liveResults} live</span>, {meta.staleResults} stale{' · '}
      completed in {(meta.searchDurationMs / 1000).toFixed(1)}s
    </div>
  )
}
