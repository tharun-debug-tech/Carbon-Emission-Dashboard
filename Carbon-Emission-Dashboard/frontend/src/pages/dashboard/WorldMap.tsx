// src/pages/dashboard/WorldMap.tsx
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { CSSProperties } from 'react'
import { Activity, AlertTriangle, BarChart3, Download, Eye, Globe, Layers, Leaf, MapPin, Navigation, RadioTower, Route, Search, Share2, ShieldCheck, Sparkles, Thermometer, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import GlobalEarthBackground from '@/components/earth/GlobalEarthBackground'
import { GlassButton, PageTransition } from '@/components/ui/glass'
import { GlobalLocationSelector } from '@/components/ui/GlobalLocationSelector'
import { useAppStore } from '@/store/useAppStore'
import { useWeather } from '@/hooks/useWeather'
import { useAQI } from '@/hooks/useAQI'
import { getAQILabel } from '@/lib/utils'
import { downloadPdfReport, reportDateStamp } from '@/lib/reportDownload'
import { fetchEnergyCountry, fetchEnergySummary } from '@/services/api'
import { LOCATIONS } from '@/lib/locations'
import type { LocationOption } from '@/lib/locations'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const customIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] })
type LayerKey = 'weather' | 'aqi' | 'temperature' | 'rain' | 'wind' | 'clouds' | 'carbon' | 'population'
type MapStyle = 'standard' | 'satellite' | 'dark'
type ViewMode = 'globe' | 'map'
type ScoreMode = 'aqi' | 'sustainability' | 'carbon'
type IntelligenceProfile = { key: string; location: LocationOption; aqi: number; temp: number; humidity: number; wind: number; pressure: number; carbon: number; population: number; sustainability: number; sunrise: string; sunset: string; airQuality: string }

const COUNTRY_META: Record<string, { capital: string; population: number; carbonBase: number; sustainBase: number }> = {
  India: { capital: 'New Delhi', population: 1428000000, carbonBase: 470, sustainBase: 61 },
  'United States': { capital: 'Washington, D.C.', population: 335000000, carbonBase: 720, sustainBase: 63 },
  'United Kingdom': { capital: 'London', population: 68000000, carbonBase: 280, sustainBase: 78 },
  Germany: { capital: 'Berlin', population: 84000000, carbonBase: 330, sustainBase: 82 },
  France: { capital: 'Paris', population: 68000000, carbonBase: 220, sustainBase: 84 },
  Japan: { capital: 'Tokyo', population: 124000000, carbonBase: 360, sustainBase: 79 },
  Singapore: { capital: 'Singapore', population: 5900000, carbonBase: 310, sustainBase: 86 },
  Australia: { capital: 'Canberra', population: 26000000, carbonBase: 510, sustainBase: 74 },
  Canada: { capital: 'Ottawa', population: 40000000, carbonBase: 390, sustainBase: 80 },
  Brazil: { capital: 'Brasilia', population: 216000000, carbonBase: 190, sustainBase: 76 },
  'United Arab Emirates': { capital: 'Abu Dhabi', population: 10000000, carbonBase: 680, sustainBase: 58 },
  'South Africa': { capital: 'Pretoria', population: 60000000, carbonBase: 640, sustainBase: 55 },
}
const LAYER_LABELS: { key: LayerKey; label: string; accent: string }[] = [
  { key: 'weather', label: 'Weather', accent: '#38bdf8' }, { key: 'aqi', label: 'AQI', accent: '#10b981' },
  { key: 'temperature', label: 'Temperature', accent: '#f59e0b' }, { key: 'rain', label: 'Rain', accent: '#60a5fa' },
  { key: 'wind', label: 'Wind', accent: '#22d3ee' }, { key: 'clouds', label: 'Clouds', accent: '#a78bfa' },
  { key: 'carbon', label: 'Carbon', accent: '#ef4444' }, { key: 'population', label: 'Population', accent: '#f472b6' },
]
const keyForLocation = (loc: LocationOption) => `${loc.country}|${loc.state}|${loc.city}`
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const hashText = (value: string) => value.split('').reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 7), 0)
function RecenterLeafletMap({ lat, lon }: { lat: number; lon: number }) { const map = useMap(); useEffect(() => { map.setView([lat, lon], 5, { animate: true }) }, [lat, lon, map]); return null }
function distanceKm(a: LocationOption, b: LocationOption) { const toRad = (n: number) => (n * Math.PI) / 180; const r = 6371; const dLat = toRad(b.lat - a.lat); const dLon = toRad(b.lon - a.lon); const lat1 = toRad(a.lat); const lat2 = toRad(b.lat); const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2; return Math.round(2 * r * Math.asin(Math.sqrt(h))) }
function makeProfile(loc: LocationOption): IntelligenceProfile { const seed = hashText(`${loc.country}-${loc.state}-${loc.city}`); const meta = COUNTRY_META[loc.country] ?? { capital: loc.city, population: 12000000, carbonBase: 420, sustainBase: 65 }; const aqi = clamp(24 + (seed % 148), 16, 210); const temp = Math.round(clamp(27 - Math.abs(loc.lat) * 0.17 + (seed % 14) - 5, -8, 42)); const humidity = clamp(38 + (seed % 54), 22, 94); const wind = Math.round((2.5 + (seed % 95) / 10) * 10) / 10; const pressure = 990 + (seed % 42); const carbon = clamp(meta.carbonBase + (seed % 170) - 72, 90, 820); const population = Math.max(180000, Math.round((meta.population / Math.max(LOCATIONS.filter((l) => l.country === loc.country).length, 1)) * (0.45 + (seed % 80) / 100))); const sustainability = clamp(Math.round(meta.sustainBase + (90 - aqi) * 0.12 + (360 - carbon) * 0.035), 28, 96); const aqiInfo = getAQILabel(aqi); return { key: keyForLocation(loc), location: loc, aqi, temp, humidity, wind, pressure, carbon, population, sustainability, sunrise: `${String(5 + (seed % 3)).padStart(2, '0')}:${String(10 + (seed % 45)).padStart(2, '0')} AM`, sunset: `${String(5 + (seed % 2)).padStart(2, '0')}:${String(20 + (seed % 39)).padStart(2, '0')} PM`, airQuality: aqiInfo.label } }
function formatNumber(value: number) { if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`; if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`; if (value >= 1000) return `${Math.round(value / 1000)}K`; return `${value}` }
function formatDecimal(value: unknown, digits = 1) { const numeric = Number(value); return Number.isFinite(numeric) ? numeric.toFixed(digits) : 'N/A' }
function metricColor(value: number, mode: ScoreMode) { if (mode === 'sustainability') return value >= 80 ? '#10b981' : value >= 65 ? '#f59e0b' : '#ef4444'; if (mode === 'carbon') return value <= 250 ? '#10b981' : value <= 480 ? '#f59e0b' : '#ef4444'; return value <= 50 ? '#10b981' : value <= 100 ? '#f59e0b' : value <= 150 ? '#f97316' : '#ef4444' }
function Bar({ value, max, color }: { value: number; max: number; color: string }) { return <div className='world-intel-bar-track'><span className='world-intel-bar-fill' style={{ width: `${Math.max(4, Math.min(100, (value / max) * 100))}%`, background: color }} /></div> }

