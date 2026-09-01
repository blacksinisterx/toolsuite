import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { ToolMeta } from '../types/tool'
import { CATEGORIES } from '../lib/registry'
import { CATEGORY_ICONS } from './icons'
import { categoryColor } from '../lib/categoryColors'
import { PrivacyBadge } from './PrivacyBadge'

export function ToolLayout({ tool, children, fullWidth }: { tool: ToolMeta; children: ReactNode; fullWidth?: boolean }) {
  const category = CATEGORIES.find((c) => c.id === tool.category)
  const Icon = CATEGORY_ICONS[tool.category]
  const color = categoryColor(tool.category)

  return (
    <div className={`mx-auto flex w-full flex-col gap-6 px-4 py-10 sm:px-6 ${fullWidth ? '' : 'max-w-3xl'}`}>
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-text-faint">
        <Link to="/" className="hover:text-text">Home</Link>
        <span>/</span>
        <Link to={`/category/${tool.category}`} className="hover:text-text" style={{ color }}>{category?.label}</Link>
        <span>/</span>
        <span className="text-text-muted">{tool.name}</span>
      </nav>

      <header className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
        >
          <Icon />
        </span>
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold text-text sm:text-3xl">{tool.name}</h1>
          <p className="text-sm text-text-muted sm:text-base">{tool.description}</p>
          <PrivacyBadge processing={tool.processing} />
        </div>
      </header>

      {fullWidth ? (
        <div className="flex flex-col gap-5">{children}</div>
      ) : (
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm sm:p-7">
          {children}
        </div>
      )}
    </div>
  )
}
