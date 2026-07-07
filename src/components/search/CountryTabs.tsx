import { COUNTRIES } from '@/data/countries'

export function CountryTabs({ selected, onSelect }: { selected: string; onSelect: (country: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={() => onSelect('all')}
        className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
          selected === 'all' ? 'bg-accent-600 text-white' : 'bg-white text-navy-700 border border-gray-200 hover:border-navy-700'
        }`}
      >
        All Markets
      </button>
      {COUNTRIES.map((country) => (
        <button
          key={country.name}
          type="button"
          onClick={() => onSelect(country.name)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            selected === country.name ? 'bg-accent-600 text-white' : 'bg-white text-navy-700 border border-gray-200 hover:border-navy-700'
          }`}
        >
          {country.name}
        </button>
      ))}
    </div>
  )
}
