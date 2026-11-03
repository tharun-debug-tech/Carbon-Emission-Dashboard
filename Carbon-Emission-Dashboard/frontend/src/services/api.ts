// src/services/api.ts
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const OPENWEATHER_KEY = import.meta.env.VITE_OPENWEATHER_KEY || ''
const AQICN_TOKEN = import.meta.env.VITE_AQICN_TOKEN || ''

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

function normalizeDatasetAQI(payload: any, fallbackCity: string) {
  if (!payload || payload.found === false || typeof payload.aqi !== 'number') return null
  const aqi = payload.aqi
  return {
    city: payload.city || fallbackCity,
    country: payload.country || '',
    aqi,
    pm25: payload.pm25 || 0,
    pm10: payload.pm10 || payload.pm25 || 0,
    co: payload.co || 0,
    no2: payload.no2 || 0,
    o3: payload.ozone || 0,
    so2: payload.so2 || 0,
    label: payload.aqi_category || getAQILabel(aqi),
    color: getAQIColor(aqi),
    source: 'historical-aqi-dataset',
  }
}

export async function fetchDatasetAQI(city: string = 'Mumbai', country?: string) {
  const res = await api.get('/api/datasets/aqi/city', { params: { city, country } })
  return normalizeDatasetAQI(res.data, city)
}

export async function fetchAQIRankings(limit = 10) {
  const res = await api.get('/api/datasets/aqi/rankings', { params: { limit } })
  return res.data
}

export async function fetchEnergySummary() {
  const res = await api.get('/api/datasets/energy/summary')
  return res.data
}

export async function fetchEnergyCountry(country: string) {
  const res = await api.get(`/api/datasets/energy/country/${encodeURIComponent(country)}`)
  return res.data
}

export async function fetchDatasetAnalytics(country = 'India') {
  const res = await api.get('/api/analytics/summary', { params: { country } })
  return res.data
}

// Attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecotrack_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ============================================================
// Weather API (OpenWeather)
// ============================================================
export async function fetchWeather(city: string = 'Mumbai') {
  if (!OPENWEATHER_KEY) return getMockWeather(city)
  try {
    const res = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_KEY}&units=metric`
    )
    const d = res.data
    return {
      city: d.name,
      country: d.sys.country,
      temp: Math.round(d.main.temp),
      feels_like: Math.round(d.main.feels_like),
      humidity: d.main.humidity,
      wind_speed: d.wind.speed,
      description: d.weather[0].description,
      icon: d.weather[0].icon,
      weather_code: d.weather[0].id,
      visibility: d.visibility,
      pressure: d.main.pressure,
    }
  } catch {
    return getMockWeather(city)
  }
}

export async function fetchWeatherByCoords(lat: number, lon: number) {
  if (!OPENWEATHER_KEY) return getMockWeather('Your Location')
  try {
    const res = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}&units=metric`
    )
    const d = res.data
    return {
      city: d.name,
      country: d.sys.country,
      temp: Math.round(d.main.temp),
      feels_like: Math.round(d.main.feels_like),
      humidity: d.main.humidity,
      wind_speed: d.wind.speed,
      description: d.weather[0].description,
      icon: d.weather[0].icon,
      weather_code: d.weather[0].id,
      visibility: d.visibility,
      pressure: d.main.pressure,
    }
  } catch {
    return getMockWeather('Your Location')
  }
}

// ============================================================
// AQI API (AQICN / WAQI)
// ============================================================
export async function fetchAQI(city: string = 'Mumbai') {
  if (!AQICN_TOKEN) return (await fetchDatasetAQI(city)) || getMockAQI(city)
  try {
    const res = await axios.get(
      `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${AQICN_TOKEN}`
    )
    if (res.data.status !== 'ok') return (await fetchDatasetAQI(city)) || getMockAQI(city)
    const d = res.data.data
    return {
      city: d.city?.name || city,
      aqi: d.aqi,
      pm25: d.iaqi?.pm25?.v || 0,
      pm10: d.iaqi?.pm10?.v || 0,
      co: d.iaqi?.co?.v || 0,
      no2: d.iaqi?.no2?.v || 0,
      o3: d.iaqi?.o3?.v || 0,
      so2: d.iaqi?.so2?.v || 0,
      label: getAQILabel(d.aqi),
      color: getAQIColor(d.aqi),
    }
  } catch {
    return (await fetchDatasetAQI(city)) || getMockAQI(city)
  }
}

