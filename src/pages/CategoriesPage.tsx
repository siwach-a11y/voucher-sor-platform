import { useNavigate } from 'react-router-dom'
import { CATEGORIES } from '@/data/categories'
import { Card } from '@/components/common/Card'
import { LayoutGrid } from 'lucide-react'

export function CategoriesPage() {
  const navigate = useNavigate()
  const browsable = CATEGORIES.filter((c) => c.id !== 'all')

  return (
    <div className="p-6">
      <h1 className="mb-1 text-xl font-semibold text-navy-900">Categories</h1>
      <p className="mb-6 text-sm text-gray-500">Browse voucher listings by category.</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {browsable.map((category) => (
          <Card
            key={category.id}
            className="cursor-pointer p-5 text-center transition-colors hover:border-navy-700"
            onClick={() => navigate(`/search?q=${encodeURIComponent(category.label)}`)}
          >
            <LayoutGrid size={20} className="mx-auto mb-2 text-accent-600" />
            <p className="text-sm font-medium text-navy-900">{category.label}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
