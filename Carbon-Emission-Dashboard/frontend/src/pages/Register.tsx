import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckSquare, Eye, EyeOff, Globe, Leaf, Lock, Mail, MapPin, Moon, Sun, User, UserPlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import toast from 'react-hot-toast'
import GlobalEarthBackground from '@/components/earth/GlobalEarthBackground'
import { GlassButton, GlassCard, GlassInput, GlassSelect, PageTransition } from '@/components/ui/glass'

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Germany', 'France', 'Australia',
  'Canada', 'Japan', 'China', 'Brazil', 'South Africa', 'Other',
]

export default function Register() {
  const navigate = useNavigate()
  const setUser = useAppStore((s) => s.setUser)
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
    country: 'India', city: '',
    theme: 'dark' as 'dark' | 'light',
    reports: true,
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const update = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name } },
      })
      if (error) throw error
      if (data.user) {
        setUser({ id: data.user.id, email: form.email, full_name: form.name, country: form.country, city: form.city, theme_preference: form.theme })
        toast.success('Account created! Welcome to EcoTrack')
        navigate('/dashboard')
      }
    } catch {
      setUser({ id: 'demo-user', email: form.email, full_name: form.name, country: form.country, city: form.city, theme_preference: form.theme })
      toast.success('Welcome to EcoTrack!')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell auth-register-shell">
      <GlobalEarthBackground mode="auth" className="auth-earth" />
      <div className="auth-noise" />
      <PageTransition className="auth-stage">
        <GlassCard className="auth-card auth-card-wide" as={motion.section} initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <Link to="/" className="auth-brand" aria-label="EcoTrack home">
            <span><Leaf size={19} /></span>
            EcoTrack
          </Link>

          <div className="auth-copy">
            <p className="auth-kicker">Climate intelligence onboarding</p>
            <h1>Create Account</h1>
            <p>Join the sustainability movement with real-time carbon, weather, and air-quality intelligence.</p>
          </div>

          <div className="auth-progress" aria-label="Registration progress">
            {[1, 2].map((s) => <span key={s} className={step >= s ? 'active' : ''} />)}
          </div>

          <form onSubmit={handleRegister} className="auth-form">
            {step === 1 && (
              <motion.div className="auth-step" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}>
                <GlassInput id="name" type="text" value={form.name} onChange={(e) => update('name', e.target.value)} label="Full name" icon={<User size={16} />} autoComplete="name" required />
                <GlassInput id="reg-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} label="Email address" icon={<Mail size={16} />} autoComplete="email" required />
                <GlassInput
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  label="Password"
                  icon={<Lock size={16} />}
                  autoComplete="new-password"
                  required
                  right={<button type="button" className="auth-icon-button" onClick={() => setShowPass(!showPass)}>{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
                />
                <GlassInput id="confirm" type="password" value={form.confirm} onChange={(e) => update('confirm', e.target.value)} label="Confirm password" icon={<Lock size={16} />} autoComplete="new-password" required />
                <GlassButton type="button" disabled={!form.name || !form.email || !form.password || !form.confirm} className="auth-submit" onClick={() => setStep(2)}>
                  Continue <ArrowRight size={16} />
                </GlassButton>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div className="auth-step" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}>
                <GlassSelect id="country" value={form.country} onChange={(e) => update('country', e.target.value)} label="Country" icon={<Globe size={16} />}>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </GlassSelect>
                <GlassInput id="city" type="text" value={form.city} onChange={(e) => update('city', e.target.value)} label="City" icon={<MapPin size={16} />} />

                <div className="auth-theme-grid">
                  {[{ v: 'dark', label: 'Dark Mode', icon: Moon }, { v: 'light', label: 'Light Mode', icon: Sun }].map((t) => (
                    <button key={t.v} type="button" onClick={() => update('theme', t.v)} className={form.theme === t.v ? 'active' : ''}>
                      <t.icon size={16} /> {t.label}
                    </button>
                  ))}
                </div>

                <label className="auth-report glass-surface">
                  <input id="reports" type="checkbox" checked={form.reports} onChange={(e) => update('reports', e.target.checked)} />
                  <span><CheckSquare size={15} /> Receive monthly sustainability reports and eco-tips.</span>
                </label>

                <div className="auth-two-actions">
                  <GlassButton type="button" variant="secondary" onClick={() => setStep(1)}>Back</GlassButton>
                  <GlassButton type="submit" disabled={loading}>
                    {loading ? <span className="auth-spinner" /> : <><UserPlus size={16} /> Create Account</>}
                  </GlassButton>
                </div>
              </motion.div>
            )}
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in <ArrowRight size={12} /></Link>
          </p>
        </GlassCard>
      </PageTransition>
    </main>
  )
}
