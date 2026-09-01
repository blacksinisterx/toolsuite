import { NavLink } from 'react-router-dom'
import { CATEGORIES, toolsByCategory } from '../lib/registry'
import { CATEGORY_ICONS } from './icons'

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Tool categories" className="flex flex-col gap-5 overflow-y-auto py-2">
      {CATEGORIES.map((category) => {
        const Icon = CATEGORY_ICONS[category.id]
        const tools = toolsByCategory(category.id)
        return (
          <div key={category.id}>
            <NavLink
              to={`/category/${category.id}`}
              onClick={onNavigate}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                  isActive ? 'text-accent' : 'text-text-faint hover:text-text'
                }`
              }
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
                      `block rounded-lg px-2.5 py-1.5 pl-9 text-sm ${
                        isActive ? 'bg-accent-soft font-medium text-accent' : 'text-text-muted hover:bg-bg-sunken hover:text-text'
                      }`
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
