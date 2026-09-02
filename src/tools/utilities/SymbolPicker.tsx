import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { inputCls } from '../../components/formStyles'
import { SYMBOL_GROUPS } from '../../lib/symbols'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'symbol-picker')!

export default function SymbolPicker() {
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return SYMBOL_GROUPS
    return SYMBOL_GROUPS.map((g) => ({ ...g, chars: g.chars.filter((c) => c.name.toLowerCase().includes(q) || c.ch === search) }))
      .filter((g) => g.chars.length > 0)
  }, [search])

  async function copy(ch: string) {
    try {
      await navigator.clipboard.writeText(ch)
    } catch {
      // Clipboard API can be unavailable (insecure context, permission
      // denied) -- fall back to the older execCommand path rather than
      // failing silently with no feedback at all.
      const ta = document.createElement('textarea')
      ta.value = ch
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(ch)
    setTimeout(() => setCopied((c) => (c === ch ? null : c)), 1200)
  }

  return (
    <ToolLayout tool={tool}>
      <input
        type="text"
        className={inputCls}
        placeholder="Search by name, e.g. 'arrow' or 'heart'…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {groups.length === 0 && <p className="py-8 text-center text-sm text-text-faint">No symbols match "{search}".</p>}

      <div className="flex flex-col gap-6">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-faint">{g.label}</p>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
              {g.chars.map(({ ch, name }) => (
                <button
                  key={ch + name}
                  type="button"
                  title={`${name} -- click to copy`}
                  onClick={() => copy(ch)}
                  className={`flex aspect-square items-center justify-center rounded-lg border text-xl transition-colors ${
                    copied === ch ? 'border-accent bg-accent-soft text-accent' : 'border-border bg-bg-sunken text-text hover:border-accent'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {copied && (
        <p className="text-center text-xs text-accent">Copied "{copied}" to clipboard</p>
      )}
    </ToolLayout>
  )
}
