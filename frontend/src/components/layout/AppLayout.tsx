import { Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/context/useAuth'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppLayout() {
  const { user } = useAuth()
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-[#0b0f14] text-slate-100">
      <Sidebar currentPath={location.pathname} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar userName={user?.name ?? 'User'} />

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}