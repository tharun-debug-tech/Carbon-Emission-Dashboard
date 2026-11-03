// src/components/layout/DashboardLayout.tsx
import { Outlet, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import GlobalEarthBackground, { type EarthMode } from '@/components/earth/GlobalEarthBackground'

export default function DashboardLayout() {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
  const location = useLocation()
  const earthMode: EarthMode = location.pathname.includes('/dashboard/analytics')
    ? 'analytics'
    : 'dashboard'

  return (
    <div className="dashboard-layout climate-dashboard-shell">
      <GlobalEarthBackground mode={earthMode} showWidgets={false} />
      <Sidebar />
      <main
        className="dashboard-main climate-dashboard-main"
        style={{
          marginLeft: sidebarCollapsed ? '72px' : '260px',
          transition: 'margin-left 0.3s ease',
        }}>
        <Navbar />
        <div className="dashboard-content-shell">
          <Outlet />
        </div>
      </main>
    </div>
  )
}


