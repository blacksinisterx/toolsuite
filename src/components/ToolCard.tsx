import { Link } from 'react-router-dom'
import type { ToolMeta } from '../types/tool'
import { CATEGORY_ICONS } from './icons'

export function ToolCard({ tool }: { tool: ToolMeta }) {
  const Icon = CATEGORY_ICONS[tool.category]
  return (
    <Link
      to={tool.path}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-bg-elevated p-4 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
        <Icon />
      </span>
      <span>
        <span className="block text-sm font-medium text-text group-hover:text-accent">{tool.name}</span>
        <span className="mt-0.5 block text-xs leading-snug text-text-muted">{tool.description}</span>
      </span>
    </Link>
  )
}
