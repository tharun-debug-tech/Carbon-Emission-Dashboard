// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number, decimals = 1): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(decimals)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(decimals)}K`
  return num.toFixed(decimals)
}

export function formatCarbonKg(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} tonnes`
  return `${kg.toFixed(2)} kg`
}

export function getAQILabel(aqi: number): { label: string; color: string; bgColor: string } {
  if (aqi <= 50) return { label: 'Good', color: '#10b981', bgColor: 'rgba(16,185,129,0.15)' }
  if (aqi <= 100) return { label: 'Moderate', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.15)' }
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: '#f97316', bgColor: 'rgba(249,115,22,0.15)' }
  if (aqi <= 200) return { label: 'Unhealthy', color: '#ef4444', bgColor: 'rgba(239,68,68,0.15)' }
  if (aqi <= 300) return { label: 'Very Unhealthy', color: '#7c3aed', bgColor: 'rgba(124,58,237,0.15)' }
  return { label: 'Hazardous', color: '#7f1d1d', bgColor: 'rgba(127,29,29,0.15)' }
}

export function getSustainabilityGrade(score: number): { grade: string; color: string; label: string } {
  if (score >= 80) return { grade: 'A', color: '#10b981', label: 'Excellent' }
  if (score >= 65) return { grade: 'B', color: '#34d399', label: 'Good' }
  if (score >= 50) return { grade: 'C', color: '#f59e0b', label: 'Average' }
  if (score >= 35) return { grade: 'D', color: '#f97316', label: 'Poor' }
  return { grade: 'F', color: '#ef4444', label: 'Critical' }
}

export function formatDate(date: string | Date, format: 'short' | 'long' | 'month' = 'short'): string {
  const d = new Date(date)
  if (format === 'long') return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  if (format === 'month') return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function getWeatherIcon(code: number): string {
  if (code >= 200 && code < 300) return '⛈️'
  if (code >= 300 && code < 400) return '🌧️'
  if (code >= 500 && code < 600) return '🌧️'
  if (code >= 600 && code < 700) return '❄️'
  if (code >= 700 && code < 800) return '🌫️'
  if (code === 800) return '☀️'
  if (code === 801 || code === 802) return '⛅'
  return '☁️'
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function generateChartColors(count: number): string[] {
  const palette = [
    '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b',
    '#ef4444', '#14b8a6', '#f97316', '#6366f1',
    '#ec4899', '#84cc16',
  ]
  return Array.from({ length: count }, (_, i) => palette[i % palette.length])
}
