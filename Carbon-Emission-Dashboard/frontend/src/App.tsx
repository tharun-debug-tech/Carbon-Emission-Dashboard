// src/App.tsx
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ReactLenis } from 'lenis/react'
import { useAppStore } from '@/store/useAppStore'

// Pages
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardHome from '@/pages/dashboard/DashboardHome'
import Activities from '@/pages/dashboard/Activities'
import CarbonCalculator from '@/pages/dashboard/CarbonCalculator'
import LiveEnvironment from '@/pages/dashboard/LiveEnvironment'
import Analytics from '@/pages/dashboard/Analytics'
import WorldMap from '@/pages/dashboard/WorldMap'
import Reports from '@/pages/dashboard/Reports'
import Settings from '@/pages/dashboard/Settings'
import Profile from '@/pages/dashboard/Profile'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <BrowserRouter>
      <ReactLenis root options={{ lerp: 0.08, duration: 1.4, syncTouch: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="activities" element={<Activities />} />
            <Route path="calculator" element={<CarbonCalculator />} />
            <Route path="environment" element={<LiveEnvironment />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="map" element={<WorldMap />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Redirect unknown paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ReactLenis>
    </BrowserRouter>
  )
}
