// Client-side store for a visitor's own Anthropic API key.
//
// The key lives ONLY in the visitor's browser (localStorage) and is sent directly to
// api.anthropic.com from their browser for the Global Sourcing AI search. It is never uploaded to
// this site, committed, or stored on any server — VoucherHub has no backend.

const STORAGE_KEY = 'voucherhub:anthropicApiKey'
const CHANGE_EVENT = 'voucherhub:anthropic-key-change'

/** Thrown when an AI action is attempted with no key configured. */
export const MISSING_KEY_ERROR = 'MissingAnthropicKey'

export function getStoredKey(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function setStoredKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, key.trim())
    window.dispatchEvent(new Event(CHANGE_EVENT))
  } catch {
    // localStorage unavailable (private browsing, quota) — key just won't persist across reloads.
  }
}

export function clearStoredKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  } catch {
    // no-op
  }
}

export function hasStoredKey(): boolean {
  return Boolean(getStoredKey())
}

/** Subscribe to key add/remove changes (same-tab custom event + cross-tab storage event). */
export function onKeyChange(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}
