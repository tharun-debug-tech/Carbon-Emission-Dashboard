// src/pages/dashboard/Profile.tsx
import { useMemo, useState } from 'react'
import { User as UserIcon, ShieldCheck, Save } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { getCitiesForState, getStates } from '@/lib/locations'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, setUser, userState, userCity, userCountry, setLocation } = useAppStore()
  const states = useMemo(() => getStates(), [])

  const [name, setName] = useState(user?.full_name || 'Demo User')
  const [email, setEmail] = useState(user?.email || 'demo@ecotrack.app')
  const [country] = useState(user?.country || userCountry || 'IN')
  const [selectedState, setSelectedState] = useState(userState)
  const cities = useMemo(() => getCitiesForState(selectedState), [selectedState])
  const [city, setCity] = useState(cities.some((location) => location.city === (user?.city || userCity)) ? (user?.city || userCity) : cities[0]?.city || userCity)

  const handleStateChange = (state: string) => {
    const nextCities = getCitiesForState(state)
    setSelectedState(state)
    setCity(nextCities[0]?.city || '')
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (user) {
      setUser({ ...user, full_name: name, email, country, city })
    }
    setLocation(city, country, selectedState)
    toast.success('Profile updated successfully!')
  }

  return (
    <div className="space-y-8 max-w-4xl dashboard-page-clean">
      <div className="page-heading-clean">
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <UserIcon className="text-emerald-400" /> User Profile
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage your profile and synchronized environmental location.
        </p>
      </div>

      <div className="card space-y-6 p-6 dashboard-card-clean">
        <div className="profile-header-clean">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold font-display"
               style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            {(name || 'U')[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{name}</h2>
            <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck size={14} className="text-emerald-400" /> Verified EcoTrack Member
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">State</label>
              <select value={selectedState} onChange={(e) => handleStateChange(e.target.value)} className="input-field text-sm">
                {states.map((state: string) => <option key={state} value={state}>{state}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">City</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="input-field text-sm">
                {cities.map((location) => <option key={location.city} value={location.city}>{location.city}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2">
              <Save size={16} /> Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
