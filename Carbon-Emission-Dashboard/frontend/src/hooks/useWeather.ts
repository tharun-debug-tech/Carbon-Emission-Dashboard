// src/hooks/useWeather.ts
import { useQuery } from '@tanstack/react-query'
import { fetchWeather, fetchWeatherByCoords } from '@/services/api'

export function useWeather(city: string) {
  return useQuery({
    queryKey: ['weather', city],
    queryFn: () => fetchWeather(city),
    staleTime: 10 * 60 * 1000, // 10 min
    retry: 1,
  })
}

export function useWeatherByCoords(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ['weather-coords', lat, lon],
    queryFn: () => fetchWeatherByCoords(lat!, lon!),
    enabled: !!lat && !!lon,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}
