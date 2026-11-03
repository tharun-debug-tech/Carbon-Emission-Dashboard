// src/components/layout/CommandPalette.tsx
import { useEffect, useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Search, LayoutDashboard, Activity, Calculator, Cloud,
  BarChart3, Globe, FileText, Settings, User, MapPin,
  Zap, ArrowRight, X
} from 'lucide-react'
import { LOCATIONS } from '@/lib/locations'
import { useAppStore } from '@/store/useAppStore'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  color: string
  action: () => void
  category: string
  keywords?: string[]
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const setLocationObject = useAppStore((s) => s.setLocationObject)
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const go = useCallback((path: string) => {
    navigate(path)
    onClose()
  }, [navigate, onClose])

  const ALL_ITEMS: CommandItem[] = [
    // Navigation
    { id: 'nav-dashboard', label: 'Dashboard', description: 'Go to Dashboard Home', icon: <LayoutDashboard size={15} />, color: '#10b981', action: () => go('/dashboard'), category: 'Navigation', keywords: ['home', 'overview'] },
    { id: 'nav-activities', label: 'Activities', description: 'Log & view activities', icon: <Activity size={15} />, color: '#3b82f6', action: () => go('/dashboard/activities'), category: 'Navigation', keywords: ['log', 'history'] },
    { id: 'nav-calculator', label: 'Carbon Calculator', description: 'Calculate your footprint', icon: <Calculator size={15} />, color: '#8b5cf6', action: () => go('/dashboard/calculator'), category: 'Navigation', keywords: ['calc', 'footprint', 'estimate'] },
    { id: 'nav-environment', label: 'Live Environment', description: 'Real-time weather & AQI', icon: <Cloud size={15} />, color: '#06b6d4', action: () => go('/dashboard/environment'), category: 'Navigation', keywords: ['weather', 'aqi', 'air quality'] },
    { id: 'nav-analytics', label: 'Analytics', description: 'Charts and deep insights', icon: <BarChart3 size={15} />, color: '#f59e0b', action: () => go('/dashboard/analytics'), category: 'Navigation', keywords: ['charts', 'insights', 'trends'] },
    { id: 'nav-map', label: 'World Map', description: 'Global sustainability map', icon: <Globe size={15} />, color: '#10b981', action: () => go('/dashboard/map'), category: 'Navigation', keywords: ['globe', 'world', 'sustainability'] },
    { id: 'nav-reports', label: 'Reports', description: 'Download PDF reports', icon: <FileText size={15} />, color: '#6366f1', action: () => go('/dashboard/reports'), category: 'Navigation', keywords: ['pdf', 'download', 'export'] },
    { id: 'nav-settings', label: 'Settings', description: 'Account & preferences', icon: <Settings size={15} />, color: '#9ca3af', action: () => go('/dashboard/settings'), category: 'Navigation', keywords: ['config', 'preferences', 'account'] },
    { id: 'nav-profile', label: 'Profile', description: 'Your profile page', icon: <User size={15} />, color: '#ec4899', action: () => go('/dashboard/profile'), category: 'Navigation', keywords: ['account', 'user'] },
    // Locations
    ...LOCATIONS.map((loc) => ({
      id: `city-${loc.countryCode}-${loc.stateCode}-${loc.city}`,
      label: `${loc.flag} ${loc.city}`,
      description: `${loc.state} · ${loc.country} — Switch node`,
      icon: <MapPin size={15} />,
      color: '#34d399',
      action: () => { setLocationObject(loc); onClose() },
      category: 'Locations',
      keywords: [loc.state.toLowerCase(), loc.country.toLowerCase(), loc.countryCode.toLowerCase()],
    })),
    // Quick Actions
    { id: 'action-log', label: 'Log New Activity', description: 'Record your carbon activity', icon: <Zap size={15} />, color: '#f59e0b', action: () => go('/dashboard/calculator'), category: 'Quick Actions', keywords: ['log', 'add', 'new'] },
  ]

  const filtered = query.trim().length === 0
    ? ALL_ITEMS.slice(0, 10)
    : ALL_ITEMS.filter((item) => {
        const q = query.toLowerCase()
        return (
          item.label.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.keywords?.some((k) => k.includes(q))
        )
      })

  const grouped: Record<string, CommandItem[]> = {}
  for (const item of filtered) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  }

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => { setActiveIdx(0) }, [query])

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (!open) return
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter') { e.preventDefault(); filtered[activeIdx]?.action() }
  }, [open, filtered, activeIdx, onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  // Scroll active item into view
  useEffect(() => {
    const el = resultsRef.current?.querySelector(`[data-idx="${activeIdx}"]`)
    if (el) el.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  let flatIdx = 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="command-palette-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <motion.div
            className="command-palette-modal"
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="command-palette-input-wrap">
              <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                ref={inputRef}
                className="command-palette-input"
                placeholder="Search pages, cities, actions…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="command-palette-results" ref={resultsRef}>
              {filtered.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No results for "{query}"
                </div>
              ) : (
                Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <div className="command-palette-section-label">{category}</div>
                    {items.map((item) => {
                      const idx = flatIdx++
                      return (
                        <button
                          key={item.id}
                          data-idx={idx}
                          className={`command-palette-item w-full text-left ${activeIdx === idx ? 'active' : ''}`}
                          onMouseEnter={() => setActiveIdx(idx)}
                          onClick={item.action}
                          style={{ border: 'none', background: 'none', width: '100%' }}
                        >
                          <div
                            className="command-palette-item-icon"
                            style={{ background: `${item.color}18`, color: item.color }}
                          >
                            {item.icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                              {item.label}
                            </div>
                            {item.description && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>
                                {item.description}
                              </div>
                            )}
                          </div>
                          <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, opacity: activeIdx === idx ? 1 : 0, transition: 'opacity 150ms ease' }} />
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="command-palette-footer">
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <kbd className="command-palette-kbd">↑↓</kbd> navigate
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <kbd className="command-palette-kbd">↵</kbd> open
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <kbd className="command-palette-kbd">Esc</kbd> close
              </span>
              <span style={{ marginLeft: 'auto' }}>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