export async function fetchAQIByCoords(lat: number, lon: number) {
  if (!AQICN_TOKEN) return getMockAQI('Your Location')
  try {
    const res = await axios.get(
      `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${AQICN_TOKEN}`
    )
    if (res.data.status !== 'ok') return getMockAQI('Your Location')
    const d = res.data.data
    return {
      city: d.city?.name || 'Your Location',
      aqi: d.aqi,
      pm25: d.iaqi?.pm25?.v || 0,
      pm10: d.iaqi?.pm10?.v || 0,
      co: d.iaqi?.co?.v || 0,
      no2: d.iaqi?.no2?.v || 0,
      o3: d.iaqi?.o3?.v || 0,
      so2: d.iaqi?.so2?.v || 0,
      label: getAQILabel(d.aqi),
      color: getAQIColor(d.aqi),
    }
  } catch {
    return getMockAQI('Your Location')
  }
}

// ============================================================
// Carbon Calculation
// ============================================================
export async function calculateCarbonWithDataset(data: {
  electricity_kwh: number
  car_km: number
  bus_km: number
  flight_km: number
  waste_kg: number
  fuel_type?: string
  country?: string
}) {
  const res = await api.post('/api/carbon/calculate', data)
  return res.data
}

export function calculateCarbonLocally(data: {
  electricity_kwh: number
  car_km: number
  bus_km: number
  flight_km: number
  waste_kg: number
  fuel_type?: string
}) {
  const electricityFactor = 0.82
  const carFactors: Record<string, number> = {
    petrol: 0.21, diesel: 0.17, electric: 0.05, hybrid: 0.12, cng: 0.16
  }
  const carFactor = carFactors[data.fuel_type || 'petrol']

  const electricity_kg = data.electricity_kwh * electricityFactor
  const car_kg = data.car_km * carFactor
  const bus_kg = data.bus_km * 0.089
  const flight_kg = data.flight_km * 0.255
  const waste_kg = data.waste_kg * 0.58
  const transport_kg = car_kg + bus_kg + flight_kg
  const total_kg = electricity_kg + transport_kg + waste_kg

  // Score: 100 = zero emissions, 50 = world avg (13.7 kg/day * 30)
  const daily_avg = total_kg / 30
  const score = Math.max(0, Math.min(100, Math.round(100 - (daily_avg / 13.7) * 50)))
  const grade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F'

  return {
    electricity_kg: Math.round(electricity_kg * 100) / 100,
    transport_kg: Math.round(transport_kg * 100) / 100,
    waste_kg: Math.round(waste_kg * 100) / 100,
    total_kg: Math.round(total_kg * 100) / 100,
    score,
    grade,
    breakdown: {
      car_kg: Math.round(car_kg * 100) / 100,
      bus_kg: Math.round(bus_kg * 100) / 100,
      flight_kg: Math.round(flight_kg * 100) / 100,
    }
  }
}

