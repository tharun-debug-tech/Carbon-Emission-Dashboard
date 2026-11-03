// src/pages/dashboard/CarbonCalculator.tsx
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { calculateCarbonLocally, calculateCarbonWithDataset, generateRecommendations } from '@/services/api'
import { useAppStore } from '@/store/useAppStore'
import { getSustainabilityGrade } from '@/lib/utils'
import {
  Zap, Car, Trash2, Calculator, TrendingDown,
  Sparkles, ShieldCheck, RefreshCw
} from 'lucide-react'
import {
  Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import toast from 'react-hot-toast'

ChartJS.register(ArcElement, ChartTooltip, ChartLegend)

export default function CarbonCalculator() {
  const { userCountry } = useAppStore()
  const [inputs, setInputs] = useState({
    electricity_kwh: 320,
    car_km: 150,
    bus_km: 40,
    flight_km: 0,
    waste_kg: 25,
    fuel_type: 'petrol',
  })

  const localResults = useMemo(() => calculateCarbonLocally(inputs), [inputs])
  const carbonQuery = useQuery({
    queryKey: ['carbon-calculation', inputs, userCountry],
    queryFn: () => calculateCarbonWithDataset({ ...inputs, country: userCountry }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
  const results = carbonQuery.data || localResults
  const recommendations = useMemo(() => generateRecommendations(results), [results])
  const { grade, color, label } = getSustainabilityGrade(results.score)

  const handleInputChange = (key: string, value: number | string) => {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  const handleReset = () => {
    setInputs({
      electricity_kwh: 0,
      car_km: 0,
      bus_km: 0,
      flight_km: 0,
      waste_kg: 0,
      fuel_type: 'petrol',
    })
    toast.success('Inputs reset')
  }

  const chartData = {
    labels: ['Electricity', 'Transportation', 'Waste'],
    datasets: [
      {
        data: [results.electricity_kg, results.transport_kg, results.waste_kg],
        backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6'],
        borderColor: '#111827',
        borderWidth: 2,
      },
    ],
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Calculator className="text-emerald-400" /> Carbon Footprint Calculator
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Estimate your monthly greenhouse gas emissions using EcoTrack dataset-backed factors.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="btn-secondary py-2 px-4 text-sm flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw size={14} /> Reset Inputs
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Input Forms */}
        <div className="lg:col-span-7 space-y-6">
          {/* Electricity Card */}
          <div className="card space-y-4">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Electricity Consumption</h3>
                <p className="text-xs text-gray-400">Grid factor: {(results.factors?.electricity_kwh ?? 0.82).toFixed(3)} kg CO2e / kWh</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Monthly Usage (kWh)</span>
                <span className="font-mono text-amber-400 font-bold">{inputs.electricity_kwh} kWh</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={inputs.electricity_kwh}
                onChange={(e) => handleInputChange('electricity_kwh', parseFloat(e.target.value))}
                className="w-full accent-amber-500 bg-white/5 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Transportation Card */}
          <div className="card space-y-4">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                <Car size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Transportation Logs</h3>
                <p className="text-xs text-gray-400">Vehicle & transit distance per month</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Fuel Type</label>
                <select
                  value={inputs.fuel_type}
                  onChange={(e) => handleInputChange('fuel_type', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="petrol">Petrol (0.21 kg/km)</option>
                  <option value="diesel">Diesel (0.17 kg/km)</option>
                  <option value="hybrid">Hybrid (0.12 kg/km)</option>
                  <option value="electric">Electric (0.05 kg/km)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Car Travel (km)</label>
                <input
                  type="number"
                  value={inputs.car_km}
                  onChange={(e) => handleInputChange('car_km', parseFloat(e.target.value) || 0)}
                  className="input-field text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Bus / Public Transit (km)</label>
                <input
                  type="number"
                  value={inputs.bus_km}
                  onChange={(e) => handleInputChange('bus_km', parseFloat(e.target.value) || 0)}
                  className="input-field text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Air Travel (km)</label>
                <input
                  type="number"
                  value={inputs.flight_km}
                  onChange={(e) => handleInputChange('flight_km', parseFloat(e.target.value) || 0)}
                  className="input-field text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Waste Card */}
          <div className="card space-y-4">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Waste Generation</h3>
                <p className="text-xs text-gray-400">Landfill & general waste estimate</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Monthly Waste (kg)</span>
                <span className="font-mono text-purple-400 font-bold">{inputs.waste_kg} kg</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={inputs.waste_kg}
                onChange={(e) => handleInputChange('waste_kg', parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-white/5 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Calculations & Visualizations */}
        <div className="lg:col-span-5 space-y-6">
          {/* Summary Card with Gauge */}
          <motion.div
            className="card relative overflow-hidden text-center p-6 space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                 style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
              <ShieldCheck size={14} /> Sustainability Grade {grade} ({label})
            </div>

            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="10"
                />
                <circle
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke={color}
                  strokeWidth="10"
                  strokeDasharray={`${(results.score / 100) * 251} 251`}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold font-display text-white">{results.score}</span>
                <span className="text-xs text-gray-400">Score / 100</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">Total Monthly Footprint</p>
                <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{results.total_kg} <span className="text-xs text-gray-400">kg CO₂e</span></p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Daily Average</p>
                <p className="text-2xl font-bold font-mono text-blue-400 mt-1">{(results.total_kg / 30).toFixed(1)} <span className="text-xs text-gray-400">kg/day</span></p>
              </div>
            </div>
          </motion.div>

          {/* Breakdown Pie Chart */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-white text-sm">Emissions Breakdown</h3>
            <div className="w-48 h-48 mx-auto">
              <Doughnut
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: { legend: { display: false } },
                  cutout: '70%',
                }}
              />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Electricity</span>
                <span className="font-mono">{results.electricity_kg} kg ({results.total_kg > 0 ? Math.round((results.electricity_kg / results.total_kg) * 100) : 0}%)</span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Transportation</span>
                <span className="font-mono">{results.transport_kg} kg ({results.total_kg > 0 ? Math.round((results.transport_kg / results.total_kg) * 100) : 0}%)</span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Waste</span>
                <span className="font-mono">{results.waste_kg} kg ({results.total_kg > 0 ? Math.round((results.waste_kg / results.total_kg) * 100) : 0}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <Sparkles className="text-amber-400" /> AI Recommendations
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <motion.div
              key={rec.id}
              className="card p-5 space-y-3 hover:border-emerald-500/30 transition-all"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl">{rec.icon}</span>
                <span className={`badge ${rec.impact === 'high' ? 'badge-red' : 'badge-green'}`}>
                  {rec.impact.toUpperCase()} IMPACT
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">{rec.title}</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{rec.description}</p>
              </div>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-emerald-400 font-mono">
                <span className="flex items-center gap-1"><TrendingDown size={12} /> Potential Saving</span>
                <span>-{rec.potential_saving_kg} kg CO₂/mo</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}


