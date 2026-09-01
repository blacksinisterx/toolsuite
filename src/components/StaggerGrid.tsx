import { motion } from 'motion/react'
import type { ReactNode } from 'react'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

/** Wraps a grid of ToolCards (or anything using the shared hidden/visible
 * variants) so they reveal with a gentle stagger on mount -- once, not on
 * every scroll, and only as far as prefers-reduced-motion allows (Motion
 * respects that automatically for transform/opacity). */
export function StaggerGrid({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={container} className={className}>
      {children}
    </motion.div>
  )
}
