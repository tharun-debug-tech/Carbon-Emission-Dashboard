// src/hooks/useAQI.ts
import { useQuery } from '@tanstack/react-query'
import { fetchAQI, fetchAQIByCoords } from '@/services/api'

export function useAQI(city: string) {
  return useQuery({
    queryKey: ['aqi', city],
    queryFn: () => fetchAQI(city),
    staleTime: 15 * 60 * 1000, // 15 min
    retry: 1,
  })
}

export function useAQIByCoords(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ['aqi-coords', lat, lon],
    queryFn: () => fetchAQIByCoords(lat!, lon!),
    enabled: !!lat && !!lon,
    staleTime: 15 * 60 * 1000,
    retry: 1,
  })
}
