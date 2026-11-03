// src/components/layout/Navbar.tsx
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Sun, Moon, Menu, Droplets, Wind,
  Search, User, LogOut, Settings
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { useWeather } from '@/hooks/useWeather'
import { useAQI } from '@/hooks/useAQI'
import { getAQILabel, getWeatherIcon } from '@/lib/utils'
import { GlobalLocationSelector } from '@/components/ui/GlobalLocationSelector'
import CommandPalette from './CommandPalette'

// ── Weather Pill ───────────────────────────────────────────────
function WeatherPill({ city }: { city: string }) {
  const navigate = useNavigate()
  const { data: weather } = useWeather(city)
  if (!weather) return null

  const icon = getWeatherIcon(weather.weather_code || 802)

  return (
    <motion.button
      className="glass-pill"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => navigate('/dashboard/environment')}
      style={{ color: 'var(--text-primary)', border: 'none', background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.10)' }}
    >
      <span style={{ fontSize: '1rem' }}>{icon}</span>
      <span style={{ fontWeight: 700, color: '#f9fafb' }}>{weather.temp}°C</span>
      <span style={{ color: 'var(--text-muted)' }}>·</span>
      <Droplets size={11} style={{ color: '#60a5fa' }} />
      <span style={{ color: 'var(--text-muted)' }}>{weather.humidity}%</span>
      <span style={{ color: 'var(--text-muted)' }}>·</span>
      <Wind size={11} style={{ color: '#2dd4bf' }} />
      <span style={{ color: 'var(--text-muted)' }}>{weather.wind_speed}m/s</span>
    </motion.button>
  )
}

// ── AQI Pill ───────────────────────────────────────────────────
function AQIPill({ city }: { city: string }) {
  const navigate = useNavigate()
  const { data: aqi } = useAQI(city)
  if (!aqi) return null
  const aqiInfo = getAQILabel(aqi.aqi)

  return (
    <motion.button
      className="glass-pill"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => navigate('/dashboard/environment')}
      style={{
        background: `${aqiInfo.bgColor}`,
        border: `1px solid ${aqiInfo.color}30`,
        color: aqiInfo.color,
      }}
    >
      <span style={{ fontSize: '0.9rem' }}>🌫️</span>
      <span style={{ fontWeight: 700 }}>AQI {aqi.aqi}</span>
      <span style={{ opacity: 0.75, fontSize: '0.72rem' }}>{aqiInfo.label}</span>
    </motion.button>
  )
}

// ── Profile Menu ───────────────────────────────────────────────
function ProfileMenu() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const logout = useAppStore((s) => s.logout)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initial = (user?.full_name || user?.email || 'U')[0].toUpperCase()

  return (
    <div style={{ position: 'relative' }} ref={wrapRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          border: '2px solid rgba(16,185,129,0.3)',
          color: 'white', fontWeight: 700, fontSize: '0.85rem',
          cursor: 'pointer', flexShrink: 0, transition: 'all 200ms ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.7)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(16,185,129,0.3)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'; e.currentTarget.style.boxShadow = 'none' }}
      >
        {initial}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: 220, background: 'rgba(10,15,30,0.97)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(24px)',
              zIndex: 100,
            }}
          >
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.full_name || 'Demo User'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{user?.email || 'demo@ecotrack.app'}</div>
            </div>
            {[
              { icon: User, label: 'Profile', path: '/dashboard/profile' },
              { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
            ].map(({ icon: Icon, label, path }) => (
              <button key={path}
                onClick={() => { navigate(path); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '10px 16px', background: 'none', border: 'none',
                  color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer',
                  transition: 'all 150ms ease', textAlign: 'left',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 4 }}>
              <button
                onClick={() => { logout(); navigate('/login', { replace: true }) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '10px 16px', background: 'none', border: 'none',
                  color: '#f87171', fontSize: '0.85rem', cursor: 'pointer',
                  transition: 'all 150ms ease', textAlign: 'left',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main Navbar ────────────────────────────────────────────────
export default function Navbar() {
  const { theme, toggleTheme, notifications, markAllRead, userCity, sidebarCollapsed, toggleSidebar } = useAppStore()
  const [notifOpen, setNotifOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const unread = notifications.filter((n) => !n.read).length

  const handleNotifClick = () => {
    setNotifOpen((o) => !o)
    if (!notifOpen && unread > 0) markAllRead()
  }

  // Ctrl+K shortcut
  const handleGlobalKey = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      setPaletteOpen(true)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKey)
    return () => document.removeEventListener('keydown', handleGlobalKey)
  }, [handleGlobalKey])

  // Close notif on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      <header
        id="dashboard-navbar"
        className="navbar-premium"
        style={{
          left: sidebarCollapsed ? '72px' : '260px',
        }}
      >
        {/* Mobile menu */}
        <button onClick={toggleSidebar} className="glass-icon-btn md:hidden" style={{ color: 'var(--text-muted)' }}>
          <Menu size={18} />
        </button>

        {/* LEFT — Location Selector */}
        <div className="hidden md:flex">
          <GlobalLocationSelector />
        </div>

        {/* Flex spacer */}
        <div style={{ flex: 1 }} />

        {/* CENTER — Command Palette Trigger */}
        <button
          className="command-palette-trigger hidden md:flex"
          onClick={() => setPaletteOpen(true)}
          style={{ color: 'var(--text-muted)' }}
        >
          <Search size={14} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: '0.82rem', textAlign: 'left' }}>Search…</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <kbd className="command-palette-kbd">Ctrl</kbd>
            <kbd className="command-palette-kbd">K</kbd>
          </span>
        </button>

        <div style={{ flex: 1 }} />

        {/* RIGHT — Pillar pills + actions */}
        <div className="hidden md:flex items-center" style={{ gap: 6 }}>
          <WeatherPill city={userCity} />
          <AQIPill city={userCity} />
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            id="notif-btn"
            className="glass-icon-btn"
            onClick={handleNotifClick}
            style={{ color: 'var(--text-muted)' }}
          >
            <Bell size={17} />
            {unread > 0 && <span className="notif-dot">{unread}</span>}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.16 }}
                style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                  width: 300, background: 'rgba(10,15,30,0.97)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 16, overflow: 'hidden',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(24px)', zIndex: 100,
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Notifications</span>
                  {unread > 0 && <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>{unread} new</span>}
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    🎉 You're all caught up!
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div key={n.id} style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 150ms' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{n.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{n.message}</div>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme toggle */}
        <button
          id="theme-toggle"
          className="glass-icon-btn"
          onClick={toggleTheme}
          style={{ color: theme === 'dark' ? '#fbbf24' : '#60a5fa' }}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Profile */}
        <ProfileMenu />

        {/* Mobile search trigger */}
        <button className="glass-icon-btn md:hidden" onClick={() => setPaletteOpen(true)} style={{ color: 'var(--text-muted)' }}>
          <Search size={17} />
        </button>
      </header>
    </>
  )
}