export default function WorldMap() {
  const { userCountry, userState, userCity, userLat, userLon, userFlag, setLocationObject } = useAppStore()
  const selectedLocation = useMemo(() => LOCATIONS.find((loc) => loc.country === userCountry && loc.state === userState && loc.city === userCity) || LOCATIONS.find((loc) => loc.city === userCity) || LOCATIONS[0], [userCountry, userState, userCity])
  const [viewMode, setViewMode] = useState<ViewMode>('globe')
  const [mapStyle, setMapStyle] = useState<MapStyle>('standard')
  const [countryFilter, setCountryFilter] = useState('all')
  const [stateFilter, setStateFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('all')
  const [distanceTargetKey, setDistanceTargetKey] = useState(() => keyForLocation(LOCATIONS.find((loc) => loc.country === 'Japan' && loc.city === 'Tokyo') ?? LOCATIONS[1]))
  const [comparisonKeys, setComparisonKeys] = useState<string[]>(() => [keyForLocation(LOCATIONS[0]), keyForLocation(LOCATIONS.find((loc) => loc.country === 'Japan' && loc.city === 'Tokyo') ?? LOCATIONS[1])])
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({ weather: true, aqi: true, temperature: true, rain: false, wind: true, clouds: false, carbon: true, population: false })
  const { data: weather } = useWeather(userCity)
  const { data: aqi } = useAQI(userCity)
  const { data: energySummary } = useQuery({ queryKey: ['energy-summary'], queryFn: fetchEnergySummary, staleTime: 30 * 60 * 1000, retry: 1 })
  const { data: activeEnergy } = useQuery({ queryKey: ['energy-country', userCountry], queryFn: () => fetchEnergyCountry(userCountry), enabled: !!userCountry, staleTime: 30 * 60 * 1000, retry: 1 })
  const activeEnergyLatest = activeEnergy?.latest
  const liveAqiInfo = aqi ? getAQILabel(aqi.aqi) : null
  const profiles = useMemo(() => LOCATIONS.map(makeProfile), [])
  const profileMap = useMemo(() => new Map(profiles.map((profile) => [profile.key, profile])), [profiles])
  const activeProfile = useMemo(() => { const base = makeProfile(selectedLocation); return { ...base, aqi: aqi?.aqi ?? base.aqi, temp: weather?.temp ?? base.temp, humidity: weather?.humidity ?? base.humidity, wind: weather?.wind_speed ?? base.wind, pressure: weather?.pressure ?? base.pressure, carbon: Math.round(Number(activeEnergyLatest?.carbon_intensity_elec ?? base.carbon)), population: Math.round(Number(activeEnergyLatest?.population ?? base.population)), airQuality: liveAqiInfo?.label ?? base.airQuality } }, [selectedLocation, aqi, weather, liveAqiInfo, activeEnergyLatest])
  const countries = useMemo(() => Array.from(new Set(LOCATIONS.map((loc) => loc.country))).sort(), [])
  const states = useMemo(() => Array.from(new Set(LOCATIONS.filter((loc) => countryFilter === 'all' || loc.country === countryFilter).map((loc) => loc.state))).sort(), [countryFilter])
  const cityOptions = useMemo(() => LOCATIONS.filter((loc) => (countryFilter === 'all' || loc.country === countryFilter) && (stateFilter === 'all' || loc.state === stateFilter)), [countryFilter, stateFilter])
  const filteredLocations = useMemo(() => cityOptions.filter((loc) => cityFilter === 'all' || keyForLocation(loc) === cityFilter), [cityOptions, cityFilter])
  const countryProfiles = useMemo(() => countries.map((country) => { const entries = profiles.filter((profile) => profile.location.country === country); const first = entries[0].location; return { country, flag: first.flag, avgAqi: Math.round(entries.reduce((sum, item) => sum + item.aqi, 0) / entries.length), avgTemp: Math.round(entries.reduce((sum, item) => sum + item.temp, 0) / entries.length), avgCarbon: Math.round(entries.reduce((sum, item) => sum + item.carbon, 0) / entries.length), score: Math.round(entries.reduce((sum, item) => sum + item.sustainability, 0) / entries.length), cities: entries.length } }), [countries, profiles])
  const globalStats = useMemo(() => { const highestAqi = [...profiles].sort((a, b) => b.aqi - a.aqi)[0]; const lowestAqi = [...profiles].sort((a, b) => a.aqi - b.aqi)[0]; const sustainableCountry = [...countryProfiles].sort((a, b) => b.score - a.score)[0]; return { countries: countries.length, cities: LOCATIONS.length, avgAqi: Math.round(profiles.reduce((sum, profile) => sum + profile.aqi, 0) / profiles.length), avgTemp: Math.round(profiles.reduce((sum, profile) => sum + profile.temp, 0) / profiles.length), highestAqi, lowestAqi, sustainableCountry, pollutedCity: highestAqi } }, [countries.length, profiles, countryProfiles])
  const comparisonProfiles = useMemo(() => comparisonKeys.map((key) => profileMap.get(key)).filter(Boolean) as IntelligenceProfile[], [comparisonKeys, profileMap])
  const distanceTarget = profileMap.get(distanceTargetKey)?.location ?? LOCATIONS[1]
  const measuredDistance = distanceKm(selectedLocation, distanceTarget)
  const rankings = useMemo(() => ({ cleanest: [...profiles].sort((a, b) => a.aqi - b.aqi).slice(0, 10), highestAqi: [...profiles].sort((a, b) => b.aqi - a.aqi).slice(0, 10), lowestCarbon: [...profiles].sort((a, b) => a.carbon - b.carbon).slice(0, 10), sustainability: [...profiles].sort((a, b) => b.sustainability - a.sustainability).slice(0, 10) }), [profiles])
  const chartBuckets = useMemo(() => { const aqiBuckets = [0, 0, 0, 0]; const tempBuckets = [0, 0, 0, 0]; const carbonBuckets = [0, 0, 0, 0]; profiles.forEach((profile) => { if (profile.aqi <= 50) aqiBuckets[0] += 1; else if (profile.aqi <= 100) aqiBuckets[1] += 1; else if (profile.aqi <= 150) aqiBuckets[2] += 1; else aqiBuckets[3] += 1; if (profile.temp < 10) tempBuckets[0] += 1; else if (profile.temp < 22) tempBuckets[1] += 1; else if (profile.temp < 32) tempBuckets[2] += 1; else tempBuckets[3] += 1; if (profile.carbon <= 240) carbonBuckets[0] += 1; else if (profile.carbon <= 420) carbonBuckets[1] += 1; else if (profile.carbon <= 600) carbonBuckets[2] += 1; else carbonBuckets[3] += 1 }); return { aqiBuckets, tempBuckets, carbonBuckets } }, [profiles])
  const insights = useMemo(() => { const [first, second] = comparisonProfiles; const lines = [`${globalStats.lowestAqi.location.city} currently has the cleanest modeled air quality in the supported network.`, `${globalStats.sustainableCountry.flag} ${globalStats.sustainableCountry.country} leads the sustainability score table at ${globalStats.sustainableCountry.score}/100.`, `${activeProfile.location.city} is showing ${activeProfile.airQuality.toLowerCase()} air quality with ${activeProfile.aqi} AQI and ${activeProfile.temp} degC conditions.`]; if (first && second) { const cleaner = first.aqi <= second.aqi ? first : second; const lowerCarbon = first.carbon <= second.carbon ? first : second; lines.unshift(`${cleaner.location.city} currently has better air quality than ${cleaner.key === first.key ? second.location.city : first.location.city}.`); lines.push(`${lowerCarbon.location.country} has lower carbon intensity in this comparison.`) } lines.push('Recommended low-impact travel shortlist: Singapore City, Munich, Vancouver, Tokyo, and Bengaluru.'); return lines.slice(0, 6) }, [comparisonProfiles, globalStats, activeProfile])
  const handleExportPDF = () => {
    downloadPdfReport('EcoTrack World Intelligence Report', `world-intelligence-${reportDateStamp()}.pdf`, [
      {
        heading: 'Selected Location Intelligence',
        rows: [
          ['Location', `${activeProfile.location.city}, ${activeProfile.location.state}, ${activeProfile.location.country}`],
          ['AQI', `${activeProfile.aqi} (${activeProfile.airQuality})`],
          ['Temperature', `${activeProfile.temp} degC`],
          ['Humidity', `${activeProfile.humidity}%`],
          ['Wind', `${activeProfile.wind} m/s`],
          ['Pressure', `${activeProfile.pressure} hPa`],
          ['Carbon Intensity', `${activeProfile.carbon} gCO2/kWh`],
          ['Sustainability Score', `${activeProfile.sustainability}/100`],
        ],
      },
      {
        heading: 'Global Summary',
        rows: [
          ['Countries Supported', globalStats.countries],
          ['Cities Available', globalStats.cities],
          ['Global Average AQI', globalStats.avgAqi],
          ['Average Temperature', `${globalStats.avgTemp} degC`],
          ['Highest AQI Today', `${globalStats.highestAqi.location.city} - ${globalStats.highestAqi.aqi}`],
          ['Lowest AQI Today', `${globalStats.lowestAqi.location.city} - ${globalStats.lowestAqi.aqi}`],
          ['Most Sustainable Country', `${globalStats.sustainableCountry.country} - ${globalStats.sustainableCountry.score}/100`],
        ],
      },
      {
        heading: 'Comparison Snapshot',
        rows: comparisonProfiles.map((profile) => [profile.location.city, `${profile.location.country} | AQI ${profile.aqi} | ${profile.temp} degC | Carbon ${profile.carbon}`]),
      },
      {
        heading: 'AI Environmental Insights',
        rows: insights.map((insight, index) => [`Insight ${index + 1}`, insight]),
      },
    ])
    toast.success('World Intelligence report downloaded.')
  }
  const handleShareSnapshot = async () => {
    const title = 'EcoTrack World Intelligence Snapshot'
    const url = window.location.href
    const snapshot = [
      title,
      `Location: ${activeProfile.location.city}, ${activeProfile.location.state}, ${activeProfile.location.country}`,
      `AQI: ${activeProfile.aqi} (${activeProfile.airQuality})`,
      `Temperature: ${activeProfile.temp} degC`,
      `Humidity: ${activeProfile.humidity}%`,
      `Wind: ${activeProfile.wind} m/s`,
      `Carbon Intensity: ${activeProfile.carbon} gCO2/kWh`,
      `Sustainability Score: ${activeProfile.sustainability}/100`,
      `Global Average AQI: ${globalStats.avgAqi}`,
      `Cleanest City: ${globalStats.lowestAqi.location.city} (${globalStats.lowestAqi.aqi} AQI)`,
      `Highest AQI: ${globalStats.highestAqi.location.city} (${globalStats.highestAqi.aqi} AQI)`,
      `Comparison: ${comparisonProfiles.map((profile) => `${profile.location.city} ${profile.aqi} AQI`).join(' vs ')}`,
      `Insight: ${insights[0]}`,
      `Link: ${url}`,
    ].join('\n')

    try {
      if ('share' in navigator) {
        await navigator.share({ title, text: snapshot, url })
        toast.success('Snapshot shared.')
        return
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
    }

    try {
      await navigator.clipboard.writeText(snapshot)
      toast.success('Snapshot copied to clipboard.')
      return
    } catch {
      const blob = new Blob([snapshot], { type: 'text/plain;charset=utf-8' })
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `world-intelligence-snapshot-${reportDateStamp()}.txt`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(downloadUrl)
      toast.success('Snapshot file downloaded.')
    }
  }
  const handleSelectLocation = (loc: LocationOption) => { setLocationObject(loc); toast.success(`Focused ${loc.city}, ${loc.country}`) }
  const handleCountryFilterChange = (country: string) => {
    setCountryFilter(country)
    setStateFilter('all')
    setCityFilter('all')
    const next = LOCATIONS.find((loc) => country === 'all' || loc.country === country)
    if (next) handleSelectLocation(next)
  }
  const handleStateFilterChange = (state: string) => {
    setStateFilter(state)
    setCityFilter('all')
    const next = LOCATIONS.find((loc) => (countryFilter === 'all' || loc.country === countryFilter) && (state === 'all' || loc.state === state))
    if (next) handleSelectLocation(next)
  }
  const handleCityFilterChange = (key: string) => {
    setCityFilter(key)
    const next = LOCATIONS.find((loc) => keyForLocation(loc) === key)
    if (next) handleSelectLocation(next)
  }
  const handleCompareChange = (index: number, key: string) => setComparisonKeys((prev) => prev.map((item, i) => (i === index ? key : item)))
  const addComparison = () => { const next = LOCATIONS.find((loc) => !comparisonKeys.includes(keyForLocation(loc))); if (next) setComparisonKeys((prev) => [...prev, keyForLocation(next)]) }
  const removeComparison = (index: number) => setComparisonKeys((prev) => prev.length > 2 ? prev.filter((_, i) => i !== index) : prev)
  const mapTileUrl = mapStyle === 'satellite' ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' : mapStyle === 'dark' ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

  return (
    <PageTransition className='world-intelligence-page dashboard-page-clean'>
      <section className='world-intel-panel world-intel-hero'>
        <div><p className='world-intel-eyebrow'><RadioTower size={14} /> Global Environmental Intelligence Platform</p><h1><Globe size={30} /> World Intelligence</h1><p>Compare environmental conditions, sustainability metrics, weather, AQI, and carbon indicators across countries and cities.</p></div>
        <div className='world-intel-hero-actions'><GlobalLocationSelector /><GlassButton onClick={handleExportPDF}><Download size={15} /> Export Report</GlassButton><GlassButton variant='secondary' onClick={handleShareSnapshot}><Share2 size={15} /> Share Snapshot</GlassButton></div>
      </section>

      <section className='world-intel-panel world-intel-toolbar'>
        <label><Search size={14} /> Country<select value={countryFilter} onChange={(event) => handleCountryFilterChange(event.target.value)}><option value='all'>All countries</option>{countries.map((country) => <option key={country} value={country}>{country}</option>)}</select></label>
        <label><MapPin size={14} /> State<select value={stateFilter} onChange={(event) => handleStateFilterChange(event.target.value)}><option value='all'>All states</option>{states.map((state) => <option key={state} value={state}>{state}</option>)}</select></label>
        <label><Search size={14} /> City<select value={cityFilter} onChange={(event) => handleCityFilterChange(event.target.value)}><option value='all'>All cities</option>{cityOptions.map((loc) => <option key={keyForLocation(loc)} value={keyForLocation(loc)}>{loc.city}, {loc.country}</option>)}</select></label>
        <div className='world-intel-segment'>{(['globe', 'map'] as const).map((mode) => <button key={mode} onClick={() => setViewMode(mode)} className={viewMode === mode ? 'active' : ''}>{mode === 'globe' ? 'Globe' : 'Map'}</button>)}</div>
      </section>

      <section className='world-intel-stat-grid'>
        {[
          { icon: Globe, label: 'Countries Supported', value: energySummary?.countries ?? globalStats.countries, detail: energySummary?.latest_year ? 'Energy dataset ' + energySummary.latest_year : 'Global network' }, { icon: MapPin, label: 'Cities Available', value: globalStats.cities, detail: 'Selectable nodes' },
          { icon: Layers, label: 'Global Average AQI', value: globalStats.avgAqi, detail: 'Modeled average' }, { icon: Thermometer, label: 'Average Temperature', value: `${globalStats.avgTemp} degC`, detail: 'Across cities' },
          { icon: AlertTriangle, label: 'Highest AQI Today', value: globalStats.highestAqi.aqi, detail: globalStats.highestAqi.location.city }, { icon: ShieldCheck, label: 'Lowest AQI Today', value: globalStats.lowestAqi.aqi, detail: globalStats.lowestAqi.location.city },
          { icon: Leaf, label: 'Most Sustainable Country', value: globalStats.sustainableCountry.country, detail: `${globalStats.sustainableCountry.score}/100 score` }, { icon: Zap, label: 'Most Polluted City', value: globalStats.pollutedCity.location.city, detail: `${globalStats.pollutedCity.aqi} AQI` },
        ].map(({ icon: Icon, label, value, detail }) => <div key={label} className='world-intel-stat-card'><span><Icon size={16} /></span><p>{label}</p><strong>{value}</strong><small>{detail}</small></div>)}
      </section>

      <section className='world-intel-main-grid'>
        <div className='world-intel-panel world-intel-stage-panel'>
          <div className='world-intel-section-head'><div><h2>{viewMode === 'globe' ? 'Interactive Globe' : 'Interactive Map'}</h2><p>{viewMode === 'globe' ? 'Animated global markers and heat indicators by region.' : 'Search, zoom, click markers, measure distance, and switch layers.'}</p></div><div className='world-intel-map-style'>{(['standard', 'satellite', 'dark'] as const).map((style) => <button key={style} onClick={() => setMapStyle(style)} className={mapStyle === style ? 'active' : ''}>{style}</button>)}</div></div>
          <div className='world-intel-stage'>
            {viewMode === 'globe' ? (
              <div className='world-intel-globe-wrap'><GlobalEarthBackground mode='world' className='world-intel-earth' /><div className='world-intel-globe-overlay' />{countryProfiles.map((country, index) => { const loc = LOCATIONS.find((item) => item.country === country.country) ?? LOCATIONS[0]; const x = ((loc.lon + 180) / 360) * 100; const y = ((90 - loc.lat) / 180) * 100; return <button key={country.country} className='world-intel-globe-marker' style={{ left: `${clamp(x, 8, 92)}%`, top: `${clamp(y, 12, 84)}%`, '--delay': `${index * 90}ms`, '--marker': metricColor(country.avgAqi, 'aqi') } as CSSProperties} onClick={() => handleSelectLocation(loc)} title={`${country.country}: ${country.avgAqi} AQI`}><span /><strong>{country.flag}</strong></button> })}</div>
            ) : (
              <MapContainer center={[userLat, userLon]} zoom={3} style={{ height: '100%', width: '100%' }}><RecenterLeafletMap lat={userLat} lon={userLon} /><TileLayer attribution='&copy; OpenStreetMap contributors' url={mapTileUrl} />{filteredLocations.map((loc) => { const profile = profileMap.get(keyForLocation(loc)) ?? makeProfile(loc); return <Marker key={keyForLocation(loc)} position={[loc.lat, loc.lon]} icon={customIcon} eventHandlers={{ click: () => handleSelectLocation(loc) }}><Popup><div className='world-intel-popup'><strong>{loc.flag} {loc.city}</strong><span>{loc.state}, {loc.country}</span><span>AQI: {profile.aqi} ({profile.airQuality})</span><span>Temp: {profile.temp} degC</span><span>Carbon: {profile.carbon} gCO2/kWh</span></div></Popup></Marker> })}</MapContainer>
            )}
            <div className='world-intel-spotlight'><span>Active Location</span><strong>{userFlag} {activeProfile.location.city}</strong><small>{activeProfile.location.state}, {activeProfile.location.country}</small><div><b style={{ color: metricColor(activeProfile.aqi, 'aqi') }}>{activeProfile.aqi} AQI</b><b>{activeProfile.temp} degC</b><b>{activeProfile.carbon} Carbon</b></div></div>
          </div>
        </div>

        <aside className='world-intel-panel world-intel-country-card'>
          <div className='world-intel-section-head compact'><div><h2>Country Intelligence</h2><p>Live selected-node telemetry and regional context.</p></div><span className='world-intel-flag'>{activeProfile.location.flag}</span></div>
          <div className='world-intel-country-title'><strong>{activeProfile.location.country}</strong><span>{activeProfile.location.city}, {activeProfile.location.state}</span></div>
          <div className='world-intel-detail-grid'>{[
            ['Capital', COUNTRY_META[activeProfile.location.country]?.capital ?? activeProfile.location.city], ['Population', formatNumber(COUNTRY_META[activeProfile.location.country]?.population ?? activeProfile.population)], ['Timezone', activeProfile.location.timezone], ['Weather', weather?.description ?? 'Regional climate'], ['AQI', `${activeProfile.aqi} (${activeProfile.airQuality})`], ['Temperature', `${activeProfile.temp} degC`], ['Humidity', `${activeProfile.humidity}%`], ['Wind', `${activeProfile.wind} m/s`], ['Pressure', `${activeProfile.pressure} hPa`], ['Sunrise', activeProfile.sunrise], ['Sunset', activeProfile.sunset], ['Carbon Intensity', `${activeProfile.carbon} gCO2/kWh`], ['Renewable Energy', `${formatDecimal(activeEnergyLatest?.renewables_share_elec)}%`], ['Energy Demand', `${formatDecimal(activeEnergyLatest?.electricity_demand, 2)} TWh`], ['Air Quality', activeProfile.airQuality], ['Coordinates', `${activeProfile.location.lat.toFixed(3)}, ${activeProfile.location.lon.toFixed(3)}`],
          ].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
        </aside>
      </section>

      <section className='world-intel-grid-2'>
        <div className='world-intel-panel'>
          <div className='world-intel-section-head'><div><h2>Comparison Panel</h2><p>Compare two or more cities, countries, and sustainability profiles.</p></div><button className='world-intel-mini-button' onClick={addComparison}>Compare Another Country</button></div>
          <div className='world-intel-compare-selectors'>{comparisonKeys.map((key, index) => <label key={`${key}-${index}`}>Location {index + 1}<select value={key} onChange={(event) => handleCompareChange(index, event.target.value)}>{LOCATIONS.map((loc) => <option key={keyForLocation(loc)} value={keyForLocation(loc)}>{loc.city}, {loc.country}</option>)}</select>{comparisonKeys.length > 2 && <button onClick={() => removeComparison(index)}>Remove</button>}</label>)}</div>
          <div className='world-intel-compare-table'>{['Temperature', 'AQI', 'Humidity', 'Wind', 'Carbon', 'Population', 'Sustainability Score'].map((row) => <div key={row} className='world-intel-compare-row'><span>{row}</span>{comparisonProfiles.map((profile) => { const value = row === 'Temperature' ? `${profile.temp} degC` : row === 'AQI' ? profile.aqi : row === 'Humidity' ? `${profile.humidity}%` : row === 'Wind' ? `${profile.wind} m/s` : row === 'Carbon' ? `${profile.carbon}` : row === 'Population' ? formatNumber(profile.population) : `${profile.sustainability}/100`; return <strong key={`${profile.key}-${row}`}>{value}</strong> })}</div>)}</div>
        </div>

        <div className='world-intel-panel'>
          <div className='world-intel-section-head'><div><h2>Map Layers</h2><p>Toggle weather, AQI, climate, population, and carbon context.</p></div><Layers size={20} className='text-emerald-400' /></div>
          <div className='world-intel-layer-grid'>{LAYER_LABELS.map((layer) => <button key={layer.key} onClick={() => setLayers((prev) => ({ ...prev, [layer.key]: !prev[layer.key] }))} className={layers[layer.key] ? 'active' : ''} style={{ '--layer': layer.accent } as CSSProperties}><span />{layer.label}</button>)}</div>
          <div className='world-intel-distance-tool'><Route size={16} /><label>Measure distance from {activeProfile.location.city}<select value={distanceTargetKey} onChange={(event) => setDistanceTargetKey(event.target.value)}>{LOCATIONS.map((loc) => <option key={keyForLocation(loc)} value={keyForLocation(loc)}>{loc.city}, {loc.country}</option>)}</select></label><strong>{measuredDistance.toLocaleString()} km</strong></div>
        </div>
      </section>

      <section className='world-intel-panel'>
        <div className='world-intel-section-head'><div><h2>Environmental Rankings</h2><p>Top 10 lists across clean air, AQI risk, carbon intensity, and sustainability.</p></div><BarChart3 size={20} className='text-cyan-400' /></div>
        <div className='world-intel-rank-grid'>{[
          ['Top 10 Cleanest Cities', rankings.cleanest, 'aqi' as ScoreMode, 'AQI'], ['Top 10 Highest AQI', rankings.highestAqi, 'aqi' as ScoreMode, 'AQI'], ['Top 10 Lowest Carbon', rankings.lowestCarbon, 'carbon' as ScoreMode, 'gCO2/kWh'], ['Top Sustainability Scores', rankings.sustainability, 'sustainability' as ScoreMode, 'Score'],
        ].map(([title, items, mode, unit]) => <div key={title as string} className='world-intel-rank-card'><h3>{title as string}</h3>{(items as IntelligenceProfile[]).map((profile, index) => { const value = mode === 'carbon' ? profile.carbon : mode === 'sustainability' ? profile.sustainability : profile.aqi; return <button key={`${title}-${profile.key}`} onClick={() => handleSelectLocation(profile.location)}><span>{index + 1}</span><b>{profile.location.flag} {profile.location.city}</b><strong style={{ color: metricColor(value, mode as ScoreMode) }}>{value} {unit as string}</strong></button> })}</div>)}</div>
      </section>

      <section className='world-intel-grid-2'>
        <div className='world-intel-panel'><div className='world-intel-section-head'><div><h2>Charts</h2><p>AQI, temperature, carbon, and country comparison distributions.</p></div></div><div className='world-intel-chart-stack'>{[
          ['AQI Distribution', ['Good', 'Moderate', 'Elevated', 'High'], chartBuckets.aqiBuckets, ['#10b981', '#f59e0b', '#f97316', '#ef4444']], ['Temperature Distribution', ['Cold', 'Mild', 'Warm', 'Hot'], chartBuckets.tempBuckets, ['#60a5fa', '#10b981', '#f59e0b', '#ef4444']], ['Carbon Emissions', ['Low', 'Medium', 'High', 'Severe'], chartBuckets.carbonBuckets, ['#10b981', '#f59e0b', '#f97316', '#ef4444']],
        ].map(([title, labels, values, colors]) => <div key={title as string} className='world-intel-chart-card'><h3>{title as string}</h3>{(labels as string[]).map((label, index) => <div key={label}><span>{label}</span><Bar value={(values as number[])[index]} max={profiles.length} color={(colors as string[])[index]} /><strong>{(values as number[])[index]}</strong></div>)}</div>)}</div></div>
        <div className='world-intel-panel'><div className='world-intel-section-head'><div><h2>Country Comparison</h2><p>Average sustainability scores for supported countries.</p></div></div><div className='world-intel-country-bars'>{[...countryProfiles].sort((a, b) => b.score - a.score).slice(0, 10).map((country) => <button key={country.country} onClick={() => handleSelectLocation(LOCATIONS.find((loc) => loc.country === country.country) ?? LOCATIONS[0])}><span>{country.flag} {country.country}</span><Bar value={country.score} max={100} color={metricColor(country.score, 'sustainability')} /><strong>{country.score}</strong></button>)}</div></div>
      </section>

      <section className='world-intel-grid-2'>
        <div className='world-intel-panel'><div className='world-intel-section-head'><div><h2>AI Environmental Insights</h2><p>Generated observations from selected and comparison regions.</p></div><Sparkles className='text-purple-400' /></div><div className='world-intel-insights'>{insights.map((insight) => <div key={insight}><Sparkles size={14} /><span>{insight}</span></div>)}</div></div>
        <div className='world-intel-panel'><div className='world-intel-section-head'><div><h2>Quick Actions</h2><p>Export, share, open live telemetry, and continue comparisons.</p></div></div><div className='world-intel-actions-grid'><button onClick={handleExportPDF}><Download size={16} /> Export Report</button><button onClick={handleShareSnapshot}><Share2 size={16} /> Share Snapshot</button><button onClick={() => window.location.assign('/dashboard/environment')}><Activity size={16} /> Open Live Environment</button><button onClick={addComparison}><Navigation size={16} /> Compare Another Country</button></div></div>
      </section>

      <section className='world-intel-panel'>
        <div className='world-intel-section-head'><div><h2>Global Location Matrix</h2><p>{filteredLocations.length} matching locations. Click any row to focus the platform.</p></div><Eye className='text-emerald-400' /></div>
        <div className='world-intel-table-wrap'><table className='world-intel-table'><thead><tr><th>City</th><th>State</th><th>Country</th><th>AQI</th><th>Temp</th><th>Carbon</th><th>Score</th><th>Action</th></tr></thead><tbody>{filteredLocations.map((loc) => { const profile = profileMap.get(keyForLocation(loc)) ?? makeProfile(loc); const selected = loc.city === userCity && loc.state === userState && loc.country === userCountry; return <tr key={keyForLocation(loc)} className={selected ? 'active' : ''} onClick={() => handleSelectLocation(loc)}><td><span>{loc.flag}</span> {loc.city}</td><td>{loc.state}</td><td>{loc.country}</td><td style={{ color: metricColor(profile.aqi, 'aqi') }}>{profile.aqi}</td><td>{profile.temp} degC</td><td style={{ color: metricColor(profile.carbon, 'carbon') }}>{profile.carbon}</td><td style={{ color: metricColor(profile.sustainability, 'sustainability') }}>{profile.sustainability}</td><td><button>{selected ? 'Active' : 'Select'}</button></td></tr> })}</tbody></table></div>
      </section>
    </PageTransition>
  )
}







