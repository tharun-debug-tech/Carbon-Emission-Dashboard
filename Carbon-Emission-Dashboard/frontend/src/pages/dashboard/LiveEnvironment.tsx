// src/pages/dashboard/LiveEnvironment.tsx
import { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWeather } from '@/hooks/useWeather'
import { useAQI } from '@/hooks/useAQI'
import { getAQILabel } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { GlobalLocationSelector } from '@/components/ui/GlobalLocationSelector'
import {
  Cloud, Wind, Droplets, Gauge, MapPin, Eye, Compass,
  Thermometer, Sun, Sunrise, ShieldAlert,
  Activity, CloudRain, Zap, Clock, Globe, AlertTriangle,
  Leaf, TrendingUp, CheckCircle2
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const customIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

// ── Recenter Map on location change ─────────────────────────
function RecenterMap({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lon], 11, { animate: true })
  }, [lat, lon, map])
  return null
}

// ── Animation helper ─────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: 'easeOut' as const },
})

// ── Env Metric Card ──────────────────────────────────────────
function EnvCard({
  icon: Icon, label, value, detail, color, delay = 0
}: {
  icon: LucideIcon; label: string; value: string; detail: string; color: string; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.38, ease: 'easeOut' as const }}
      whileHover={{ y: -3 }}
      className="environment-metric-card group"
      style={{ background: 'rgba(15,23,42,0.7)' }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 0%, ${color}18, transparent 70%)` }} />
      <Icon size={18} className="mb-1.5 relative z-10" style={{ color }} />
      <span className="text-[10px] text-gray-500 font-medium block relative z-10">{label}</span>
      <span className="text-sm font-bold font-mono text-white capitalize my-0.5 relative z-10 leading-tight">{value}</span>
      <span className="text-[10px] text-gray-600 relative z-10 leading-tight">{detail}</span>
    </motion.div>
  )
}

// ── AQI Pollutant Pill ───────────────────────────────────────
function PollutantCard({
  label, value, desc, threshold, delay = 0
}: {
  label: string; value: number; desc: string; threshold: number; delay?: number
}) {
  const pct = Math.min(100, Math.round((value / threshold) * 100))
  const safe = pct < 60
  const warn = pct >= 60 && pct < 85
  const barColor = safe ? '#10b981' : warn ? '#f59e0b' : '#ef4444'
  const textColor = safe ? '#10b981' : warn ? '#f59e0b' : '#ef4444'
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' as const }}
      className="environment-pollutant-card"
      style={{ background: `${barColor}08` }}
    >
      <span className="text-[10px] text-gray-400 font-bold uppercase block">{label}</span>
      <span className="text-base font-black font-mono block my-0.5" style={{ color: textColor }}>{value}</span>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden mt-1 mb-1">
        <motion.div className="h-full rounded-full"
          style={{ background: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: delay + 0.2, duration: 0.6, ease: 'easeOut' }} />
      </div>
      <span className="text-[9px] text-gray-600">{desc}</span>
    </motion.div>
  )
}

// ── Forecast Day Card ────────────────────────────────────────
function ForecastCard({ day, icon, high, low, rain, wind, delay = 0 }: {
  day: string; icon: string; high: number; low: number; rain: number; wind: number; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' as const }}
      whileHover={{ y: -3 }}
      className="environment-forecast-card"
      style={{ background: 'rgba(15,23,42,0.7)' }}
    >
      <div className="text-[10px] text-gray-500 font-semibold mb-2">{day}</div>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm font-bold text-white font-mono">{high}°</div>
      <div className="text-[11px] text-gray-600 font-mono mb-2">{low}°</div>
      <div className="text-[10px] text-blue-400 flex items-center justify-center gap-0.5">
        <Droplets size={8} />{rain}%
      </div>
      <div className="text-[10px] text-teal-400 flex items-center justify-center gap-0.5 mt-0.5">
        <Wind size={8} />{wind}m/s
      </div>
    </motion.div>
  )
}

// ── Alert Banner ─────────────────────────────────────────────
function AlertBanner({ icon: Icon, title, description, color }: {
  icon: LucideIcon; title: string; description: string; color: string
}) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl border"
      style={{ background: `${color}10`, borderColor: `${color}25` }}>
      <Icon size={14} className="flex-shrink-0 mt-0.5" style={{ color }} />
      <div>
        <div className="text-xs font-bold" style={{ color }}>{title}</div>
        <div className="text-[11px] text-gray-400 mt-0.5">{description}</div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────
export default function LiveEnvironment() {
  const {
    userCountry, userState, userCity, userLat, userLon, userTimezone, userFlag,
  } = useAppStore()

  // Live local clock
  const [localTime, setLocalTime] = useState('')
  const [localDate, setLocalDate] = useState('')
  useEffect(() => {
    const update = () => {
      try {
        setLocalTime(new Date().toLocaleTimeString('en-US', {
          timeZone: userTimezone || 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit',
        }))
        setLocalDate(new Date().toLocaleDateString('en-US', {
          timeZone: userTimezone || 'UTC', weekday: 'long', month: 'long', day: 'numeric',
        }))
      } catch {
        setLocalTime(new Date().toLocaleTimeString())
        setLocalDate(new Date().toLocaleDateString())
      }
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [userTimezone])

  const { data: weather, isLoading: wLoading } = useWeather(userCity)
  const { data: aqi, isLoading: aqiLoading } = useAQI(userCity)
  const aqiInfo = useMemo(() => (aqi ? getAQILabel(aqi.aqi) : null), [aqi])

  // ── Generated 7-day forecast (deterministic from city name seed) ─
  const forecast = useMemo(() => {
    const seed = userCity.charCodeAt(0) + userCity.length
    const icons = ['☀️', '⛅', '🌤️', '☁️', '🌧️', '🌦️', '⛈️']
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const base = weather?.temp ?? 28
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() + i)
      const s = (seed + i * 7) % 7
      return {
        day: i === 0 ? 'Today' : days[d.getDay()],
        icon: icons[s],
        high: Math.round(base + ((seed * (i + 1)) % 6) - 2),
        low: Math.round(base - 4 - ((seed * i) % 4)),
        rain: ((seed * (i + 3)) % 80),
        wind: Math.round(8 + ((seed + i * 3) % 14)),
      }
    })
  }, [userCity, weather?.temp])

  // ── Environmental alerts derived from live data ──────────────
  const alerts = useMemo(() => {
    const list: { icon: LucideIcon; title: string; description: string; color: string }[] = []
    if (aqi && aqi.aqi > 150) {
      list.push({ icon: AlertTriangle, title: 'High AQI Alert', description: `Air quality is ${aqiInfo?.label} (${aqi.aqi}). Avoid prolonged outdoor exposure.`, color: '#ef4444' })
    }
    if (aqi && aqi.aqi > 100) {
      list.push({ icon: ShieldAlert, title: 'Sensitive Groups Advisory', description: 'Children, elderly, and people with respiratory conditions should limit outdoor activity.', color: '#f97316' })
    }
    if (weather && weather.temp > 38) {
      list.push({ icon: Thermometer, title: 'Extreme Heat Warning', description: `Temperature at ${weather.temp}°C. Stay hydrated and avoid direct sun exposure.`, color: '#f59e0b' })
    }
    if (weather && weather.wind_speed > 15) {
      list.push({ icon: Wind, title: 'Strong Wind Advisory', description: `Wind speed at ${weather.wind_speed} m/s. Secure loose outdoor objects.`, color: '#3b82f6' })
    }
    if (weather && weather.visibility < 3000) {
      list.push({ icon: Eye, title: 'Poor Visibility', description: `Visibility reduced to ${(weather.visibility / 1000).toFixed(1)} km. Drive carefully.`, color: '#8b5cf6' })
    }
    if (list.length === 0) {
      list.push({ icon: CheckCircle2, title: 'All Clear', description: `No active environmental alerts for ${userCity}. Conditions are normal.`, color: '#10b981' })
    }
    return list
  }, [aqi, weather, userCity, aqiInfo])

  // ── Environmental recommendations ────────────────────────────
  const envRecs = useMemo(() => {
    const recs: string[] = []
    if (aqi) {
      if (aqi.aqi <= 50) recs.push(`🌿 Excellent air quality! Great day for outdoor exercise and activities.`)
      else if (aqi.aqi <= 100) recs.push(`😷 Moderate air quality. Sensitive individuals should consider wearing a mask outside.`)
      else recs.push(`🏠 Poor air quality. Stay indoors when possible and use air purifiers.`)
    }
    if (weather) {
      if (weather.humidity > 75) recs.push(`💧 High humidity (${weather.humidity}%). Stay hydrated and take breaks in cool areas.`)
      if (weather.temp < 15) recs.push(`🧥 Cool temperatures. Dress in layers and carry a jacket for morning commutes.`)
      if (weather.temp > 35) recs.push(`🌡️ Heat advisory: Use public transport today to reduce both heat exposure and emissions.`)
      if (weather.wind_speed < 5) recs.push(`🌱 Calm winds — ideal weather for planting trees and outdoor gardening.`)
    }
    recs.push(`🚌 Consider public transport today — reduces your carbon footprint by up to 74%.`)
    return recs.slice(0, 4)
  }, [aqi, weather])

  const [mapTab, setMapTab] = useState<'standard' | 'satellite'>('standard')

  return (
    <div className="environment-page dashboard-page-clean">
      {/* ── Page Header ── */}
      <motion.div {...fadeUp(0)}
        className="environment-panel environment-hero"
        style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(15,23,42,0.92))' }}
      >
        <div className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(circle at 100% 50%, rgba(6,182,212,0.15), transparent 70%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">
            <Activity size={13} /> Environmental Intelligence Center
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-white flex flex-wrap items-center gap-3">
            <span className="text-3xl">{userFlag}</span>
            <span>{userCity} Monitoring Node</span>
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-gray-400">
            <span className="flex items-center gap-1"><MapPin size={11} className="text-emerald-400" /> {userState}, {userCountry}</span>
            <span>·</span>
            <span className="font-mono text-emerald-400 text-xs">{userLat.toFixed(4)}° N · {userLon.toFixed(4)}° E</span>
            <span>·</span>
            <span className="font-mono text-cyan-300 text-xs flex items-center gap-1">
              <Clock size={10} /> {localTime || '--:--:--'}
            </span>
          </div>
          <div className="text-xs text-gray-600 mt-1 font-mono">{localDate}</div>
        </div>
        <div className="relative z-10 flex-shrink-0">
          <GlobalLocationSelector />
        </div>
      </motion.div>

      {/* ── Location Summary Cards ── */}
      <motion.div {...fadeUp(0.05)} className="environment-location-grid">
        {[
          { icon: Globe, label: 'Country', value: userCountry, color: '#3b82f6' },
          { icon: MapPin, label: 'State', value: userState, color: '#10b981' },
          { icon: MapPin, label: 'City', value: userCity, color: '#10b981' },
          { icon: Compass, label: 'Latitude', value: `${userLat.toFixed(3)}°N`, color: '#8b5cf6' },
          { icon: Compass, label: 'Longitude', value: `${userLon.toFixed(3)}°E`, color: '#8b5cf6' },
          { icon: Clock, label: 'Timezone', value: userTimezone.replace('_', ' ').split('/').pop() ?? userTimezone, color: '#f59e0b' },
        ].map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04, ease: 'easeOut' as const }}
              whileHover={{ y: -2 }}
              className="environment-location-card"
              style={{ background: `${item.color}08` }}
            >
              <Icon size={13} className="mx-auto mb-1.5" style={{ color: item.color }} />
              <div className="text-[10px] text-gray-500 font-medium">{item.label}</div>
              <div className="text-xs font-bold text-white mt-0.5 truncate">{item.value}</div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* ── AQI & Weather Two-column ── */}
      <div className="environment-two-grid">
        {/* Air Quality Panel */}
        <motion.div {...fadeUp(0.1)}
          className="environment-panel environment-data-panel"
          style={{ background: 'rgba(15,23,42,0.75)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-emerald-400" size={18} />
              <h2 className="font-bold text-white text-base">Air Quality Index</h2>
            </div>
            <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-1 rounded-lg border border-white/8">AQICN / WAQI</span>
          </div>

          {aqiLoading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : aqi && aqiInfo ? (
            <div className="space-y-5">
              {/* AQI Score Ring */}
              <div className="environment-score-card"
                style={{ background: aqiInfo.bgColor, border: `1px solid ${aqiInfo.color}35`, boxShadow: `0 8px 30px ${aqiInfo.color}15` }}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-2">Air Quality Index</span>
                <span className="text-7xl font-black font-display" style={{ color: aqiInfo.color }}>{aqi.aqi}</span>
                <span className="block mt-2 font-bold text-sm" style={{ color: aqiInfo.color }}>{aqiInfo.label}</span>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px]">
                  <span className="px-2.5 py-1 rounded-full border font-mono flex items-center gap-1"
                    style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.1)', color: '#9ca3af' }}>
                    <Zap size={9} className="text-emerald-400" /> Carbon Intensity: 0.82 kg/kWh
                  </span>
                </div>
              </div>
              {/* Pollutant Grid */}
              <div className="environment-pollutant-grid">
                <PollutantCard label="PM2.5" value={aqi.pm25} desc="Fine Particles" threshold={75} delay={0.15} />
                <PollutantCard label="PM10" value={aqi.pm10} desc="Respirable Dust" threshold={150} delay={0.18} />
                <PollutantCard label="CO" value={aqi.co} desc="Carbon Monoxide" threshold={2} delay={0.21} />
                <PollutantCard label="NO₂" value={aqi.no2} desc="Nitrogen Dioxide" threshold={100} delay={0.24} />
                <PollutantCard label="SO₂" value={aqi.so2} desc="Sulfur Dioxide" threshold={75} delay={0.27} />
                <PollutantCard label="O₃" value={aqi.o3} desc="Ground Ozone" threshold={100} delay={0.30} />
              </div>
              {/* Health Rec */}
              <div className="p-3 rounded-xl text-xs flex items-start gap-2"
                style={{ background: `${aqiInfo.color}10`, border: `1px solid ${aqiInfo.color}25` }}>
                <ShieldAlert size={13} className="flex-shrink-0 mt-0.5" style={{ color: aqiInfo.color }} />
                <span style={{ color: aqiInfo.color }}>
                  {aqi.aqi <= 50 ? 'Air quality is satisfactory. No health risk for the general population.'
                    : aqi.aqi <= 100 ? 'Acceptable air quality. Unusually sensitive individuals may be affected.'
                    : aqi.aqi <= 150 ? 'Sensitive groups may experience health effects. General public not likely affected.'
                    : 'Everyone may begin to experience health effects. Sensitive groups more severely affected.'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">Unable to load air quality data for {userCity}.</p>
          )}
        </motion.div>

        {/* Weather Dashboard Panel */}
        <motion.div {...fadeUp(0.12)}
          className="environment-panel environment-data-panel"
          style={{ background: 'rgba(15,23,42,0.75)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="text-cyan-400" size={18} />
              <h2 className="font-bold text-white text-base">Weather Dashboard</h2>
            </div>
            <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-1 rounded-lg border border-white/8">OpenWeather</span>
          </div>

          {wLoading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          ) : weather ? (
            <div className="space-y-4">
              {/* Big Temp Hero */}
              <div className="environment-score-card"
                style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.04))', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Thermometer size={22} className="mx-auto text-amber-400 mb-1" />
                <div className="text-6xl font-black font-display text-amber-400">{weather.temp}°C</div>
                <div className="text-sm text-gray-400 mt-1 capitalize">{weather.description}</div>
                <div className="text-xs text-gray-600 mt-0.5">Feels like {weather.feels_like}°C</div>
                <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1"><Droplets size={10} className="text-blue-400" />{weather.humidity}% humidity</span>
                  <span className="flex items-center gap-1"><Wind size={10} className="text-teal-400" />{weather.wind_speed} m/s</span>
                </div>
              </div>
              {/* Params Grid */}
              <div className="environment-metric-grid">
                <EnvCard icon={Gauge} label="Pressure" value={`${weather.pressure} hPa`} detail="Barometric" color="#8b5cf6" delay={0.18} />
                <EnvCard icon={Eye} label="Visibility" value={`${(weather.visibility / 1000).toFixed(1)} km`} detail="Optical clarity" color="#10b981" delay={0.2} />
                <EnvCard icon={Compass} label="Condition" value={weather.description} detail="Sky state" color="#f97316" delay={0.22} />
                <EnvCard icon={CloudRain} label="Cloudiness" value="35%" detail="Sky coverage" color="#60a5fa" delay={0.24} />
                <EnvCard icon={Sun} label="UV Index" value="3 (Mod.)" detail="Solar irradiance" color="#fbbf24" delay={0.26} />
                <EnvCard icon={Sunrise} label="Sunrise" value="06:12 AM" detail="Sunset 06:45 PM" color="#f97316" delay={0.28} />
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">Unable to load weather data for {userCity}.</p>
          )}
        </motion.div>
      </div>

      {/* ── 7-Day Forecast ── */}
      <motion.div {...fadeUp(0.2)}
        className="environment-panel"
        style={{ background: 'rgba(15,23,42,0.75)' }}>
        <div className="environment-section-header">
          <div>
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-400" /> 7-Day Weather Forecast
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{userCity}, {userState} · Projected outlook</p>
          </div>
          <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-lg border border-white/8 font-mono">Simulated</span>
        </div>
        <div className="environment-forecast-grid">
          {forecast.map((day, i) => (
            <ForecastCard key={day.day} {...day} delay={0.22 + i * 0.04} />
          ))}
        </div>
      </motion.div>

      {/* ── Interactive Map ── */}
      <motion.div {...fadeUp(0.28)}
        className="environment-panel"
        style={{ background: 'rgba(15,23,42,0.75)' }}>
        <div className="environment-section-header environment-map-header">
          <div>
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <MapPin className="text-emerald-400" size={16} /> Regional Telemetry Map
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Auto-centered on {userCity}, {userState}, {userCountry}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {(['standard', 'satellite'] as const).map((t) => (
                <button key={t} onClick={() => setMapTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                    mapTab === t
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-500 hover:text-white bg-white/5'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/20">
              <span>{userLat.toFixed(4)}°</span>
              <span className="text-emerald-700">·</span>
              <span>{userLon.toFixed(4)}°</span>
            </div>
          </div>
        </div>
        <div className="environment-map-frame">
          <MapContainer center={[userLat, userLon]} zoom={11} style={{ height: '100%', width: '100%' }}>
            <RecenterMap lat={userLat} lon={userLon} />
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url={
                mapTab === 'satellite'
                  ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              }
            />
            <Marker position={[userLat, userLon]} icon={customIcon}>
              <Popup>
                <div className="text-slate-900 p-1.5 text-xs space-y-1">
                  <strong className="text-sm">{userFlag} {userCity}, {userState}</strong><br />
                  <span>Country: {userCountry}</span><br />
                  <span>AQI: <strong>{aqi?.aqi ?? 'N/A'}</strong> ({aqiInfo?.label ?? '--'})</span><br />
                  <span>Temp: <strong>{weather?.temp ?? 'N/A'}°C</strong></span><br />
                  <span>Humidity: <strong>{weather?.humidity ?? '--'}%</strong></span><br />
                  <span className="text-gray-500 font-mono text-[10px]">{userTimezone}</span>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </motion.div>

      {/* ── Alerts & Recommendations ── */}
      <div className="environment-two-grid">
        {/* Environmental Alerts */}
        <motion.div {...fadeUp(0.35)}
          className="environment-panel"
          style={{ background: 'rgba(15,23,42,0.75)' }}>
          <h2 className="font-bold text-white text-base flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-400" /> Environmental Alerts
          </h2>
          <AnimatePresence>
            <div className="environment-list-stack">
              {alerts.map((alert, i) => (
                <motion.div key={alert.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.37 + i * 0.07, ease: 'easeOut' as const }}>
                  <AlertBanner {...alert} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </motion.div>

        {/* Environmental Recommendations */}
        <motion.div {...fadeUp(0.4)}
          className="environment-panel"
          style={{ background: 'rgba(15,23,42,0.75)' }}>
          <h2 className="font-bold text-white text-base flex items-center gap-2 mb-4">
            <Leaf size={16} className="text-emerald-400" /> Environmental Recommendations
          </h2>
          <div className="environment-list-stack">
            {envRecs.map((rec, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42 + i * 0.07, ease: 'easeOut' as const }}
                className="flex items-start gap-2.5 p-3.5 rounded-xl border border-white/8"
                style={{ background: 'rgba(16,185,129,0.06)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <p className="text-xs text-gray-300 leading-relaxed">{rec}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
