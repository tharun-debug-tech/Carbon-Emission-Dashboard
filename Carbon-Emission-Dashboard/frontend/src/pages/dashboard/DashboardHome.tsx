// src/pages/dashboard/DashboardHome.tsx
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { getMockActivities, getMockTrendData } from '@/services/api'
import {
  Zap, Car, Trash2, Leaf, TrendingDown, TrendingUp, Award,
  ArrowRight, AlertCircle, Lightbulb, Bus, Recycle,
  Droplets, Wind, Gauge, Thermometer, Sun, Globe,
  Flame, TreePine, Users, ChevronRight
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { getSustainabilityGrade, formatCarbonKg, getAQILabel, getWeatherIcon } from '@/lib/utils'
import { useWeather } from '@/hooks/useWeather'
import { useAQI } from '@/hooks/useAQI'
import GlobalEarthBackground from '@/components/earth/GlobalEarthBackground'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

// ── Helpers ────────────────────────────────────────────────────
function getDayGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  if (hour >= 17 && hour < 21) return 'Good evening'
  return 'Good night'
}

function getTimeOfDayEmoji(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return '🌅'
  if (hour >= 12 && hour < 17) return '☀️'
  if (hour >= 17 && hour < 21) return '🌆'
  return '🌙'
}

// ── Mini Sparkline ────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 80; const h = 32
  const min = Math.min(...data); const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')
  const area = `M0,${h} L${data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' L')} L${w},${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="sparkline-svg" style={{ opacity: 0.9 }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace('#', '')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point dot */}
      {data.length > 0 && (
        <circle cx={(data.length - 1) / (data.length - 1) * w} cy={h - ((data[data.length - 1] - min) / range) * h} r="2.5" fill={color} />
      )}
    </svg>
  )
}

// ── KPI Card ─────────────────────────────────────────────────
function KPICard({
  icon: Icon, label, value, unit, trend, color, gradient, sparkData, delay = 0
}: {
  icon: LucideIcon; label: string; value: string | number
  unit: string; trend?: number; color: string; gradient: string
  sparkData?: number[]; delay?: number
}) {
  return (
    <motion.div
      className="kpi-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      style={{ '--kpi-color': color } as React.CSSProperties}
    >
      {/* Top gradient line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: gradient, borderRadius: '20px 20px 0 0' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div className="metric-label">{label}</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", color, lineHeight: 1.1, marginTop: 4 }}>
            {value}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 4, fontWeight: 500 }}>{unit}</span>
          </div>
          {trend !== undefined && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 3, marginTop: 4,
              fontSize: '0.72rem', fontWeight: 600,
              color: trend < 0 ? '#34d399' : '#f87171',
            }}>
              {trend < 0 ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
              {Math.abs(trend)}% vs last month
            </div>
          )}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: `${color}18`,
          border: `1px solid ${color}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>

      {sparkData && <Sparkline data={sparkData} color={color} />}
    </motion.div>
  )
}

