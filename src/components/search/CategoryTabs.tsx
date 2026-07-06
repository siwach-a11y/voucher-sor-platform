import { CATEGORIES } from '@/data/categories'

export function CategoryTabs({ selected, onSelect }: { selected: string; onSelect: (categoryId: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.id)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            selected === category.id ? 'bg-accent-600 text-white' : 'bg-white text-navy-700 border border-gray-200 hover:border-navy-700'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}
