import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { searchTools } from '../lib/search'
import { CATEGORY_ICONS } from './icons'
import { categoryColor } from '../lib/categoryColors'

export function SearchBar({ size = 'md', placeholder }: { size?: 'md' | 'lg'; placeholder?: string }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => searchTools(query), [query])

  function go(path: string) {
    navigate(path)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={`flex items-center gap-2.5 rounded-xl border border-border-strong bg-bg-elevated px-4 shadow-md focus-within:border-accent ${
          size === 'lg' ? 'py-3.5' : 'py-2.5'
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-text-faint" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="m21 21-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          placeholder={placeholder ?? 'Search a tool or describe what you want to do...'}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActive(0)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (!results.length) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((a) => Math.min(a + 1, results.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => Math.max(a - 1, 0))
            } else if (e.key === 'Enter') {
              e.preventDefault()
              go(results[active].path)
            }
          }}
          className={`w-full bg-transparent text-text outline-none placeholder:text-text-muted ${size === 'lg' ? 'text-base' : 'text-sm'}`}
          aria-label="Search tools"
          aria-expanded={open && results.length > 0}
          role="combobox"
          aria-controls="search-results"
        />
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.ul
            id="search-results"
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-20 mt-2 w-full origin-top overflow-hidden rounded-xl border border-border bg-bg-elevated shadow-md"
          >
            {results.map((tool, i) => {
              const Icon = CATEGORY_ICONS[tool.category]
              const color = categoryColor(tool.category)
              return (
                <li key={tool.id} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseDown={() => go(tool.path)}
                    onMouseEnter={() => setActive(i)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-text transition-colors"
                    style={i === active ? { background: `color-mix(in srgb, ${color} 12%, transparent)`, color } : undefined}
                  >
                    <Icon />
                    <span>
                      <span className="block font-medium">{tool.name}</span>
                      <span className="block text-xs text-text-faint">{tool.description}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