// ── Activity Timeline Item ────────────────────────────────────
function TimelineItem({ activity, delay = 0 }: {
  activity: ReturnType<typeof getMockActivities>[0]
  delay?: number
}) {
  const icons: Record<string, LucideIcon> = { electricity: Zap, transport: Car, waste: Trash2 }
  const colors: Record<string, string> = { electricity: '#f59e0b', transport: '#3b82f6', waste: '#8b5cf6' }
  const Icon = icons[activity.activity_type] || Leaf
  const color = colors[activity.activity_type] || '#10b981'
  const isNeg = activity.carbon_kg < 0

  const timeAgo = (() => {
    const d = new Date(activity.activity_date)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    return `${diff}d ago`
  })()

  return (
    <motion.div
      className="timeline-item"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
    >
      <div className="timeline-dot" style={{ background: `${color}18`, border: `1px solid ${color}25` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="timeline-card" style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activity.title}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activity.description}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
            <span className={`carbon-badge ${isNeg ? 'negative' : 'positive'}`}>
              {isNeg ? '↓' : '↑'} {Math.abs(activity.carbon_kg)} kg
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{timeAgo}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Recommendation Card ──────────────────────────────────────
function RecCard({
  icon, title, saving, impact, color, delay = 0
}: {
  icon: LucideIcon; title: string; saving: string
  impact: 'high' | 'medium' | 'low'; color: string; delay?: number
}) {
  const navigate = useNavigate()
  return (
    <motion.div
      className="rec-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      {/* accent top line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, transparent)`, borderRadius: '18px 18px 0 0' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {(() => { const I = icon; return <I size={18} style={{ color }} /> })()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingDown size={10} /> Save {saving}
            </span>
            <span className={`difficulty-badge ${impact}`}>{impact}</span>
          </div>
        </div>
      </div>
      <button
        onClick={() => navigate('/dashboard/calculator')}
        style={{
          width: '100%', padding: '8px', borderRadius: 10,
          background: `${color}12`, border: `1px solid ${color}20`,
          color, fontSize: '0.78rem', fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          transition: 'all 200ms ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = `${color}22` }}
        onMouseLeave={(e) => { e.currentTarget.style.background = `${color}12` }}
      >
        Apply Action <ChevronRight size={12} />
      </button>
    </motion.div>
  )
}

// ── Live Environment Widget ──────────────────────────────────
function LiveEnvWidget() {
  const { userCity, userState, userFlag } = useAppStore()
  const { data: weather, isLoading: wLoading } = useWeather(userCity)
  const { data: aqi, isLoading: aqiLoading } = useAQI(userCity)
  const aqiInfo = aqi ? getAQILabel(aqi.aqi) : null
  const navigate = useNavigate()

  return (
    <div className="mini-widget" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="section-heading" style={{ fontSize: '0.9rem' }}>Live Environment</div>
          <div className="section-subtext" style={{ fontSize: '0.72rem' }}>{userFlag} {userCity}, {userState} · Real-time</div>
        </div>
        <button
          onClick={() => navigate('/dashboard/environment')}
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Details <ArrowRight size={11} />
        </button>
      </div>

      {(wLoading || aqiLoading) ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: 24, height: 24, border: '2px solid rgba(16,185,129,0.2)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* AQI prominent display */}
          {aqi && aqiInfo && (
            <div style={{ padding: '12px 14px', borderRadius: 14, background: `${aqiInfo.bgColor}`, border: `1px solid ${aqiInfo.color}25`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.5rem' }}>🌫️</span>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", color: aqiInfo.color, lineHeight: 1 }}>
                  AQI {aqi.aqi}
                </div>
                <div style={{ fontSize: '0.72rem', color: aqiInfo.color, opacity: 0.8, marginTop: 2 }}>{aqiInfo.label}</div>
              </div>
            </div>
          )}

          {/* Weather stats grid */}
          {weather && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {[
                { icon: Thermometer, label: 'Temp', value: `${weather.temp}°C`, color: '#f59e0b' },
                { icon: Droplets, label: 'Humidity', value: `${weather.humidity}%`, color: '#60a5fa' },
                { icon: Wind, label: 'Wind', value: `${weather.wind_speed}m/s`, color: '#2dd4bf' },
                { icon: Gauge, label: 'Pressure', value: `${weather.pressure}`, color: '#a78bfa' },
                { icon: Sun, label: 'UV', value: 'Moderate', color: '#fbbf24' },
                { icon: Globe, label: 'Condition', value: weather.description, color: '#34d399' },
              ].map(({ icon: Icon, label, value, color: c }) => (
                <div key={label} className="env-stat-block">
                  <Icon size={14} style={{ color: c }} />
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.2, wordBreak: 'break-all', textAlign: 'center', textTransform: 'capitalize' }}>{value}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Goal Progress Widget ─────────────────────────────────────
function GoalProgressWidget({ totalCarbon }: { totalCarbon: number }) {
  const monthlyGoal = 300
  const progress = Math.min((totalCarbon / monthlyGoal) * 100, 100)
  const remaining = Math.max(monthlyGoal - totalCarbon, 0)
  const daysInMonth = 30
  const daysPassed = new Date().getDate()
  const expectedAtEnd = (totalCarbon / daysPassed) * daysInMonth
  const isOnTrack = expectedAtEnd <= monthlyGoal

  return (
    <div className="mini-widget" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div className="section-heading" style={{ fontSize: '0.9rem' }}>Monthly Goal</div>
        <div className="section-subtext" style={{ fontSize: '0.72rem' }}>Carbon budget tracker</div>
      </div>

      {/* Large progress indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Circular progress */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg viewBox="0 0 64 64" style={{ width: 64, height: 64 }}>
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
            <circle cx="32" cy="32" r="26" fill="none"
              stroke={isOnTrack ? '#10b981' : '#f59e0b'}
              strokeWidth="6"
              strokeDasharray={`${progress * 1.634} 163.4`}
              strokeLinecap="round"
              transform="rotate(-90 32 32)"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isOnTrack ? '#10b981' : '#f59e0b', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{monthlyGoal} kg CO₂</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <span style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: 99, background: isOnTrack ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: isOnTrack ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
              {isOnTrack ? '✓ On Track' : '⚠ Over Budget'}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>Used: {formatCarbonKg(totalCarbon)}</span>
          <span>Remaining: {formatCarbonKg(remaining)}</span>
        </div>
        <div className="goal-bar-track">
          <motion.div
            className="goal-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ background: isOnTrack ? 'linear-gradient(90deg, #10b981, #14b8a6)' : 'linear-gradient(90deg, #f59e0b, #f97316)' }}
          />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {[
          { label: 'Current Carbon', value: formatCarbonKg(totalCarbon) },
          { label: 'Projected End', value: formatCarbonKg(expectedAtEnd) },
          { label: 'Day of Month', value: `${daysPassed} / ${daysInMonth}` },
        ].map(({ label, value }) => (
          <div key={label} className="mini-stat-row">
            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── World Map Widget ─────────────────────────────────────────
function WorldMapWidget() {
  const { userCity, userState, userCountry, userFlag } = useAppStore()
  const navigate = useNavigate()
  const { data: weather } = useWeather(userCity)
  const { data: aqi } = useAQI(userCity)
  const aqiInfo = aqi ? getAQILabel(aqi.aqi) : null
  const icon = weather ? getWeatherIcon(weather.weather_code || 802) : '🌍'

  return (
    <motion.div
      className="world-widget-card"
      onClick={() => navigate('/dashboard/map')}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Background gradient blobs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 20 }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -10, left: 10, width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 2 }}>World Sustainability Node</div>
            <div className="section-heading" style={{ fontSize: '0.9rem' }}>{userFlag} {userCity}, {userState} ({userCountry})</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
            View Globe <ChevronRight size={12} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {weather && (
            <div style={{ padding: '10px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>Weather</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{weather.temp}°C</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 1, textTransform: 'capitalize' }}>{weather.description}</div>
            </div>
          )}
          {aqi && aqiInfo && (
            <div style={{ padding: '10px', borderRadius: 12, background: `${aqiInfo.bgColor}`, border: `1px solid ${aqiInfo.color}25` }}>
              <div style={{ fontSize: '0.7rem', color: aqiInfo.color, marginBottom: 2, opacity: 0.8 }}>Air Quality</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: aqiInfo.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AQI {aqi.aqi}</div>
              <div style={{ fontSize: '0.68rem', color: aqiInfo.color, opacity: 0.75, marginTop: 1 }}>{aqiInfo.label}</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <Leaf size={12} style={{ color: '#10b981' }} />
          <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 500 }}>Carbon Intensity: Moderate · 0.82 kg/kWh</span>
        </div>
      </div>
    </motion.div>
  )
}

// ── Hero Section ──────────────────────────────────────────────
function HeroSection({ user, score, grade, color, label, totalCarbon }: {
  user: { full_name?: string; email?: string } | null
  score: number; grade: string; color: string; label: string; totalCarbon: number
}) {
  const navigate = useNavigate()
  const circumference = 2 * Math.PI * 40

  return (
    <motion.div
      className="card relative overflow-hidden"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(59,130,246,0.06) 50%, rgba(139,92,246,0.05) 100%)',
        border: '1px solid rgba(16,185,129,0.18)',
        padding: 0,
        marginBottom: 0,
      }}
    >
      {/* Ambient glow blobs */}
      <div style={{ position: 'absolute', top: -60, right: '30%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -40, left: '10%', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="hero-grid" style={{ padding: 28 }}>
        {/* Left: Executive Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, zIndex: 1 }}>
          {/* Greeting */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: '1.5rem' }}>{getTimeOfDayEmoji()}</span>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                  Environmental Intelligence Platform
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)', lineHeight: 1.2, marginTop: 2 }}>
                  {getDayGreeting()}, {user?.full_name?.split(' ')[0] || 'Explorer'} 👋
                </h1>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Here's your environmental impact for this month. You're making a difference.
            </p>
          </div>

          {/* Score + Stats row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {/* Score ring */}
            <div className="score-ring-container">
              <svg viewBox="0 0 100 100" style={{ width: 90, height: 90 }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8"
                  strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dasharray 1.2s ease', filter: `drop-shadow(0 0 6px ${color}60)` }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", color, lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 1, fontWeight: 500 }}>SCORE</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", color }}>{grade}</span>
                <span style={{
                  padding: '3px 10px', borderRadius: 99,
                  background: `${color}18`, color, fontSize: '0.72rem', fontWeight: 700,
                  border: `1px solid ${color}30`,
                }}>{label}</span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Sustainability Score</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Users size={12} style={{ color: '#60a5fa' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Better than <span style={{ color: '#60a5fa', fontWeight: 700 }}>65%</span> of users</span>
              </div>
            </div>
          </div>

          {/* Mini metrics grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {[
              { icon: Leaf, label: 'Monthly Carbon', value: formatCarbonKg(totalCarbon), color: '#10b981' },
              { icon: TrendingDown, label: 'Weekly Progress', value: '-12%', color: '#34d399' },
              { icon: TreePine, label: 'Trees Saved', value: '3.2', color: '#84cc16' },
              { icon: Flame, label: 'Current Streak', value: '7 days 🔥', color: '#f59e0b' },
            ].map(({ icon: I, label: lbl, value: val, color: c }) => (
              <div key={lbl} className="hero-glass-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <I size={13} style={{ color: c }} />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{lbl}</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Action button */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/dashboard/calculator')} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
              Log Activity <ArrowRight size={14} />
            </button>
            <button onClick={() => navigate('/dashboard/analytics')} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
              View Analytics
            </button>
          </div>
        </div>

        {/* Right: Earth */}
        <div className="hero-earth-container" style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
          <GlobalEarthBackground mode="dashboard" showWidgets={false} className="" />
          {/* Overlay info */}
          <div style={{
            position: 'absolute', bottom: 14, left: 14, right: 14,
            background: 'rgba(10,15,30,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 12, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Globe size={14} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Live Earth Intelligence</span> · Tracking global climate metrics
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Component ────────────────────────────────────────────
type TimeFilter = 'week' | 'month' | 'year'

export default function DashboardHome() {
  const user = useAppStore((s) => s.user)
  const navigate = useNavigate()
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month')

  const activities = getMockActivities()
  const trend = useMemo(() => getMockTrendData(timeFilter === 'week' ? 7 : timeFilter === 'year' ? 12 : 6), [timeFilter])

  const totalCarbon = 284.3
  const { grade, color, label } = getSustainabilityGrade(72)

  // Spark data for KPI cards (last 6 months)
  const spark6 = useMemo(() => getMockTrendData(6), [])

  const chartData = {
    labels: trend.labels,
    datasets: [
      {
        label: 'Electricity',
        data: trend.electricity,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.10)',
        fill: true, tension: 0.45, pointRadius: 3, pointHoverRadius: 6,
        borderWidth: 2,
      },
      {
        label: 'Transport',
        data: trend.transport,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.10)',
        fill: true, tension: 0.45, pointRadius: 3, pointHoverRadius: 6,
        borderWidth: 2,
      },
      {
        label: 'Waste',
        data: trend.waste,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.10)',
        fill: true, tension: 0.45, pointRadius: 3, pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { labels: { color: '#9ca3af', boxWidth: 10, font: { size: 11 }, padding: 16 } },
      tooltip: {
        backgroundColor: 'rgba(10,15,30,0.97)',
        borderColor: 'rgba(255,255,255,0.10)',
        borderWidth: 1,
        titleColor: '#f9fafb',
        bodyColor: '#9ca3af',
        padding: 12,
        cornerRadius: 12,
        callbacks: { label: (ctx: { dataset?: { label?: string }; raw?: unknown }) => ` ${ctx.dataset?.label || ''}: ${ctx.raw} kg CO₂` },
      },
    },
    scales: {
      x: {
        ticks: { color: '#6b7280', font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { display: false },
      },
      y: {
        ticks: { color: '#6b7280', font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { display: false },
      },
    },
  }

  const fadeIn = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.45, ease: 'easeOut' as const },
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Hero Section ── */}
      <HeroSection
        user={user}
        score={72}
        grade={grade}
        color={color}
        label={label}
        totalCarbon={totalCarbon}
      />

      {/* ── 4 KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}
        className="lg:grid-cols-4">
        <KPICard
          icon={Zap} label="Electricity" value="320" unit="kWh"
          trend={-8} color="#f59e0b"
          gradient="linear-gradient(90deg, #f59e0b, #d97706)"
          sparkData={spark6.electricity} delay={0.05}
        />
        <KPICard
          icon={Car} label="Transport" value="94.5" unit="kg CO₂"
          trend={5} color="#3b82f6"
          gradient="linear-gradient(90deg, #3b82f6, #2563eb)"
          sparkData={spark6.transport} delay={0.10}
        />
        <KPICard
          icon={Trash2} label="Waste" value="14.5" unit="kg CO₂"
          trend={-15} color="#8b5cf6"
          gradient="linear-gradient(90deg, #8b5cf6, #7c3aed)"
          sparkData={spark6.waste} delay={0.15}
        />
        <KPICard
          icon={Award} label="Carbon Saved" value="34.2" unit="kg"
          trend={-20} color="#10b981"
          gradient="linear-gradient(90deg, #10b981, #059669)"
          sparkData={spark6.electricity.map((v, i) => Math.max(10, 50 - v * 0.1 + i * 2))} delay={0.20}
        />
      </div>

      {/* ── Chart + Activity Timeline ── */}
      <motion.div
        style={{ display: 'grid', gap: 20 }}
        className="lg:grid-cols-5"
        {...fadeIn(0.25)}
      >
        {/* Carbon Trend Chart */}
        <div className="card lg:col-span-3">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div className="section-heading">Carbon Emissions Trend</div>
              <div className="section-subtext">Your emissions breakdown over time</div>
            </div>
            <div className="chart-filter-tabs">
              {(['week', 'month', 'year'] as TimeFilter[]).map((f) => (
                <button
                  key={f}
                  className={`chart-filter-tab ${timeFilter === f ? 'active' : ''}`}
                  onClick={() => setTimeFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-container" style={{ height: 240 }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="card lg:col-span-2">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div className="section-heading">Recent Activity</div>
              <div className="section-subtext">Your carbon trail</div>
            </div>
            <button
              onClick={() => navigate('/dashboard/activities')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              All <ArrowRight size={12} />
            </button>
          </div>
          <div className="activity-timeline">
            {activities.map((a, i) => (
              <TimelineItem key={a.id} activity={a} delay={0.05 * i} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Recommendations ── */}
      <motion.div {...fadeIn(0.3)}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div className="section-heading">🤖 AI Recommendations</div>
            <div className="section-subtext">Personalized actions to reduce your footprint</div>
          </div>
          <button
            onClick={() => navigate('/dashboard/calculator')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            See all <ArrowRight size={13} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <RecCard icon={Lightbulb} title="Switch to LED Bulbs" saving="8 kg CO₂/mo" impact="high" color="#f59e0b" delay={0.05} />
          <RecCard icon={Bus} title="Use Public Transport" saving="20 kg CO₂/mo" impact="high" color="#3b82f6" delay={0.10} />
          <RecCard icon={Recycle} title="Compost Organic Waste" saving="4 kg CO₂/mo" impact="medium" color="#10b981" delay={0.15} />
          <RecCard icon={TreePine} title="Plant Trees" saving="21 kg CO₂/yr" impact="low" color="#84cc16" delay={0.20} />
        </div>
      </motion.div>

      {/* ── Live Env + Goal Progress ── */}
      <motion.div
        style={{ display: 'grid', gap: 20 }}
        className="lg:grid-cols-2"
        {...fadeIn(0.35)}
      >
        <LiveEnvWidget />
        <GoalProgressWidget totalCarbon={totalCarbon} />
      </motion.div>

      {/* ── World Map Widget ── */}
      <motion.div {...fadeIn(0.4)}>
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="section-heading">🌍 World Sustainability Map</div>
            <div className="section-subtext">Your location's environmental snapshot</div>
          </div>
        </div>
        <WorldMapWidget />
      </motion.div>

      {/* ── Alert ── */}
      <motion.div
        className="premium-alert"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <AlertCircle size={16} style={{ color: '#fbbf24', flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fbbf24' }}>⚡ Electricity usage is above average this week</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>
            Consider reducing AC usage or checking for devices left on standby. Estimated savings: ~15 kg CO₂/month.
          </div>
        </div>
      </motion.div>
    </div>
  )
}
