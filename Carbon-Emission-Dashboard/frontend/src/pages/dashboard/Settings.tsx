// src/pages/dashboard/Settings.tsx
import { useMemo, useState } from 'react'
import { Settings as SettingsIcon, Sun, Moon, Bell, Save, MapPin } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { getCitiesForState, getStates } from '@/lib/locations'
import toast from 'react-hot-toast'

export default function Settings() {
  const { theme, toggleTheme, userState, userCity, setLocation } = useAppStore()
  const states = useMemo(() => getStates(), [])
  const [selectedState, setSelectedState] = useState(userState)
  const cities = useMemo(() => getCitiesForState(selectedState), [selectedState])
  const [selectedCity, setSelectedCity] = useState(
    cities.some((location) => location.city === userCity) ? userCity : cities[0]?.city || userCity,
  )
  const [emailNotifs, setEmailNotifs] = useState(true)

  const handleStateChange = (state: string) => {
    const nextCities = getCitiesForState(state)
    setSelectedState(state)
    setSelectedCity(nextCities[0]?.city || '')
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCity) {
      toast.error('Please select a city')
      return
    }
    setLocation(selectedCity, undefined, selectedState)
    toast.success('Settings updated successfully!')
  }

  return (
    <div className="space-y-8 max-w-4xl dashboard-page-clean">
      <div className="page-heading-clean">
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <SettingsIcon className="text-emerald-400" /> App Settings
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage your theme, synchronized location preferences, and notification channels.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card space-y-4 dashboard-card-clean">
          <h3 className="font-semibold text-white text-base border-b border-white/10 pb-3 flex items-center gap-2">
            {theme === 'dark' ? <Moon size={18} className="text-blue-400" /> : <Sun size={18} className="text-amber-400" />} Appearance
          </h3>

          <div className="settings-row">
            <div>
              <p className="text-sm text-gray-200 font-medium">Dashboard Theme</p>
              <p className="text-xs text-gray-400">Switch between dark and light visual mode.</p>
            </div>

            <button type="button" onClick={toggleTheme} className="btn-secondary text-xs py-2 px-4 flex items-center gap-2 capitalize">
              Current: {theme} mode
            </button>
          </div>
        </div>

        <div className="card space-y-4 dashboard-card-clean">
          <h3 className="font-semibold text-white text-base border-b border-white/10 pb-3 flex items-center gap-2">
            <MapPin size={18} className="text-emerald-400" /> Location & Environment
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">State</label>
              <select value={selectedState} onChange={(e) => handleStateChange(e.target.value)} className="input-field text-sm">
                {states.map((state: string) => <option key={state} value={state}>{state}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">City for AQI, Weather & Map</label>
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="input-field text-sm">
                {cities.map((location) => <option key={location.city} value={location.city}>{location.city}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card space-y-4 dashboard-card-clean">
          <h3 className="font-semibold text-white text-base border-b border-white/10 pb-3 flex items-center gap-2">
            <Bell size={18} className="text-emerald-400" /> Notifications
          </h3>

          <div className="settings-row">
            <div>
              <p className="text-sm text-gray-200 font-medium">Monthly Sustainability Email Summary</p>
              <p className="text-xs text-gray-400">Receive carbon auditing reports directly to your inbox.</p>
            </div>
            <input type="checkbox" checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} className="w-5 h-5 accent-emerald-500 cursor-pointer" />
          </div>
        </div>

        <button type="submit" className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2">
          <Save size={16} /> Save Settings
        </button>
      </form>
    </div>
  )
}
