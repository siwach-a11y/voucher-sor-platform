import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface DrawerProps {
  title: string
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

/** Slide-in-from-right panel — used as the right detail panel's mobile/tablet fallback (spec §31). */
export function Drawer({ title, isOpen, onClose, children }: DrawerProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-navy-950/40" onClick={onClose}>
      <div className="thin-scrollbar h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-navy-900">{title}</h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-navy-700 hover:bg-gray-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
