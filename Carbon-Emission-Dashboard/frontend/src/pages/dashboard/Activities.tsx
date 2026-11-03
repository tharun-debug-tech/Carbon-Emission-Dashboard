// src/pages/dashboard/Activities.tsx
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity as ActivityIcon, Plus, Trash2, Edit3, Search,
  Zap, Car, Trash, Leaf, Download, X,
  BarChart2, Clock, ArrowUpRight, ArrowDownRight, Eye,
  TrendingUp, TrendingDown, Calendar,
  Lightbulb, AlertCircle, RotateCcw,
  Target, FileText, CheckCircle, ShieldCheck, MapPin,
  Sparkles
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getMockActivities, getMockTrendData, generateRecommendations } from '@/services/api'
import { useAppStore } from '@/store/useAppStore'
import { useWeather } from '@/hooks/useWeather'
import { useAQI } from '@/hooks/useAQI'
import { getAQILabel } from '@/lib/utils'
import { downloadPdfReport, reportDateStamp } from '@/lib/reportDownload'
import toast from 'react-hot-toast'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Filler, Tooltip, Legend
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Filler, Tooltip, Legend
)

interface ActivityItem {
  id: string
  activity_type: 'electricity' | 'transport' | 'waste'
  title: string
  description: string
  carbon_kg: number
  activity_date: string
  created_at: string
}

// ── Animation Variants ────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.38, ease: 'easeOut' as const },
})

// ── Category Helpers ──────────────────────────────────────────
function getCategoryIcon(type: string): LucideIcon {
  if (type === 'electricity') return Zap
  if (type === 'transport') return Car
  if (type === 'waste') return Trash
  return Leaf
}

function getCategoryColor(type: string): string {
  if (type === 'electricity') return '#f59e0b'
  if (type === 'transport') return '#3b82f6'
  if (type === 'waste') return '#8b5cf6'
  return '#10b981'
}

function getCategoryGradient(type: string): string {
  if (type === 'electricity') return 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(251,191,36,0.03))'
  if (type === 'transport') return 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(96,165,250,0.03))'
  if (type === 'waste') return 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(167,139,250,0.03))'
  return 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(52,211,153,0.03))'
}

