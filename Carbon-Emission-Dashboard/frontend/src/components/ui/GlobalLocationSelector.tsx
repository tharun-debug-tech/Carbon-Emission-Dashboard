// src/components/ui/GlobalLocationSelector.tsx
import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Search, ChevronDown, Check, Globe2, Building2, Navigation } from 'lucide-react'
import {
  getCountries,
  getStatesForCountry,
  getCitiesForState,
  getLocation,
} from '@/lib/locations'
import type { LocationOption } from '@/lib/locations'
import { useAppStore } from '@/store/useAppStore'

interface GlobalLocationSelectorProps {
  compact?: boolean
  className?: string
  onLocationChange?: (loc: LocationOption) => void
}

export function GlobalLocationSelector({
  compact = false,
  className = '',
  onLocationChange,
}: GlobalLocationSelectorProps) {
  const {
    userCountry,
    userState,
    userCity,
    userFlag,
    setLocationObject,
  } = useAppStore()

  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'country' | 'state' | 'city'>('country')

  // Selected values in dropdown before applying
  const [selCountry, setSelCountry] = useState(userCountry)
  const [selState, setSelState] = useState(userState)
  const [selCity, setSelCity] = useState(userCity)

  // Search queries
  const [countrySearch, setCountrySearch] = useState('')
  const [stateSearch, setStateSearch] = useState('')
  const [citySearch, setCitySearch] = useState('')

  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [panelPosition, setPanelPosition] = useState({ top: 64, left: 24, width: 360 })

  // Sync state when store changes externally
  useEffect(() => {
    setSelCountry(userCountry)
    setSelState(userState)
    setSelCity(userCity)
  }, [userCountry, userState, userCity])

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Keep the dropdown anchored to the trigger even inside the fixed dashboard navbar.
  useEffect(() => {
    if (!isOpen) return

    const updatePanelPosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return

      const width = Math.min(window.innerWidth - 24, compact ? 320 : 384)
      const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12)
      setPanelPosition({ top: rect.bottom + 10, left, width })
    }

    updatePanelPosition()
    window.addEventListener('resize', updatePanelPosition)
    window.addEventListener('scroll', updatePanelPosition, true)

    return () => {
      window.removeEventListener('resize', updatePanelPosition)
      window.removeEventListener('scroll', updatePanelPosition, true)
    }
  }, [isOpen, compact])

  // Derived lists
  const allCountries = useMemo(() => getCountries(), [])
  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase()
    if (!q) return allCountries
    return allCountries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    )
  }, [allCountries, countrySearch])

  const availableStates = useMemo(() => getStatesForCountry(selCountry), [selCountry])
  const filteredStates = useMemo(() => {
    const q = stateSearch.trim().toLowerCase()
    if (!q) return availableStates
    return availableStates.filter((s) => s.toLowerCase().includes(q))
  }, [availableStates, stateSearch])

  const availableCities = useMemo(() => getCitiesForState(selCountry, selState), [selCountry, selState])
  const filteredCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase()
    if (!q) return availableCities
    return availableCities.filter((c) => c.city.toLowerCase().includes(q))
  }, [availableCities, citySearch])

  const handleSelectCountry = (countryName: string) => {
    setSelCountry(countryName)
    const nextStates = getStatesForCountry(countryName)
    const nextState = nextStates[0] || ''
    setSelState(nextState)
    const nextCities = getCitiesForState(countryName, nextState)
    const nextCity = nextCities[0]?.city || ''
    setSelCity(nextCity)
    setActiveTab('state')
  }

  const handleSelectState = (stateName: string) => {
    setSelState(stateName)
    const nextCities = getCitiesForState(selCountry, stateName)
    const nextCity = nextCities[0]?.city || ''
    setSelCity(nextCity)
    setActiveTab('city')
  }

  const handleSelectCity = (loc: LocationOption) => {
    setSelCity(loc.city)
    setLocationObject(loc)
    onLocationChange?.(loc)
    setIsOpen(false)
  }

  const handleApplyCurrent = () => {
    const target = getLocation(selState, selCity)
    if (target) {
      setLocationObject(target)
      onLocationChange?.(target)
    }
    setIsOpen(false)
  }

  return (
    <div className={`relative location-dropdown-wrap ${className}`} ref={panelRef}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="glass-pill flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-xs text-white"
        style={{ backdropFilter: 'blur(16px)' }}
      >
        <span className="text-sm">{userFlag}</span>
        <span className="font-semibold text-emerald-400">{userCity}</span>
        {!compact && <span className="text-gray-400">· {userState}, {userCountry}</span>}
        <ChevronDown
          size={12}
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Glass Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="location-dropdown-panel p-3 rounded-2xl glass-card border border-white/15 bg-slate-950/95 backdrop-blur-2xl shadow-2xl space-y-3"
            style={{ top: panelPosition.top, left: panelPosition.left, width: panelPosition.width, boxShadow: '0 20px 50px rgba(0,0,0,0.7)' }}
          >
            {/* Header Tabs */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setActiveTab('country')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    activeTab === 'country'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Globe2 size={11} /> {selCountry || 'Country'}
                </button>
                <button
                  onClick={() => setActiveTab('state')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    activeTab === 'state'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Building2 size={11} /> {selState || 'State'}
                </button>
                <button
                  onClick={() => setActiveTab('city')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    activeTab === 'city'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Navigation size={11} /> {selCity || 'City'}
                </button>
              </div>
            </div>

            {/* TAB 1: COUNTRY */}
            {activeTab === 'country' && (
              <div className="space-y-2">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredCountries.map((c) => {
                    const isSel = c.name === selCountry
                    return (
                      <button
                        key={c.name}
                        onClick={() => handleSelectCountry(c.name)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                          isSel
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold'
                            : 'hover:bg-white/5 text-gray-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{c.flag}</span>
                          <span>{c.name}</span>
                        </span>
                        {isSel && <Check size={13} className="text-emerald-400" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: STATE / PROVINCE */}
            {activeTab === 'state' && (
              <div className="space-y-2">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search state in ${selCountry}...`}
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredStates.length === 0 ? (
                    <div className="text-xs text-gray-500 py-3 text-center">No states found</div>
                  ) : (
                    filteredStates.map((st) => {
                      const isSel = st === selState
                      return (
                        <button
                          key={st}
                          onClick={() => handleSelectState(st)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                            isSel
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold'
                              : 'hover:bg-white/5 text-gray-300'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Building2 size={12} className="text-gray-400" />
                            <span>{st}</span>
                          </span>
                          {isSel && <Check size={13} className="text-emerald-400" />}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: CITY */}
            {activeTab === 'city' && (
              <div className="space-y-2">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search city in ${selState}...`}
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredCities.length === 0 ? (
                    <div className="text-xs text-gray-500 py-3 text-center">No cities found</div>
                  ) : (
                    filteredCities.map((ct) => {
                      const isSel = ct.city === userCity
                      return (
                        <button
                          key={ct.city}
                          onClick={() => handleSelectCity(ct)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                            isSel
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold'
                              : 'hover:bg-white/5 text-gray-300'
                          }`}
                        >
                          <div className="flex flex-col text-left">
                            <span className="font-medium text-white flex items-center gap-1.5">
                              <MapPin size={11} className="text-emerald-400" /> {ct.city}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {ct.lat.toFixed(2)}°, {ct.lon.toFixed(2)}° · {ct.timezone}
                            </span>
                          </div>
                          {isSel && <Check size={13} className="text-emerald-400" />}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {/* Quick Action Footer */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-gray-400 text-[11px]">
                Selected: <strong className="text-white">{selCity}</strong> ({selCountry})
              </span>
              <button
                onClick={handleApplyCurrent}
                className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 transition-colors"
              >
                Apply Selection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


