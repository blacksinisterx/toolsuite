import { SearchBar } from '../components/SearchBar'
import { ToolCard } from '../components/ToolCard'
import { CATEGORY_ICONS } from '../components/icons'
import { CATEGORIES, popularTools, toolsByCategory } from '../lib/registry'
import { Link } from 'react-router-dom'

const EXAMPLES = ['Compress my PDF', 'Convert JPG to WebP', 'Merge these PDFs', 'Turn this CSV into JSON', 'Remove image metadata']

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-4 py-14 sm:px-6">
      <section className="flex flex-col items-center gap-6 text-center">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          One Toolbox. <span className="text-accent">Everything</span> You Need.
        </h1>
        <p className="max-w-xl text-base text-text-muted sm:text-lg">
          Convert, compress, edit, analyze and transform your files — privately, quickly, and without permanent
          storage.
        </p>

        <div className="w-full max-w-xl">
          <SearchBar size="lg" />
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {EXAMPLES.map((ex) => (
              <span key={ex} className="rounded-full border border-border px-3 py-1 text-xs text-text-faint">
                {ex}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs text-text-faint">
          <span className="flex items-center gap-1.5">
            <Dot color="var(--success)" /> No permanent file storage
          </span>
          <span className="flex items-center gap-1.5">
            <Dot color="var(--success)" /> No account required
          </span>
          <span className="flex items-center gap-1.5">
            <Dot color="var(--success)" /> Free, forever
          </span>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-text">Popular tools</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {popularTools().map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {CATEGORIES.map((category) => {
        const tools = toolsByCategory(category.id)
        const Icon = CATEGORY_ICONS[category.id]
        return (
          <section key={category.id}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Icon />
                </span>
                <h2 className="text-lg font-semibold text-text">{category.label}</h2>
              </div>
              <Link to={`/category/${category.id}`} className="text-sm text-accent hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {tools.slice(0, 5).map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )
      })}

      <section className="rounded-2xl border border-border bg-bg-elevated p-6 text-center sm:p-8">
        <h2 className="text-lg font-semibold text-text">Your files stay yours</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-text-muted">
          Every tool above runs entirely in your browser — nothing is uploaded anywhere. Close the tab and it's gone,
          the way it should be.
        </p>
      </section>
    </div>
  )
}

function Dot({ color }: { color: string }) {
  return <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
}
