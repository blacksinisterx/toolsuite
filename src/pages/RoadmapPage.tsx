import { Link } from 'react-router-dom'
import { CATEGORIES, COMING_SOON } from '../lib/registry'
import { CATEGORY_ICONS } from '../components/icons'
import { categoryColor } from '../lib/categoryColors'

export default function RoadmapPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-text sm:text-3xl">Roadmap</h1>
        <p className="mt-2 text-sm text-text-muted sm:text-base">
          Everything known to be missing, in one place, with the real reason it isn't built yet -- not just
          silently absent. Want something that isn't here?{' '}
          <Link to="/suggest" className="text-accent hover:underline">Suggest it</Link>.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {COMING_SOON.map((c) => {
          const category = CATEGORIES.find((cat) => cat.id === c.category)
          const Icon = CATEGORY_ICONS[c.category]
          const color = categoryColor(c.category)
          return (
            <div key={c.name} className="flex items-start gap-3 rounded-xl border border-border bg-bg-elevated p-4">
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
              >
                <Icon />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-text">{c.name}</p>
                  <Link to={`/category/${c.category}`} className="text-xs text-text-faint hover:text-accent">{category?.label}</Link>
                </div>
                {c.reason && <p className="mt-1 text-sm text-text-muted">{c.reason}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
