export interface RecentSearchRecord {
  query: string
  searchedAt: string
  resultsFound: number
}

const STORAGE_KEY = 'voucherhub:recentSearches'
const MAX_RECORDS = 30

function readAll(): RecentSearchRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as RecentSearchRecord[]) : []
  } catch {
    return []
  }
}

export function getRecentSearches(limit = MAX_RECORDS): RecentSearchRecord[] {
  return readAll().slice(0, limit)
}

export function recordSearch(query: string, resultsFound: number): void {
  const trimmed = query.trim()
  if (!trimmed) return
  try {
    const existing = readAll().filter((r) => r.query.toLowerCase() !== trimmed.toLowerCase())
    const next = [{ query: trimmed, searchedAt: new Date().toISOString(), resultsFound }, ...existing].slice(0, MAX_RECORDS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // best-effort only
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // best-effort only
  }
}
