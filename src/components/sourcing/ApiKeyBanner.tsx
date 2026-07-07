import { useState } from 'react'
import { setStoredKey } from '@/utils/apiKeyStore'
import { Button } from '@/components/common/Button'
import { KeyRound } from 'lucide-react'

export function ApiKeyBanner({ onSaved }: { onSaved: () => void }) {
  const [key, setKey] = useState('')

  function handleSave() {
    if (!key.trim()) return
    setStoredKey(key)
    onSaved()
  }

  return (
    <div className="rounded-lg border border-accent-200 bg-accent-50 p-4">
      <div className="flex items-start gap-2">
        <KeyRound size={16} className="mt-0.5 shrink-0 text-accent-700" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-navy-900">Add your Anthropic API key to search</p>
          <p className="mt-0.5 text-xs text-gray-600">
            VoucherHub has no backend — Global Sourcing calls the Anthropic API directly from your browser using your own
            key. The key is stored only in this browser's local storage and is sent only to api.anthropic.com, never to
            any VoucherHub-controlled server.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              type="password"
              value={key}
              onChange={(event) => setKey(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSave()}
              placeholder="sk-ant-..."
              className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-accent-500 focus:outline-none"
            />
            <Button size="sm" onClick={handleSave} disabled={!key.trim()}>
              Save key
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
