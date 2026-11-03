import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Leaf, Lock, LogIn, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import toast from 'react-hot-toast'
import GlobalEarthBackground from '@/components/earth/GlobalEarthBackground'
import { GlassButton, GlassCard, GlassInput, GlassMetricCard, PageTransition } from '@/components/ui/glass'

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const setUser = useAppStore((s) => s.setUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email!, theme_preference: 'dark' })
        toast.success('Welcome back!')
        navigate('/dashboard')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      if (email && password) {
        setUser({ id: 'demo-user', email, full_name: 'Demo User', theme_preference: 'dark' })
        toast.success('Demo login successful!')
        navigate('/dashboard')
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
      if (error) throw error
    } catch {
      toast.error('Google login requires Supabase configuration')
    }
  }

  return (
    <main className="auth-shell">
      <GlobalEarthBackground mode="auth" className="auth-earth" />
      <div className="auth-noise" />
      <PageTransition className="auth-stage">
        <motion.div className="auth-orbital-card auth-orbital-left" animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
          <GlassMetricCard icon={<Leaf size={16} />} label="Carbon saved" value="2.5M kg" detail="network impact" accent="#10B981" />
        </motion.div>
        <motion.div className="auth-orbital-card auth-orbital-right" animate={{ y: [0, 12, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
          <GlassMetricCard icon={<LogIn size={16} />} label="Intelligence" value="Live" detail="AQI + weather" accent="#06B6D4" />
        </motion.div>

        <GlassCard className="auth-card" as={motion.section} initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <Link to="/" className="auth-brand" aria-label="EcoTrack home">
            <span><Leaf size={19} /></span>
            EcoTrack
          </Link>

          <div className="auth-copy">
            <p className="auth-kicker">AI-powered environmental intelligence</p>
            <h1>Welcome Back</h1>
            <p>Sign in to monitor carbon, AQI, weather, and sustainability signals across your dashboard.</p>
          </div>

          <GlassButton type="button" variant="secondary" className="auth-social" onClick={handleGoogleLogin}>
            <GoogleIcon /> Continue with Google
          </GlassButton>

          <div className="auth-divider"><span>or sign in with email</span></div>

          <form onSubmit={handleLogin} className="auth-form">
            <GlassInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email address"
              icon={<Mail size={16} />}
              autoComplete="email"
              required
            />

            <GlassInput
              id="password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              icon={<Lock size={16} />}
              autoComplete="current-password"
              required
              right={(
                <button type="button" className="auth-icon-button" onClick={() => setShowPass(!showPass)} aria-label="Toggle password visibility">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            />

            <div className="auth-options">
              <label className="glass-checkbox">
                <input id="remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span /> Remember me
              </label>
              <a href="#">Forgot password?</a>
            </div>

            <GlassButton type="submit" disabled={loading} className="auth-submit">
              {loading ? <span className="auth-spinner" /> : <><LogIn size={18} /> Sign In</>}
            </GlassButton>
          </form>

          <p className="auth-switch">
            New to EcoTrack? <Link to="/register">Create account <ArrowRight size={12} /></Link>
          </p>
          <p className="auth-demo">Demo: use any email and password to enter dashboard.</p>
        </GlassCard>
      </PageTransition>
    </main>
  )
}