// ── Mini Sparkline SVG ────────────────────────────────────────
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || !data.length) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 80, h = 30
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Main Component ────────────────────────────────────────────
export default function Activities() {
  const { userCity, userState, userCountry, userFlag } = useAppStore()
  const { data: weather } = useWeather(userCity)
  const { data: aqi } = useAQI(userCity)
  const aqiInfo = aqi ? getAQILabel(aqi.aqi) : null

  // State
  const [activities, setActivities] = useState<ActivityItem[]>(() => getMockActivities() as ActivityItem[])
  const [filterType, setFilterType] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')
  const [impactFilter, setImpactFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<'date' | 'impact'>('date')
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year'>('month')

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null)
  const [viewingActivity, setViewingActivity] = useState<ActivityItem | null>(null)

  // Form State
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<'electricity' | 'transport' | 'waste'>('electricity')
  const [newCarbon, setNewCarbon] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])

  // ── Executive Computations ────────────────────────────────────
  const summary = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    const todayActs = activities.filter((a) => a.activity_date === todayStr)
    const todayCarbon = todayActs.reduce((sum, a) => sum + a.carbon_kg, 0)
    const totalCarbon = activities.reduce((sum, a) => sum + Math.max(0, a.carbon_kg), 0)

    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

    const weekCarbon = activities
      .filter((a) => a.activity_date >= weekAgo && a.carbon_kg > 0)
      .reduce((sum, a) => sum + a.carbon_kg, 0)

    const monthCarbon = activities
      .filter((a) => a.activity_date >= monthAgo && a.carbon_kg > 0)
      .reduce((sum, a) => sum + a.carbon_kg, 0)

    const carbonSaved = Math.abs(activities.filter((a) => a.carbon_kg < 0).reduce((s, a) => s + a.carbon_kg, 0))

    const catTotals: Record<string, number> = { electricity: 0, transport: 0, waste: 0 }
    activities.forEach((a) => {
      if (a.carbon_kg > 0) catTotals[a.activity_type] = (catTotals[a.activity_type] || 0) + a.carbon_kg
    })

    // Highest and Lowest
    let highestCat = 'Electricity'
    let highestVal = -1
    let lowestCat = 'Waste'
    let lowestVal = Infinity

    Object.entries(catTotals).forEach(([cat, val]) => {
      if (val > highestVal) { highestVal = val; highestCat = cat.charAt(0).toUpperCase() + cat.slice(1) }
      if (val < lowestVal) { lowestVal = val; lowestCat = cat.charAt(0).toUpperCase() + cat.slice(1) }
    })

    const topSingleEmission = [...activities].sort((a, b) => b.carbon_kg - a.carbon_kg)[0]
    const topSingleOffset = [...activities].filter(a => a.carbon_kg < 0).sort((a, b) => a.carbon_kg - b.carbon_kg)[0]

    // Consecutive streak
    const actDates = new Set(activities.map((a) => a.activity_date))
    let streak = 0
    let d = new Date()
    while (actDates.has(d.toISOString().split('T')[0])) {
      streak++
      d = new Date(d.getTime() - 86400000)
    }

    // Goal progress (Target: keep monthly CO2 under 500kg)
    const goalTarget = 500
    const goalProgress = Math.min(100, Math.round(((goalTarget - Math.min(goalTarget, monthCarbon)) / goalTarget) * 100))

    return {
      todayCount: todayActs.length,
      todayCarbon: Math.round(todayCarbon * 10) / 10,
      weekCarbon: Math.round(weekCarbon * 10) / 10,
      monthCarbon: Math.round(monthCarbon * 10) / 10,
      totalCarbon: Math.round(totalCarbon * 10) / 10,
      carbonSaved: Math.round(carbonSaved * 10) / 10,
      highestCat,
      highestVal: Math.round(highestVal * 10) / 10,
      lowestCat,
      lowestVal: Math.round(lowestVal * 10) / 10,
      topSingleEmission,
      topSingleOffset,
      catTotals,
      streak,
      goalProgress,
    }
  }, [activities])

  // ── Trend Data ────────────────────────────────────────────────
  const trendData = useMemo(() => getMockTrendData(
    timeFilter === 'week' ? 7 : timeFilter === 'year' ? 12 : 6
  ), [timeFilter])

  // Sparklines for 4 KPI Cards
  const elecSpark = useMemo(() => trendData.electricity.slice(-6), [trendData])
  const transSpark = useMemo(() => trendData.transport.slice(-6), [trendData])
  const wasteSpark = useMemo(() => trendData.waste.slice(-6), [trendData])
  const savedSpark = useMemo(() => [12, 28, 45, 30, 65, summary.carbonSaved || 85], [summary.carbonSaved])

  // ── Filtered Activities ───────────────────────────────────────
  const processedActivities = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

    return activities
      .filter((a) => {
        // Category Filter
        if (filterType !== 'all' && a.activity_type !== filterType) return false

        // Search Query
        const q = searchQuery.trim().toLowerCase()
        if (q) {
          const match =
            a.title.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q) ||
            a.activity_type.toLowerCase().includes(q)
          if (!match) return false
        }

        // Date Range
        if (dateRange === 'today' && a.activity_date !== todayStr) return false
        if (dateRange === 'week' && a.activity_date < weekAgo) return false
        if (dateRange === 'month' && a.activity_date < monthAgo) return false

        // Impact Filter
        if (impactFilter === 'high' && a.carbon_kg < 50) return false
        if (impactFilter === 'medium' && (a.carbon_kg < 10 || a.carbon_kg >= 50)) return false
        if (impactFilter === 'low' && (a.carbon_kg < 0 || a.carbon_kg >= 10)) return false
        if (impactFilter === 'offset' && a.carbon_kg >= 0) return false

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'impact') return Math.abs(b.carbon_kg) - Math.abs(a.carbon_kg)
        return new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime()
      })
  }, [activities, filterType, dateRange, impactFilter, searchQuery, sortBy])

  // ── Recommendations ───────────────────────────────────────────
  const recommendations = useMemo(() =>
    generateRecommendations({
      electricity_kg: summary.catTotals.electricity || 0,
      transport_kg: summary.catTotals.transport || 0,
      waste_kg: summary.catTotals.waste || 0,
    }).slice(0, 4)
  , [summary.catTotals])

  // ── Event Handlers ───────────────────────────────────────────
  const handleCreateOrUpdateActivity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newCarbon) { toast.error('Please specify title and CO₂ impact'); return }
    if (editingActivity) {
      setActivities((prev) =>
        prev.map((a) =>
          a.id === editingActivity.id
            ? { ...a, title: newTitle, activity_type: newType, carbon_kg: parseFloat(newCarbon), description: newDesc, activity_date: newDate }
            : a
        )
      )
      toast.success('Activity updated! ✏️')
    } else {
      setActivities([{
        id: Date.now().toString(),
        activity_type: newType,
        title: newTitle,
        description: newDesc || 'User logged carbon activity',
        carbon_kg: parseFloat(newCarbon),
        activity_date: newDate,
        created_at: new Date().toISOString(),
      }, ...activities])
      toast.success('New activity logged! 🌱')
    }
    setNewTitle(''); setNewCarbon(''); setNewDesc('')
    setEditingActivity(null); setShowAddModal(false)
  }

  const handleOpenEdit = (act: ActivityItem) => {
    setEditingActivity(act); setNewTitle(act.title); setNewType(act.activity_type)
    setNewCarbon(act.carbon_kg.toString()); setNewDesc(act.description)
    setNewDate(act.activity_date); setShowAddModal(true)
  }

  const handleDelete = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id))
    toast.success('Activity entry removed')
  }

  const handleExportCSV = () => {
    const headers = 'ID,Title,Type,Description,CarbonKg,Date\n'
    const rows = activities
      .map((a) => `"${a.id}","${a.title}","${a.activity_type}","${a.description}",${a.carbon_kg},"${a.activity_date}"`)
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = `ecotrack_activities_${new Date().toISOString().split('T')[0]}.csv`
    link.click(); toast.success('Activities exported to CSV!')
  }

  const handleExportPDF = () => {
    downloadPdfReport('EcoTrack Activity Carbon Intelligence Report', `ecotrack-activities-${reportDateStamp()}.pdf`, [
      {
        heading: 'Location Snapshot',
        rows: [
          ['Location', `${userCity}, ${userState}, ${userCountry}`],
          ['Weather', weather ? `${weather.temp} degC, ${weather.description}` : 'Not available'],
          ['AQI', aqi ? `${aqi.aqi} (${aqiInfo?.label ?? 'Unknown'})` : 'Not available'],
        ],
      },
      {
        heading: 'Carbon Summary',
        rows: [
          ['Today Entries', summary.todayCount],
          ['Today Carbon', `${summary.todayCarbon} kg CO2`],
          ['Weekly Carbon', `${summary.weekCarbon} kg CO2`],
          ['Monthly Carbon', `${summary.monthCarbon} kg CO2`],
          ['Carbon Saved', `${summary.carbonSaved} kg CO2`],
          ['Active Streak', `${summary.streak} days`],
          ['Goal Progress', `${summary.goalProgress}%`],
        ],
      },
      {
        heading: 'Activity Entries',
        rows: processedActivities.slice(0, 12).map((activity) => [activity.title, `${activity.activity_type} | ${activity.carbon_kg} kg CO2 | ${activity.activity_date}`]),
      },
      {
        heading: 'Recommendations',
        rows: recommendations.map((rec, index) => [`Recommendation ${index + 1}`, `${rec.title} - estimated saving ${rec.potential_saving_kg} kg CO2/mo`]),
      },
    ])
    toast.success('Activity PDF report downloaded.')
  }

  const handleResetFilters = () => {
    setFilterType('all')
    setDateRange('all')
    setImpactFilter('all')
    setSearchQuery('')
    setSortBy('date')
    toast.success('Filters reset to default')
  }

  // ── Chart Configurations ──────────────────────────────────────
  const lineChartData = {
    labels: trendData.labels,
    datasets: [
      {
        label: 'Electricity (kWh / CO₂)',
        data: trendData.electricity,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.12)',
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#f59e0b',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Transport (Transit CO₂)',
        data: trendData.transport,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.12)',
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3b82f6',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Waste (Disposal CO₂)',
        data: trendData.waste,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.12)',
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#8b5cf6',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#9ca3af', font: { size: 12, family: 'Inter' }, boxWidth: 12, padding: 20 },
      },
      tooltip: {
        backgroundColor: 'rgba(10,15,30,0.95)',
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        titleColor: '#f9fafb',
        bodyColor: '#d1d5db',
        padding: 14,
        boxPadding: 6,
        callbacks: {
          label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.parsed.y} kg CO₂`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#6b7280', font: { size: 11, family: 'Inter' } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#6b7280', font: { size: 11, family: 'Inter' }, callback: (v: any) => `${v} kg` },
      },
    },
  }

  const donutTotal = (summary.catTotals.electricity || 0) + (summary.catTotals.transport || 0) + (summary.catTotals.waste || 0)
  const donutData = {
    labels: ['Electricity', 'Transport', 'Waste'],
    datasets: [{
      data: [
        Math.round((summary.catTotals.electricity || 0) * 10) / 10,
        Math.round((summary.catTotals.transport || 0) * 10) / 10,
        Math.round((summary.catTotals.waste || 0) * 10) / 10,
      ],
      backgroundColor: ['rgba(245,158,11,0.85)', 'rgba(59,130,246,0.85)', 'rgba(139,92,246,0.85)'],
      borderColor: ['#f59e0b', '#3b82f6', '#8b5cf6'],
      borderWidth: 2,
      hoverOffset: 8,
    }],
  }

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '74%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(10,15,30,0.95)',
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        titleColor: '#f9fafb',
        bodyColor: '#d1d5db',
        padding: 12,
        callbacks: {
          label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed} kg CO₂`,
        },
      },
    },
  }

  // ── Quick Insights List ───────────────────────────────────────
  const quickInsights = [
    {
      icon: summary.catTotals.transport > 50 ? TrendingUp : CheckCircle,
      color: summary.catTotals.transport > 50 ? '#f59e0b' : '#10b981',
      title: 'Transport Emissions Analysis',
      text: summary.catTotals.transport > 50
        ? `Transport emissions increased by ~12% this week. Switching 2 weekly commutes to public transit saves 18.5kg CO₂.`
        : `Transit emissions are well-optimized in ${userCity}! Public transit usage has lowered your weekly average.`,
    },
    {
      icon: summary.catTotals.electricity > 100 ? AlertCircle : CheckCircle,
      color: summary.catTotals.electricity > 100 ? '#ef4444' : '#10b981',
      title: 'Grid Electricity Efficiency',
      text: summary.catTotals.electricity > 100
        ? `Electricity consumption is 14% higher than your monthly average. Adjusting HVAC to 24°C reduces power draw by ~8%.`
        : `Electricity consumption is 8% below regional average in ${userCity}. Solar offsets and energy conservation are working.`,
    },
    {
      icon: aqi && aqi.aqi <= 50 ? ShieldCheck : AlertCircle,
      color: aqiInfo?.color || '#10b981',
      title: `Live AQI Status — ${userCity}`,
      text: aqi
        ? `Current Air Quality Index is ${aqiInfo?.label} (${aqi.aqi}) in ${userCity}. ${aqi.aqi <= 50 ? 'Optimal conditions for zero-emission cycling or walking!' : 'Slight air haze; minimize outdoor heavy exercise.'}`
        : `Monitoring environmental node in ${userCity}...`,
    },
    {
      icon: Target,
      color: '#8b5cf6',
      title: 'Monthly Reduction Goal',
      text: `Your sustainability goal (-15% CO₂ reduction target) is on track at ${summary.goalProgress}% progress. Keep up green offsets!`,
    },
  ]

  return (
    <div className="activity-page dashboard-page-clean pb-12">
      {/* ============================================================
          SECTION 1: EXECUTIVE ACTIVITY SUMMARY (HERO CARD)
          ============================================================ */}
      <motion.div {...fadeUp(0)}
        className="activity-panel activity-hero-panel"
        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(15,23,42,0.95) 40%, rgba(139,92,246,0.08))' }}
      >
        {/* Background glow accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Title & Node Info */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
                <Sparkles size={14} /> Carbon Activity Intelligence Platform
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-black text-white tracking-tight">
                Activity Management
              </h1>
              <p className="text-gray-400 text-sm mt-1.5 flex items-center gap-2 flex-wrap">
                <MapPin size={12} className="text-emerald-400 flex-shrink-0" />
                <span className="text-gray-300 font-medium truncate">{userFlag} {userCity}, {userState}, {userCountry}</span>
              </p>
            </div>

            {/* Log & Export Action Buttons */}
            <div className="activity-action-row">
              <button
                onClick={() => { setEditingActivity(null); setNewTitle(''); setNewCarbon(''); setNewDesc(''); setShowAddModal(true) }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/25 active:scale-95 whitespace-nowrap"
              >
                <Plus size={14} /> Log Activity
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 whitespace-nowrap"
              >
                <Download size={13} /> CSV
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 whitespace-nowrap"
              >
                <FileText size={13} /> PDF
              </button>
            </div>
          </div>

          {/* Unified Hero Executive Metrics Strip */}
          <div className="activity-summary-grid">
            <div className="activity-summary-card">
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">Today's Carbon</span>
              <span className="text-2xl font-black font-mono text-amber-400 block">{summary.todayCarbon} <span className="text-xs font-sans text-gray-400">kg</span></span>
              <span className="text-[10px] text-gray-500 block">Daily CO₂ footprint</span>
            </div>

            <div className="activity-summary-card">
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">Today's Logs</span>
              <span className="text-2xl font-black font-mono text-emerald-400 block">{summary.todayCount} <span className="text-xs font-sans text-gray-400">entries</span></span>
              <span className="text-[10px] text-gray-500 block">Activities recorded</span>
            </div>

            <div className="activity-summary-card">
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">Weekly Carbon</span>
              <span className="text-2xl font-black font-mono text-blue-400 block">{summary.weekCarbon} <span className="text-xs font-sans text-gray-400">kg</span></span>
              <span className="text-[10px] text-gray-500 block">Last 7 days total</span>
            </div>

            <div className="activity-summary-card">
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">Monthly Carbon</span>
              <span className="text-2xl font-black font-mono text-purple-400 block">{summary.monthCarbon} <span className="text-xs font-sans text-gray-400">kg</span></span>
              <span className="text-[10px] text-gray-500 block">30-day cumulative</span>
            </div>

            <div className="activity-summary-card">
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">Carbon Saved</span>
              <span className="text-2xl font-black font-mono text-emerald-400 block">{summary.carbonSaved} <span className="text-xs font-sans text-gray-400">kg</span></span>
              <span className="text-[10px] text-gray-500 block">Green offsets logged</span>
            </div>

            <div className="activity-summary-card">
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">Active Streak</span>
              <span className="text-2xl font-black font-mono text-amber-400 block">{summary.streak} <span className="text-xs font-sans text-gray-400">days 🔥</span></span>
              <span className="text-[10px] text-gray-500 block">Continuous tracking</span>
            </div>
          </div>

          {/* Target Progress Bar */}
          <div className="activity-target-card">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Target size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Monthly Sustainability Target (-15% CO₂ Reduction Goal)</span>
                <span className="text-[11px] text-gray-400">Tracked against regional baseline of 500kg CO₂ / month</span>
              </div>
            </div>

            <div className="activity-target-progress">
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-emerald-400 font-bold">{summary.goalProgress}% On Track</span>
                  <span className="text-gray-400">{summary.monthCarbon} / 500 kg</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                    style={{ width: `${summary.goalProgress}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ============================================================
          SECTION 2: 4 EQUAL KPI CARDS
          ============================================================ */}
      <motion.div {...fadeUp(0.1)} className="activity-kpi-grid">
        {[
          { label: 'Electricity', icon: Zap, color: '#f59e0b', val: summary.catTotals.electricity || 0, spark: elecSpark, trend: 12, comp: '+14.2 kg vs last mo' },
          { label: 'Transport', icon: Car, color: '#3b82f6', val: summary.catTotals.transport || 0, spark: transSpark, trend: -5, comp: '-8.5 kg vs last mo' },
          { label: 'Waste', icon: Trash, color: '#8b5cf6', val: summary.catTotals.waste || 0, spark: wasteSpark, trend: 3, comp: '+1.4 kg vs last mo' },
          { label: 'Carbon Saved', icon: Leaf, color: '#10b981', val: summary.carbonSaved, spark: savedSpark, trend: -18, comp: '+24.0 kg offset gain' },
        ].map((item) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.label}
              whileHover={{ y: -3 }}
              className="activity-kpi-card group"
              style={{ background: getCategoryGradient(item.label.toLowerCase()), boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${item.color}22`, border: `1px solid ${item.color}40` }}>
                  <Icon size={20} style={{ color: item.color }} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                  item.trend >= 0 ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                }`}>
                  {item.trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(item.trend)}%
                </div>
              </div>

              {/* Value & Label */}
              <div className="flex-1">
                <div className="text-2xl font-black font-display text-white tracking-tight leading-tight">{item.val.toFixed(1)}</div>
                <div className="text-xs text-gray-400 font-mono">kg CO₂</div>
                <div className="text-xs font-semibold text-gray-300 mt-1">{item.label} Footprint</div>
              </div>

              {/* Sparkline & Comparison */}
              <div className="flex items-end justify-between border-t border-white/8 pt-2.5 mt-3">
                <span className="text-[10px] text-gray-500 font-mono leading-tight">{item.comp}</span>
                <MiniSparkline data={item.spark} color={item.color} />
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* ============================================================
          SECTION 3: SINGLE ROW GLASSMORPHISM FILTER TOOLBAR
          ============================================================ */}
      <motion.div {...fadeUp(0.15)}
        className="activity-panel activity-filter-panel"
      >
        <div className="space-y-3">
          {/* Row 1: Search Bar (full width) */}
          <div className="relative w-full">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities by title, category, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50 placeholder:text-gray-500 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Row 2: Filter Controls (wrap freely) */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-8 px-3 text-xs font-semibold bg-slate-800 border border-white/10 rounded-lg text-gray-200 outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              <option value="all">Category: All</option>
              <option value="electricity">Electricity</option>
              <option value="transport">Transport</option>
              <option value="waste">Waste</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-8 px-3 text-xs font-semibold bg-slate-800 border border-white/10 rounded-lg text-gray-200 outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              <option value="all">Date: All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            <select
              value={impactFilter}
              onChange={(e) => setImpactFilter(e.target.value)}
              className="h-8 px-3 text-xs font-semibold bg-slate-800 border border-white/10 rounded-lg text-gray-200 outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              <option value="all">Impact: All</option>
              <option value="high">High (&gt;50kg)</option>
              <option value="medium">Medium (10-50kg)</option>
              <option value="low">Low (&lt;10kg)</option>
              <option value="offset">Green Offsets</option>
            </select>

            <button
              onClick={() => setSortBy((s) => (s === 'date' ? 'impact' : 'date'))}
              className="h-8 flex items-center gap-1.5 px-3 text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-200 transition-all cursor-pointer whitespace-nowrap"
            >
              <Calendar size={12} />
              {sortBy === 'date' ? 'Sort: Date' : 'Sort: Impact'}
            </button>

            <button
              onClick={handleResetFilters}
              className="h-8 flex items-center gap-1.5 px-3 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-all cursor-pointer whitespace-nowrap"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </div>
      </motion.div>

      {/* ============================================================
          SECTION 4 & 5: ACTIVITY TIMELINE (LARGE) + RIGHT ANALYTICS PANEL
          ============================================================ */}
      <div className="activity-main-grid">
        {/* SECTION 4: ACTIVITY TIMELINE CARDS (Left 8-col) */}
        <div className="activity-timeline-column">
          <div className="activity-section-header">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock size={18} className="text-emerald-400" /> Activity Stream Timeline
            </h2>
            <span className="text-xs font-mono text-gray-400">
              Showing {processedActivities.length} of {activities.length} entries
            </span>
          </div>

          <div className="activity-stream-list">
            {processedActivities.length === 0 ? (
              <motion.div {...fadeUp(0.2)} className="p-12 text-center rounded-[20px] border border-white/10 bg-slate-900/60 text-gray-400 space-y-2">
                <Leaf size={32} className="mx-auto text-emerald-400 opacity-50 mb-2" />
                <p className="text-sm font-bold text-white">No activities match your filters</p>
                <p className="text-xs text-gray-500">Try adjusting your search query, category, or impact filter.</p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {processedActivities.map((act, i) => {
                  const Icon = getCategoryIcon(act.activity_type)
                  const color = getCategoryColor(act.activity_type)
                  const isNegative = act.carbon_kg < 0
                  const isToday = act.activity_date === new Date().toISOString().split('T')[0]

                  return (
                    <motion.div
                      key={act.id}
                      layout
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.35, ease: 'easeOut' as const }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      whileHover={{ y: -2 }}
                      className="activity-entry-card group"
                    >
                      {/* Left colored border glow indicator */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: color }} />

                      <div className="activity-entry-content">
                        {/* Icon & Title */}
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"
                            style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                            <Icon size={20} style={{ color }} />
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-white text-base leading-tight">{act.title}</h3>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider"
                                style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                                {act.activity_type}
                              </span>
                              {isToday && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                                  Today
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-gray-400 bg-white/5 border border-white/8">
                                Verified
                              </span>
                            </div>

                            <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">{act.description || 'No description provided.'}</p>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 font-mono pt-0.5">
                              <span className="flex items-center gap-1"><Calendar size={11} /> {act.activity_date}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1"><Clock size={11} /> {new Date(act.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>

                        {/* Impact Value & Action Buttons */}
                        <div className="activity-entry-actions">
                          <div className="text-right">
                            <div className={`text-lg font-black font-mono flex items-center justify-end gap-1 ${
                              isNegative ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {isNegative ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                              <span>{isNegative ? '' : '+'}{act.carbon_kg} kg CO₂</span>
                            </div>
                            <span className="text-[10px] text-gray-500 font-medium">Carbon Footprint</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setViewingActivity(act)}
                              title="View Details"
                              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(act)}
                              title="Edit Activity"
                              className="p-2 rounded-xl text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(act.id)}
                              title="Delete Entry"
                              className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* SECTION 5: RIGHT ANALYTICS PANEL (Right 4-col) */}
        <div className="activity-analytics-column">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart2 size={18} className="text-purple-400" /> Carbon Analytics & Node
          </h2>

          {/* Carbon Distribution Card */}
          <motion.div {...fadeUp(0.2)}
            className="activity-side-card space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Category Distribution</span>
              <span className="text-xs font-mono text-emerald-400">{donutTotal.toFixed(0)} kg Total</span>
            </div>

            <div className="activity-donut-wrap">
              <Doughnut data={donutData} options={donutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-white font-mono">{donutTotal.toFixed(0)}</span>
                <span className="text-[11px] text-gray-400 font-medium">kg CO₂ Total</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              {[
                { label: 'Electricity', val: summary.catTotals.electricity || 0, color: '#f59e0b' },
                { label: 'Transport', val: summary.catTotals.transport || 0, color: '#3b82f6' },
                { label: 'Waste', val: summary.catTotals.waste || 0, color: '#8b5cf6' },
              ].map((item) => {
                const pct = donutTotal > 0 ? Math.round((item.val / donutTotal) * 100) : 0
                return (
                  <div key={item.label} className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-gray-400 block font-medium">{item.label}</span>
                    <span className="text-sm font-bold font-mono text-white block">{item.val.toFixed(1)}kg</span>
                    <span className="text-[10px] font-mono block" style={{ color: item.color }}>{pct}% share</span>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Highest & Lowest Emission Summary Card */}
          <motion.div {...fadeUp(0.25)}
            className="activity-side-card space-y-3"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300 block border-b border-white/8 pb-2">
              Highest vs Lowest Impact
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Highest Sector</span>
                <span className="text-base font-black text-white block">{summary.highestCat}</span>
                <span className="text-xs font-mono text-rose-400 font-bold block">{summary.highestVal} kg CO₂</span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Lowest Sector</span>
                <span className="text-base font-black text-white block">{summary.lowestCat}</span>
                <span className="text-xs font-mono text-emerald-400 font-bold block">{summary.lowestVal} kg CO₂</span>
              </div>
            </div>

            {summary.topSingleOffset && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between text-emerald-300">
                <span className="font-medium">Top Green Offset: {summary.topSingleOffset.title}</span>
                <span className="font-mono font-bold text-emerald-400">{summary.topSingleOffset.carbon_kg} kg</span>
              </div>
            )}
          </motion.div>

          {/* Today's Live Environment Widget */}
          <motion.div {...fadeUp(0.3)}
            className="activity-side-card space-y-3"
          >
            <div className="flex items-center justify-between border-b border-white/8 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <ActivityIcon size={13} className="text-cyan-400" /> Live Environment
              </span>
              <span className="text-xs font-mono text-cyan-300 truncate max-w-[80px]">{userCity}</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                <span className="text-[10px] text-gray-400 block">Temp</span>
                <span className="text-sm font-bold text-amber-400 font-mono">{weather?.temp ?? '--'}°C</span>
                <span className="text-[10px] text-gray-500 block">Feels {weather?.feels_like ?? '--'}°C</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                <span className="text-[10px] text-gray-400 block">AQI</span>
                <span className="text-sm font-bold font-mono" style={{ color: aqiInfo?.color ?? '#10b981' }}>
                  {aqi?.aqi ?? '--'}
                </span>
                <span className="text-[10px] text-gray-500 block truncate">{aqiInfo?.label ?? 'AQI'}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                <span className="text-[10px] text-gray-400 block">Sky</span>
                <span className="text-[11px] font-bold text-white capitalize block truncate leading-tight my-0.5">{weather?.description ?? 'Clear'}</span>
                <span className="text-[10px] text-gray-500 block">{weather?.humidity ?? 65}% Hum</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 flex items-center gap-1.5">
              <MapPin size={12} className="flex-shrink-0" />
              <span className="truncate">{userState}, {userCountry}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ============================================================
          SECTION 6: MONTHLY CARBON TREND (HEIGHT ~400px)
          ============================================================ */}
      <motion.div {...fadeUp(0.35)}
        className="activity-panel activity-chart-panel"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/8 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-400" /> Monthly Carbon Emissions & Offsets Trend
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Visualizing historical emission vectors across Electricity, Transit, and Waste sectors.
            </p>
          </div>

          {/* Time Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
            {(['week', 'month', 'year'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  timeFilter === tf
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Container — Height ~400px */}
        <div className="activity-line-chart">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </motion.div>

      {/* ============================================================
          SECTION 7 & 8: SMART RECOMMENDATIONS & QUICK INSIGHTS
          ============================================================ */}
      <div className="activity-insights-grid">
        {/* SECTION 7: SMART RECOMMENDATIONS */}
        <motion.div {...fadeUp(0.4)}
          className="activity-panel activity-insight-panel"
        >
          <div className="flex items-center justify-between border-b border-white/8 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-400" /> Smart Action Recommendations
            </h2>
            <span className="text-xs text-gray-400 font-mono">Tailored AI Insights</span>
          </div>

          <div className="activity-stream-list">
            {recommendations.map((rec) => {
              const diffColor = rec.impact === 'high' ? '#ef4444' : rec.impact === 'medium' ? '#f59e0b' : '#10b981'
              return (
                <motion.div
                  key={rec.id}
                  whileHover={{ x: 4 }}
                  className="p-4 rounded-xl border border-white/8 bg-white/5 hover:border-white/15 transition-all space-y-2 cursor-default"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{rec.icon}</span>
                      <div>
                        <h3 className="font-bold text-white text-sm">{rec.title}</h3>
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                          <Leaf size={10} /> Estimated Saving: ~{rec.potential_saving_kg} kg CO₂ / mo
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase"
                      style={{ background: `${diffColor}18`, color: diffColor, border: `1px solid ${diffColor}30` }}>
                      {rec.impact} Impact
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed pl-9">{rec.description}</p>

                  <div className="flex items-center justify-between pl-9 pt-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
                      <span>Category: {rec.category}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toast.success(`Applied action: ${rec.title}! Saved ~${rec.potential_saving_kg}kg CO₂.`)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all"
                      >
                        Apply Action
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* SECTION 8: QUICK INSIGHTS */}
        <motion.div {...fadeUp(0.45)}
          className="activity-panel activity-insight-panel"
        >
          <div className="flex items-center justify-between border-b border-white/8 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400" /> Carbon Footprint Quick Insights
            </h2>
            <span className="text-xs text-gray-400 font-mono">Real-time Telemetry</span>
          </div>

          <div className="space-y-3.5">
            {quickInsights.map((insight, i) => {
              const Icon = insight.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.08, ease: 'easeOut' as const }}
                  className="p-4 rounded-xl border border-white/8 flex items-start gap-3.5"
                  style={{ background: `${insight.color}08` }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${insight.color}18`, border: `1px solid ${insight.color}30` }}>
                    <Icon size={16} style={{ color: insight.color }} />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-xs" style={{ color: insight.color }}>{insight.title}</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">{insight.text}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* ============================================================
          SECTION 9: FOOTER
          ============================================================ */}
      <footer className="pt-6 border-t border-white/8 text-center text-xs text-gray-500 space-y-1">
        <div className="flex items-center justify-center gap-2 text-gray-400 font-semibold">
          <Leaf size={14} className="text-emerald-400" /> EcoTrack Carbon Activity Intelligence Platform
        </div>
        <p className="text-[11px] text-gray-600">
          Node: {userCity}, {userState}, {userCountry} · Data synced in real-time · OpenWeather & WAQI Live Telemetry
        </p>
      </footer>

      {/* ============================================================
          LOG / EDIT ACTIVITY MODAL
          ============================================================ */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              className="activity-log-modal max-w-md w-full p-6 rounded-[20px] border border-white/15 shadow-2xl space-y-4"
              style={{ background: 'rgba(10,15,30,0.98)' }}
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-bold text-white text-base">
                  {editingActivity ? 'Edit Activity Entry' : 'Log New Carbon Activity'}
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateOrUpdateActivity} className="activity-log-form space-y-4 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Activity Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Electric Scooter Commute or Solar Offset"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1 font-semibold">Category</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as 'electricity' | 'transport' | 'waste')}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50"
                    >
                      <option value="electricity">Electricity</option>
                      <option value="transport">Transport</option>
                      <option value="waste">Waste</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1 font-semibold">CO2 Impact (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 12.5 or -10"
                      value={newCarbon}
                      onChange={(e) => setNewCarbon(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50 font-mono"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Description (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Additional context or measurements..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50 resize-none"
                  />
                </div>

                <div className="activity-log-actions pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="inline-flex h-9 items-center justify-center px-4 rounded-xl text-xs font-semibold leading-none text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="inline-flex h-9 items-center justify-center px-5 rounded-xl text-xs font-bold leading-none text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20">
                    {editingActivity ? 'Save Changes' : 'Log Activity'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================
          VIEW DETAIL MODAL
          ============================================================ */}
      <AnimatePresence>
        {viewingActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="max-w-md w-full p-6 rounded-[20px] border border-white/15 shadow-2xl space-y-4 text-xs"
              style={{ background: 'rgba(10,15,30,0.98)' }}
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <ActivityIcon size={16} className="text-emerald-400" /> Activity Telemetry Detail
                </h3>
                <button onClick={() => setViewingActivity(null)} className="p-1 rounded-lg text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/8 space-y-0.5">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Title</span>
                  <p className="text-base font-bold text-white">{viewingActivity.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/8">
                    <span className="text-gray-400 block text-[10px]">Category</span>
                    <span className="font-bold capitalize text-sm" style={{ color: getCategoryColor(viewingActivity.activity_type) }}>
                      {viewingActivity.activity_type}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/8">
                    <span className="text-gray-400 block text-[10px]">Carbon Impact</span>
                    <span className={`font-mono font-bold text-sm ${viewingActivity.carbon_kg < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {viewingActivity.carbon_kg > 0 ? '+' : ''}{viewingActivity.carbon_kg} kg CO₂
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/8">
                  <span className="text-gray-400 block text-[10px]">Description</span>
                  <p className="text-gray-200 text-xs mt-1 leading-relaxed">{viewingActivity.description || 'No description provided.'}</p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/8 flex justify-between font-mono text-[11px] text-gray-400">
                  <span>📅 Date: {viewingActivity.activity_date}</span>
                  <span>ID: #{viewingActivity.id}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => { setViewingActivity(null); handleOpenEdit(viewingActivity) }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all"
                >
                  Edit
                </button>
                <button onClick={() => setViewingActivity(null)} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}



