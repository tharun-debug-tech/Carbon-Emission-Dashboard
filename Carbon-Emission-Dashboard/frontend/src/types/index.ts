// src/types/index.ts
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  country?: string
  city?: string
  theme_preference: 'dark' | 'light' | 'system'
}

export interface ElectricityRecord {
  id: string
  user_id: string
  units_kwh: number
  bill_amount?: number
  period_start: string
  period_end: string
  source: 'grid' | 'solar' | 'wind' | 'mixed'
  notes?: string
  carbon_kg: number
  created_at: string
}

export interface TransportRecord {
  id: string
  user_id: string
  transport_type: 'car' | 'bus' | 'train' | 'flight' | 'bike' | 'walk' | 'motorcycle' | 'electric_vehicle'
  distance_km: number
  fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'cng' | 'none'
  passengers: number
  trip_date: string
  purpose?: string
  carbon_kg?: number
  notes?: string
  created_at: string
}

export interface WasteRecord {
  id: string
  user_id: string
  waste_type: 'plastic' | 'paper' | 'glass' | 'metal' | 'organic' | 'electronic' | 'hazardous' | 'mixed'
  weight_kg: number
  disposal_method: 'landfill' | 'recycled' | 'composted' | 'incinerated' | 'donated'
  record_date: string
  carbon_kg?: number
  notes?: string
  created_at: string
}

export interface Activity {
  id: string
  user_id: string
  activity_type: 'electricity' | 'transport' | 'waste' | 'food' | 'other'
  title: string
  description?: string
  carbon_kg: number
  activity_date: string
  created_at: string
}

export interface CarbonBreakdown {
  electricity_kg: number
  transport_kg: number
  waste_kg: number
  total_kg: number
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  period_days: number
}

export interface WeatherData {
  city: string
  country: string
  temp: number
  feels_like: number
  humidity: number
  wind_speed: number
  description: string
  icon: string
  weather_code: number
  visibility: number
  pressure: number
}

export interface AQIData {
  city: string
  aqi: number
  pm25: number
  pm10: number
  co: number
  no2: number
  o3: number
  so2: number
  label: string
  color: string
}

export interface Recommendation {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: 'electricity' | 'transport' | 'waste' | 'lifestyle'
  potential_saving_kg: number
  icon: string
}

export interface ChartDataPoint {
  label: string
  value: number
  date?: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'alert' | 'milestone'
  read: boolean
  created_at: string
}

export interface SustainabilityScore {
  score: number
  grade: string
  week_start: string
  electricity_kg: number
  transport_kg: number
  waste_kg: number
  total_kg: number
}
