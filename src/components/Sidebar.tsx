import { NavLink } from 'react-router-dom'
import { CATEGORIES, toolsByCategory } from '../lib/registry'
import { CATEGORY_ICONS } from './icons'
import { categoryColor } from '../lib/categoryColors'

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Tool categories" className="flex flex-col gap-5 overflow-y-auto py-2">
      {CATEGORIES.map((category) => {
        const Icon = CATEGORY_ICONS[category.id]
        const tools = toolsByCategory(category.id)
        const color = categoryColor(category.id)
        return (
          <div key={category.id}>
            <NavLink
              to={`/category/${category.id}`}
              onClick={onNavigate}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  isActive ? '' : 'text-text-faint hover:text-text'
                }`
              }
              style={({ isActive }) => (isActive ? { color } : undefined)}
            >
              <Icon />
              {category.label}
            </NavLink>
            <ul className="flex flex-col">
              {tools.map((tool) => (
                <li key={tool.id}>
                  <NavLink
                    to={tool.path}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `relative block rounded-lg px-2.5 py-1.5 pl-9 text-sm transition-colors ${
                        isActive ? 'font-medium' : 'text-text-muted hover:bg-bg-sunken hover:text-text'
                      }`
                    }
                    style={({ isActive }) =>
                      isActive ? { background: `color-mix(in srgb, ${color} 14%, transparent)`, color } : undefined
                    }
                  >
                    {tool.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}
