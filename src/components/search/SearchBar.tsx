import { useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/common/Button'

export function SearchBar({ initialQuery = '', onSearch }: { initialQuery?: string; onSearch: (query: string) => void }) {
  const [query, setQuery] = useState(initialQuery)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (query.trim()) onSearch(query.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="relative flex-1">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          type="text"
          placeholder="Search vouchers, brands, gift cards…"
          className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 text-base focus:border-accent-500 focus:outline-none"
        />
      </div>
      <Button type="submit" size="md">
        Search
      </Button>
    </form>
  )
}
