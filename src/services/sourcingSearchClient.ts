import type { GlobalSourceResult, SourcingSearchParams } from '@/types'
import { getStoredKey, MISSING_KEY_ERROR } from '@/utils/apiKeyStore'
import { buildSourcingPrompt, parseSourcingResults, rankSourcingResults } from '@/services/sourcingPrompt'

const MODEL = 'claude-opus-4-5'

/**
 * Runs the Global Sourcing AI search directly from the browser using the visitor's own Anthropic
 * API key (VoucherHub has no backend — this is a static site). The key is sent only to
 * api.anthropic.com, never to any VoucherHub-controlled endpoint. See utils/apiKeyStore.ts.
 */
export async function searchGlobalSources(params: SourcingSearchParams): Promise<GlobalSourceResult[]> {
  const key = getStoredKey()
  if (!key) {
    const err = new Error('Add your Anthropic API key to search.')
    err.name = MISSING_KEY_ERROR
    throw err
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 3000,
      messages: [{ role: 'user', content: buildSourcingPrompt(params) }],
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 8 }],
    }),
  })

  if (res.status === 401) throw new Error('Invalid API key. Check the key and re-enter it.')
  if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`)

  const data = await res.json()
  const text = (data.content ?? [])
    .map((block: { type: string; text?: string }) => (block.type === 'text' ? (block.text ?? '') : ''))
    .join('\n')

  return rankSourcingResults(parseSourcingResults(text, params.targetCountry))
}
