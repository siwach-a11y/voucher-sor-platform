import type { ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/pages/DashboardPage'
import { SearchPage } from '@/pages/SearchPage'
import { WatchlistPage } from '@/pages/WatchlistPage'
import { AlertsPage } from '@/pages/AlertsPage'
import { CategoriesPage } from '@/pages/CategoriesPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { SettingsPage } from '@/pages/SettingsPage'

function withShell(page: ReactNode) {
  return <AppShell>{page}</AppShell>
}

export const router = createBrowserRouter([
  { path: '/', element: withShell(<DashboardPage />) },
  { path: '/search', element: withShell(<SearchPage />) },
  { path: '/watchlist', element: withShell(<WatchlistPage />) },
  { path: '/alerts', element: withShell(<AlertsPage />) },
  { path: '/categories', element: withShell(<CategoriesPage />) },
  { path: '/history', element: withShell(<HistoryPage />) },
  { path: '/settings', element: withShell(<SettingsPage />) },
])
