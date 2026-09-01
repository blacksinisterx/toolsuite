import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { SearchBar } from '../components/SearchBar'
import { ToolCard } from '../components/ToolCard'
import { StaggerGrid } from '../components/StaggerGrid'
import { CATEGORY_ICONS } from '../components/icons'
import { CATEGORIES, popularTools, toolsByCategory } from '../lib/registry'
import { categoryColor } from '../lib/categoryColors'

const EXAMPLES = ['Compress my PDF', 'Convert JPG to WebP', 'Merge these PDFs', 'Turn this CSV into JSON', 'Remove image metadata']

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-4 py-14 sm:px-6">
      <section className="relative flex flex-col items-center gap-6 overflow-hidden text-center">
        <AuroraBackground />

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl font-display text-4xl font-semibold tracking-tight text-text sm:text-5xl"
        >
          One Toolbox. <span style={{ color: 'var(--accent)' }}>Everything</span> You Need.
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl text-base text-text-muted sm:text-lg"
        >
          Convert, compress, edit, analyze and transform your files — privately, quickly, and without permanent
          storage.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-xl"
        >
          <SearchBar size="lg" />
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {EXAMPLES.map((ex) => (
              <span
                key={ex}
                className="rounded-full border border-border px-3 py-1 text-xs text-text-faint transition-colors hover:border-accent hover:text-accent"
              >
                {ex}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs text-text-faint"
        >
          <span className="flex items-center gap-1.5">
            <Dot color="var(--success)" /> No permanent file storage
          </span>
          <span className="flex items-center gap-1.5">
            <Dot color="var(--success)" /> No account required
          </span>
          <span className="flex items-center gap-1.5">
            <Dot color="var(--success)" /> Free, forever
          </span>
        </motion.div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-text">Popular tools</h2>
        <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {popularTools().map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </StaggerGrid>
      </section>

      {CATEGORIES.map((category) => {
        const tools = toolsByCategory(category.id)
        const Icon = CATEGORY_ICONS[category.id]
        const color = categoryColor(category.id)
        return (
          <section key={category.id}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
                >
                  <Icon />
                </span>
                <h2 className="font-display text-lg font-semibold text-text">{category.label}</h2>
              </div>
              <Link to={`/category/${category.id}`} className="text-sm text-accent hover:underline">
                View all
              </Link>
            </div>
            <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {tools.slice(0, 5).map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </StaggerGrid>
          </section>
        )
      })}

      <section className="rounded-2xl border border-border bg-bg-elevated p-6 text-center sm:p-8">
        <h2 className="font-display text-lg font-semibold text-text">Your files stay yours</h2>
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

/** Purely decorative, ambient background for the hero -- two large, soft,
 * blurred color fields that drift very slowly. Kept behind everything at
 * low opacity so it reads as atmosphere, not motion competing for
 * attention; automatically stilled by prefers-reduced-motion. */
function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -top-24 left-1/4 h-72 w-72 rounded-full opacity-30 blur-3xl"
        style={{ background: 'var(--accent)' }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -top-16 right-1/4 h-72 w-72 rounded-full opacity-25 blur-3xl"
        style={{ background: 'var(--accent2)' }}
        animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
