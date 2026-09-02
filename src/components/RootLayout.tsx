import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { Sidebar } from './Sidebar'
import { Logomark } from './Logomark'
import { SearchBar } from './SearchBar'
import { ThemeToggle } from './ThemeToggle'

export function RootLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  // React Router doesn't reset scroll position on navigation by default --
  // without this, opening a new tool from a scrolled-down homepage/sidebar
  // lands you mid-page instead of at the tool's own top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-bg-elevated/90 px-4 py-3 backdrop-blur sm:px-6">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open tool menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-bg-sunken lg:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <Link to="/" className="flex shrink-0 items-center gap-2 text-text">
          <Logomark />
          <span className="font-display text-sm font-semibold tracking-tight sm:text-base">ToolSuite</span>
        </Link>

        {!isHome && (
          <div className="hidden max-w-md flex-1 sm:block">
            <SearchBar />
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/suggest"
            className="hidden items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:border-accent hover:text-accent sm:flex"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Suggest a tool
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-border px-3 py-4 lg:block">
          <Sidebar />
        </aside>

        {drawerOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <div className="relative z-10 flex h-full w-72 flex-col bg-bg-elevated px-3 py-4 shadow-md">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close tool menu"
                className="mb-2 ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-bg-sunken"
              >
                ✕
              </button>
              <Sidebar onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <footer className="flex flex-col items-center gap-2 border-t border-border px-6 py-5 text-center text-xs text-text-faint">
        <p>Your files stay yours — processed temporarily and never kept in a permanent library.</p>
        <div className="flex gap-4">
          <Link to="/suggest" className="text-accent hover:underline">Missing a tool? Suggest one →</Link>
          <Link to="/roadmap" className="hover:text-text hover:underline">What's coming next</Link>
        </div>
      </footer>
    </div>
  )
}
