import { SearchX } from 'lucide-react'

interface EmptyResultsProps {
  title: string
  description: string
}

export function EmptyResults({ title, description }: EmptyResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16 text-center">
      <SearchX size={28} className="mb-3 text-gray-400" />
      <p className="font-medium text-navy-900">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
    </div>
  )
}
