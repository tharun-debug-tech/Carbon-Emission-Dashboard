// src/hooks/useGeolocation.ts
import { useState, useEffect } from 'react'

interface GeoState {
  lat: number | null
  lon: number | null
  loading: boolean
  error: string | null
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ lat: null, lon: null, loading: true, error: null })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ lat: 19.076, lon: 72.877, loading: false, error: 'Geolocation not supported' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setState({ lat: pos.coords.latitude, lon: pos.coords.longitude, loading: false, error: null }),
      () => setState({ lat: 19.076, lon: 72.877, loading: false, error: 'Location access denied' }),
      { timeout: 5000 }
    )
  }, [])

  return state
}
