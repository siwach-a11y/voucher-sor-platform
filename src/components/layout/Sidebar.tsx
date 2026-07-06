import { NavLink } from 'react-router-dom'
import { Bell, Clock, LayoutDashboard, LayoutGrid, Search, Settings, Star } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/watchlist', label: 'Watchlist', icon: Star },
  { to: '/alerts', label: 'Price Alerts', icon: Bell },
  { to: '/categories', label: 'Categories', icon: LayoutGrid },
  { to: '/history', label: 'History', icon: Clock },
]

export function Sidebar() {
  return (
    <aside className="flex h-full w-[230px] shrink-0 flex-col bg-navy-950 text-navy-200">
      <div className="px-5 py-6">
        <span className="text-lg font-semibold text-white">VoucherHub</span>
        <p className="mt-0.5 text-[11px] text-navy-200/70">Search once. Compare everything.</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive ? 'bg-accent-600 text-white' : 'text-navy-200 hover:bg-navy-800 hover:text-white'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-navy-800 px-3 py-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
              isActive ? 'bg-accent-600 text-white' : 'text-navy-200 hover:bg-navy-800 hover:text-white'
            }`
          }
        >
          <Settings size={16} />
          Settings
        </NavLink>
      </div>
    </aside>
  )
}
