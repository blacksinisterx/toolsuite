import { motion, type HTMLMotionProps } from 'motion/react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-text hover:bg-accent-hover',
  secondary: 'bg-bg-elevated text-text border border-border hover:border-border-strong',
  ghost: 'text-text-muted hover:text-text hover:bg-bg-sunken',
  danger: 'bg-danger-soft text-danger hover:opacity-80',
}

export function Button({
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: HTMLMotionProps<'button'> & { variant?: Variant }) {
  return (
    <motion.button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      {...props}
    />
  )
}
