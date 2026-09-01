import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import type { ToolMeta } from '../types/tool'
import { CATEGORY_ICONS } from './icons'
import { categoryColor } from '../lib/categoryColors'

const MotionLink = motion.create(Link)

export function ToolCard({ tool }: { tool: ToolMeta }) {
  const Icon = CATEGORY_ICONS[tool.category]
  const color = categoryColor(tool.category)

  return (
    <MotionLink
      to={tool.path}
      variants={{
        hidden: { opacity: 0, y: 14, scale: 0.96 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }}
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 22 } }}
      whileTap={{ scale: 0.98 }}
      style={{ '--card-accent': color } as React.CSSProperties}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-border bg-bg-elevated p-4 shadow-sm transition-colors hover:border-[color:var(--card-accent)]"
    >
      <span
        className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
        style={{ background: color }}
      />
      <span
        className="flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
        style={{ background: 'color-mix(in srgb, var(--card-accent) 16%, transparent)', color }}
      >
        <Icon />
      </span>
      <span>
        <span className="block text-sm font-medium text-text">{tool.name}</span>
        <span className="mt-0.5 block text-xs leading-snug text-text-muted">{tool.description}</span>
      </span>
    </MotionLink>
  )
}
