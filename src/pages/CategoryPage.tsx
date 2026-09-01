import { useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ToolCard } from '../components/ToolCard'
import { StaggerGrid } from '../components/StaggerGrid'
import { CATEGORY_ICONS } from '../components/icons'
import { CATEGORIES, COMING_SOON, toolsByCategory } from '../lib/registry'
import { categoryColor } from '../lib/categoryColors'
import type { ToolCategory } from '../types/tool'

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>()
  const meta = CATEGORIES.find((c) => c.id === category)
  const tools = toolsByCategory(category ?? '')
  const comingSoon = COMING_SOON.filter((c) => c.category === category)

  if (!meta) {
    return <div className="mx-auto max-w-3xl px-6 py-14 text-center text-text-muted">Category not found.</div>
  }

  const Icon = CATEGORY_ICONS[meta.id as ToolCategory]
  const color = categoryColor(meta.id)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-3"
      >
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
        >
          <Icon />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">{meta.label}</h1>
          <p className="text-sm text-text-muted">{meta.description}</p>
        </div>
      </motion.header>

      <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </StaggerGrid>

      {comingSoon.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-faint">Coming later</h2>
          <div className="flex flex-wrap gap-2">
            {comingSoon.map((c) => (
              <span key={c.name} className="rounded-full border border-dashed border-border-strong px-3 py-1.5 text-xs text-text-faint">
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
