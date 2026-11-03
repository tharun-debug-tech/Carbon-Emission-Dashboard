// src/pages/dashboard/Analytics.tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3 } from 'lucide-react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, RadialLinearScale, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Line, Bar, Radar, Pie } from 'react-chartjs-2'
import { fetchDatasetAnalytics } from '@/services/api'
import { useAppStore } from '@/store/useAppStore'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  RadialLinearScale, ArcElement, Title, Tooltip, Legend, Filler
)

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'yearly'>('monthly')

  const { userCountry } = useAppStore()
  const { data: datasetAnalytics } = useQuery({
    queryKey: ['dataset-analytics', userCountry],
    queryFn: () => fetchDatasetAnalytics(userCountry),
    staleTime: 30 * 60 * 1000,
    retry: 1,
  })

  const datasetTrend = (datasetAnalytics?.trend || []).slice(
    timeRange === 'weekly' ? -7 : timeRange === 'monthly' ? -12 : -6
  )
  const hasDatasetTrend = datasetTrend.length > 0

  // Dataset-backed values with local fallback while the backend is offline.
  const labels: string[] = hasDatasetTrend
    ? datasetTrend.map((row: any) => row.Date)
    : timeRange === 'weekly'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : timeRange === 'monthly'
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : ['2020', '2021', '2022', '2023', '2024', '2025']

  const electricityData: number[] = hasDatasetTrend
    ? datasetTrend.map((row: any) => Number(row.Electricity || 0))
    : timeRange === 'weekly'
    ? [12, 14, 11, 15, 18, 22, 19]
    : timeRange === 'monthly'
    ? [280, 260, 240, 310, 340, 380, 350, 320, 290, 270, 250, 230]
    : [3600, 3400, 3200, 2900, 2700, 2500]

  const transportData: number[] = hasDatasetTrend
    ? datasetTrend.map((row: any) => Number(row.Transport || 0))
    : timeRange === 'weekly'
    ? [8, 9, 8, 10, 12, 5, 2]
    : timeRange === 'monthly'
    ? [120, 110, 95, 130, 140, 150, 110, 100, 105, 90, 85, 80]
    : [1800, 1600, 1400, 1250, 1100, 950]

  const wasteData: number[] = hasDatasetTrend
    ? datasetTrend.map((row: any) => Number(row.Waste || 0))
    : timeRange === 'weekly'
    ? [2, 1.5, 2, 2.5, 3, 4, 3]
    : timeRange === 'monthly'
    ? [30, 28, 25, 32, 35, 38, 30, 26, 24, 22, 20, 18]
    : [400, 380, 350, 300, 260, 220]
  // Line Chart (Carbon Trends)
  const lineChartData = {
    labels,
    datasets: [
      {
        label: 'Total Emissions (kg CO₂e)',
        data: electricityData.map((e, idx) => e + transportData[idx] + wasteData[idx]),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  // Area Chart (Electricity vs Transport)
  const areaChartData = {
    labels,
    datasets: [
      {
        label: 'Electricity',
        data: electricityData,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Transport',
        data: transportData,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  // Bar Chart (Category Comparison)
  const barChartData = {
    labels,
    datasets: [
      { label: 'Electricity', data: electricityData, backgroundColor: '#f59e0b' },
      { label: 'Transport', data: transportData, backgroundColor: '#3b82f6' },
      { label: 'Waste', data: wasteData, backgroundColor: '#8b5cf6' },
    ],
  }

  // Radar Chart
  const radarChartData = {
    labels: ['Electricity', 'Vehicle Commute', 'Air Travel', 'Landfill Waste', 'Recycling', 'Water Usage'],
    datasets: [
      {
        label: 'Current Period',
        data: [75, 60, 20, 45, 80, 55],
        backgroundColor: 'rgba(16,185,129,0.2)',
        borderColor: '#10b981',
        pointBackgroundColor: '#10b981',
      },
      {
        label: 'Previous Period',
        data: [85, 75, 40, 60, 65, 70],
        backgroundColor: 'rgba(245,158,11,0.2)',
        borderColor: '#f59e0b',
        pointBackgroundColor: '#f59e0b',
      },
    ],
  }

  // Pie Chart
  const pieChartData = {
    labels: ['Electricity', 'Transportation', 'Waste'],
    datasets: [
      {
        data: [45, 38, 17],
        backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6'],
        borderColor: '#111827',
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#9ca3af', font: { size: 11 } } },
    },
    scales: {
      x: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-emerald-400" /> Sustainability Analytics
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Data analytics dashboard powered by the backend AQI and Energy datasets.
          </p>
        </div>

        {/* Time Selector */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          {(['weekly', 'monthly', 'yearly'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                timeRange === t ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-white text-sm">Dataset Energy & Carbon Intensity Trend</h3>
          <div className="h-64">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Area Chart */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-white text-sm">Electricity Demand vs Carbon Intensity</h3>
          <div className="h-64">
            <Line data={areaChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Grid Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 card space-y-4">
          <h3 className="font-semibold text-white text-sm">Energy Dataset Comparison</h3>
          <div className="h-64">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-white text-sm">Emissions Share</h3>
          <div className="h-64 flex items-center justify-center">
            <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Grid Charts Row 3 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-white text-sm">Sustainability Performance (Radar Chart)</h3>
          <div className="h-64 flex items-center justify-center">
            <Radar
              data={radarChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { r: { ticks: { display: false }, grid: { color: 'rgba(255,255,255,0.1)' } } },
              }}
            />
          </div>
        </div>

        {/* Heatmap Matrix Mockup */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-white text-sm">Carbon Emission Heatmap Calendar</h3>
          <p className="text-xs text-gray-400">Daily intensity tracking over the last 4 weeks</p>

          <div className="grid grid-cols-7 gap-2 pt-4">
            {Array.from({ length: 28 }).map((_, idx) => {
              const intensity = (idx * 37) % 100
              const bg =
                intensity > 70
                  ? 'bg-rose-500/80 text-white'
                  : intensity > 40
                  ? 'bg-amber-500/60 text-white'
                  : 'bg-emerald-500/40 text-emerald-200'

              return (
                <div
                  key={idx}
                  className={`h-10 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${bg}`}
                  title={`Day ${idx + 1}: ${intensity} kg CO₂`}
                >
                  {idx + 1}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}


