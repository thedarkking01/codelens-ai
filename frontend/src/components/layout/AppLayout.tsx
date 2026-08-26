import { Outlet, useLocation } from 'react-router-dom'

import Sidebar from './Sidebar'
import Topbar from './Topbar'

interface AppLayoutProps {
  userName?: string
}

export default function AppLayout({
  userName = 'User',
}: AppLayoutProps) {
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-[#0b0f14] text-slate-100">
      <Sidebar currentPath={location.pathname} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar userName={userName} />

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}