// ============================================================
// Recommendations engine
// ============================================================
export function generateRecommendations(breakdown: {
  electricity_kg: number
  transport_kg: number
  waste_kg: number
}) {
  const recs = []
  if (breakdown.electricity_kg > 50) {
    recs.push({ id: '1', title: 'Switch to LED Bulbs', description: 'Replace incandescent bulbs with LEDs. Save up to 75% on lighting energy.', impact: 'high' as const, category: 'electricity' as const, potential_saving_kg: 8, icon: '💡' })
    recs.push({ id: '2', title: 'Reduce AC Usage', description: 'Set AC to 24°C instead of 18°C. Each degree saves ~6% electricity.', impact: 'high' as const, category: 'electricity' as const, potential_saving_kg: 15, icon: '❄️' })
  }
  if (breakdown.transport_kg > 30) {
    recs.push({ id: '3', title: 'Use Public Transport', description: 'Taking the bus instead of driving reduces emissions by up to 74%.', impact: 'high' as const, category: 'transport' as const, potential_saving_kg: 20, icon: '🚌' })
    recs.push({ id: '4', title: 'Carpool or Bike', description: 'Cycling for short trips eliminates transport emissions entirely.', impact: 'medium' as const, category: 'transport' as const, potential_saving_kg: 10, icon: '🚲' })
  }
  if (breakdown.waste_kg > 10) {
    recs.push({ id: '5', title: 'Compost Organic Waste', description: 'Composting food waste reduces methane emissions from landfills significantly.', impact: 'medium' as const, category: 'waste' as const, potential_saving_kg: 4, icon: '♻️' })
    recs.push({ id: '6', title: 'Reduce Single-Use Plastics', description: 'Switch to reusable bags, bottles, and containers.', impact: 'medium' as const, category: 'waste' as const, potential_saving_kg: 2, icon: '🌱' })
  }
  recs.push({ id: '7', title: 'Plant Trees', description: 'Each tree absorbs ~21 kg CO₂ per year. Offset your footprint naturally.', impact: 'low' as const, category: 'lifestyle' as const, potential_saving_kg: 21, icon: '🌳' })
  recs.push({ id: '8', title: 'Eat Plant-Based Meals', description: 'Reducing meat consumption by 50% can cut food-related emissions by 35%.', impact: 'medium' as const, category: 'lifestyle' as const, potential_saving_kg: 12, icon: '🥗' })
  return recs
}

// ============================================================
// Mock data fallbacks
// ============================================================
function getMockWeather(city: string) {
  return {
    city, country: 'IN',
    temp: 28, feels_like: 32, humidity: 65,
    wind_speed: 12, description: 'partly cloudy',
    icon: '03d', weather_code: 802,
    visibility: 10000, pressure: 1013,
  }
}

function getMockAQI(city: string) {
  return {
    city, aqi: 78, pm25: 24, pm10: 45,
    co: 0.4, no2: 12, o3: 38, so2: 5,
    label: 'Moderate', color: '#f59e0b',
  }
}

function getAQILabel(aqi: number): string {
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy for Sensitive'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very Unhealthy'
  return 'Hazardous'
}

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return '#10b981'
  if (aqi <= 100) return '#f59e0b'
  if (aqi <= 150) return '#f97316'
  if (aqi <= 200) return '#ef4444'
  if (aqi <= 300) return '#7c3aed'
  return '#7f1d1d'
}

// ============================================================
// Mock analytics data
// ============================================================
export function getMockTrendData(months = 6) {
  const labels = []
  const electricity = []
  const transport = []
  const waste = []
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }))
    electricity.push(Math.round(80 + Math.random() * 60))
    transport.push(Math.round(40 + Math.random() * 80))
    waste.push(Math.round(10 + Math.random() * 30))
  }
  return { labels, electricity, transport, waste }
}

export function getMockActivities() {
  return [
    { id: '1', activity_type: 'electricity', title: 'Monthly Electricity Bill', description: '320 kWh consumed', carbon_kg: 262.4, activity_date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString() },
    { id: '2', activity_type: 'transport', title: 'Commute by Car', description: '45 km daily commute', carbon_kg: 9.45, activity_date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString() },
    { id: '3', activity_type: 'waste', title: 'Waste Disposal', description: '5 kg mixed waste', carbon_kg: 2.9, activity_date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString() },
    { id: '4', activity_type: 'transport', title: 'Weekend Flight', description: 'Mumbai to Goa — 600 km', carbon_kg: 153.0, activity_date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], created_at: new Date().toISOString() },
    { id: '5', activity_type: 'electricity', title: 'Solar Panel Generation', description: '-120 kWh offset', carbon_kg: -98.4, activity_date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], created_at: new Date().toISOString() },
  ]
}




