import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { SearchBar } from '../components/SearchBar'
import { ToolCard } from '../components/ToolCard'
import { StaggerGrid } from '../components/StaggerGrid'
import { CATEGORY_ICONS } from '../components/icons'
import { CATEGORIES, TOOLS, popularTools, toolsByCategory } from '../lib/registry'
import { categoryColor } from '../lib/categoryColors'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

// A handful of real tools, one per showcased category, for the hero's
// preview cascade -- actual product content, not decoration.
const SHOWCASE_IDS = ['merge-pdf', 'video-to-gif', 'latex-workspace', 'image-to-text']

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-4 py-14 sm:px-6">
      <section className="relative grid grid-cols-1 items-center gap-10 overflow-hidden lg:grid-cols-[1.2fr_1fr]">
        <DotGridBackground />

        <div className="flex flex-col gap-5">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl font-semibold tracking-tight text-text sm:text-5xl"
          >
            Convert anything.
            <br />
            Upload{' '}
            <span className="text-text-faint line-through decoration-2">everything</span>{' '}
            <span style={{ color: 'var(--accent)' }}>nothing.</span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md text-base text-text-muted sm:text-lg"
          >
            88 real tools for PDFs, images, video, audio, code and more — every one of them runs
            in your browser. Nothing you drop in ever leaves it.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md"
          >
            <SearchBar size="lg" />
          </motion.div>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="font-mono text-xs text-text-faint"
          >
            no uploads &middot; no account &middot; free forever
          </motion.p>
        </div>

        <ShowcaseCascade />
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

/** Real tools, not decoration -- a loose vertical cascade with a slight
 * alternating offset instead of the two-blob-gradient (flagged as generic)
 * or a perfectly centered stack (the other cliché this hero was trying to
 * avoid). Each card links straight to the real tool. Desktop-only: on
 * narrow screens this column is dropped rather than squeezed, so mobile
 * gets the full-width text and search instead of a cramped preview. */
function ShowcaseCascade() {
  const tools = SHOWCASE_IDS.map((id) => TOOLS.find((t) => t.id === id)!).filter(Boolean)
  return (
    <div className="relative hidden flex-col gap-3 lg:flex">
      {tools.map((tool, i) => {
        const Icon = CATEGORY_ICONS[tool.category]
        const color = categoryColor(tool.category)
        return (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginLeft: i % 2 === 1 ? '2.5rem' : 0 }}
          >
            <Link
              to={tool.path}
              className="flex items-center gap-3 rounded-xl border border-border bg-bg-elevated px-4 py-3 shadow-sm transition-colors hover:border-[color:var(--tool-accent)]"
              style={{ '--tool-accent': color } as React.CSSProperties}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
              >
                <Icon />
              </span>
              <span className="text-sm font-medium text-text">{tool.name}</span>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}

/** Third pass on the hero background. The soft blurred gradient blob (two
 * versions of it) kept reading as generic "AI SaaS landing page" regardless
 * of color tuning -- that's the pattern itself, not a contrast problem.
 * Dropped it for a fine engineering-grid dot pattern instead: a real
 * texture used by actual developer-tool sites (Vercel, Stripe docs, Linear)
 * for exactly this reason, faded out toward the edges with a mask so it
 * reads as texture, not a decoration competing with the headline. No
 * color, no blur, no gradient -- the accent color still only shows up in
 * the "Everything" text and the tool cards below. */
function DotGridBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10"
      aria-hidden="true"
      style={{
        backgroundImage: 'radial-gradient(var(--border-strong) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(ellipse 70% 60% at 50% 20%, black 40%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 20%, black 40%, transparent 100%)',
      }}
    />
  )
}
