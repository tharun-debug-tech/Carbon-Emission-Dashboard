// src/store/useAppStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Notification } from '@/types'
import { DEFAULT_LOCATION, getLocation, getLocationByCity } from '@/lib/locations'
import type { LocationOption } from '@/lib/locations'

interface AppState {
  theme: 'dark' | 'light'
  toggleTheme: () => void

  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void

  sidebarCollapsed: boolean
  toggleSidebar: () => void

  notifications: Notification[]
  addNotification: (n: Notification) => void
  markAllRead: () => void

  userCountry: string
  userCountryCode: string
  userFlag: string
  userState: string
  userCity: string
  userLat: number
  userLon: number
  userTimezone: string
  setLocation: (city: string, country?: string, state?: string) => void
  setLocationObject: (loc: LocationOption) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'dark' ? 'light' : 'dark'
          document.documentElement.setAttribute('data-theme', next)
          return { theme: next }
        }),

      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => {
        localStorage.removeItem('ecotrack-store')
        set({ user: null, isAuthenticated: false, notifications: [] })
      },

      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      notifications: [],
      addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications] })),
      markAllRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      userCountry: DEFAULT_LOCATION.country,
      userCountryCode: DEFAULT_LOCATION.countryCode,
      userFlag: DEFAULT_LOCATION.flag,
      userState: DEFAULT_LOCATION.state,
      userCity: DEFAULT_LOCATION.city,
      userLat: DEFAULT_LOCATION.lat,
      userLon: DEFAULT_LOCATION.lon,
      userTimezone: DEFAULT_LOCATION.timezone,

      setLocation: (city, country, state) =>
        set(() => {
          const location = state ? getLocation(state, city) : getLocationByCity(city) || DEFAULT_LOCATION
          return {
            userCountry: country || location.country,
            userCountryCode: location.countryCode,
            userFlag: location.flag,
            userState: location.state,
            userCity: location.city,
            userLat: location.lat,
            userLon: location.lon,
            userTimezone: location.timezone,
          }
        }),

      setLocationObject: (loc: LocationOption) =>
        set({
          userCountry: loc.country,
          userCountryCode: loc.countryCode,
          userFlag: loc.flag,
          userState: loc.state,
          userCity: loc.city,
          userLat: loc.lat,
          userLon: loc.lon,
          userTimezone: loc.timezone,
        }),
    }),
    {
      name: 'ecotrack-store',
      version: 3,
      migrate: (persisted) => {
        const state = (persisted || {}) as Partial<AppState>
        const location = getLocationByCity(state.userCity || '') || DEFAULT_LOCATION
        return {
          theme: state.theme || 'dark',
          user: state.user || null,
          isAuthenticated: state.isAuthenticated || false,
          sidebarCollapsed: state.sidebarCollapsed || false,
          notifications: state.notifications || [],
          userCountry: state.userCountry || location.country,
          userCountryCode: location.countryCode,
          userFlag: location.flag,
          userState: state.userState || location.state,
          userCity: state.userCity || location.city,
          userLat: location.lat,
          userLon: location.lon,
          userTimezone: location.timezone,
        } as unknown as AppState
      },
      partialize: (state) => ({
        theme: state.theme,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sidebarCollapsed: state.sidebarCollapsed,
        userCountry: state.userCountry,
        userCountryCode: state.userCountryCode,
        userFlag: state.userFlag,
        userState: state.userState,
        userCity: state.userCity,
        userLat: state.userLat,
        userLon: state.userLon,
        userTimezone: state.userTimezone,
      }),
    }
  )
)
