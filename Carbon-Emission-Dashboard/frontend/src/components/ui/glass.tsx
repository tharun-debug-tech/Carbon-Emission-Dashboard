import { motion } from 'framer-motion'
import { createElement } from 'react'
import type { ComponentPropsWithoutRef, ElementType, ReactNode, CSSProperties } from 'react'
import type { HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

type GlassSurfaceProps = {
  as?: ElementType
  className?: string
  children?: ReactNode
  style?: CSSProperties
  [key: string]: unknown
}

export function GlassCard({ as: Component = 'div', className, children, ...props }: GlassSurfaceProps) {
  return createElement(Component, { className: cn('glass-surface glass-card-premium', className), ...props }, children)
}

export function GlassWidget({ as: Component = 'div', className, children, ...props }: GlassSurfaceProps) {
  return createElement(Component, { className: cn('glass-surface glass-widget', className), ...props }, children)
}

export function GlassButton({ className, children, variant = 'primary', ...props }: HTMLMotionProps<'button'> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  return (
    <motion.button
      className={cn('glass-button-system', `glass-button-${variant}`, className)}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export function GlassInput({ className, icon, right, label, value, ...props }: ComponentPropsWithoutRef<'input'> & { icon?: ReactNode; right?: ReactNode; label: string }) {
  const filled = typeof value === 'string' && value.length > 0
  return (
    <div className={cn('glass-field', filled && 'is-filled', className)}>
      {icon && <span className="glass-field-icon">{icon}</span>}
      <input value={value} placeholder=" " {...props} />
      <label>{label}</label>
      {right && <span className="glass-field-right">{right}</span>}
      <span className="glass-field-focus" />
    </div>
  )
}

export function GlassSelect({ className, icon, label, value, children, ...props }: ComponentPropsWithoutRef<'select'> & { icon?: ReactNode; label: string }) {
  const filled = typeof value === 'string' && value.length > 0
  return (
    <div className={cn('glass-field glass-select-field', filled && 'is-filled', className)}>
      {icon && <span className="glass-field-icon">{icon}</span>}
      <select value={value} {...props}>{children}</select>
      <label>{label}</label>
      <span className="glass-field-focus" />
    </div>
  )
}

export function GlassMetricCard({ icon, label, value, detail, accent = '#10B981' }: { icon: ReactNode; label: string; value: ReactNode; detail?: string; accent?: string }) {
  return (
    <GlassWidget className="glass-metric-card" style={{ '--glass-accent': accent } as CSSProperties}>
      <span className="glass-metric-icon">{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {detail && <small>{detail}</small>}
      </div>
    </GlassWidget>
  )
}

export function SectionContainer({ className, children, ...props }: ComponentPropsWithoutRef<'section'>) {
  return <section className={cn('section-container', className)} {...props}>{children}</section>
}

export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

