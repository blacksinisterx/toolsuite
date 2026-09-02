import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { EmptyState } from '../../components/States'
import { textareaCls, labelCls } from '../../components/formStyles'
import { scanText } from '../../lib/piiScan'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'sensitive-data-scanner')!

function mask(value: string): string {
  if (value.length <= 4) return '•'.repeat(value.length)
  return value.slice(0, 2) + '•'.repeat(Math.max(3, value.length - 4)) + value.slice(-2)
}

export default function SensitiveDataScanner() {
  const [text, setText] = useState('')
  const [reveal, setReveal] = useState(false)
  const matches = useMemo(() => scanText(text), [text])

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const m of matches) map.set(m.type, (map.get(m.type) ?? 0) + 1)
    return [...map.entries()]
  }, [matches])

  return (
    <ToolLayout tool={tool}>
      <div>
        <label className={labelCls} htmlFor="in">Text to scan</label>
        <textarea
          id="in"
          className={textareaCls}
          rows={10}
          spellCheck={false}
          placeholder="Paste an email, log file, config, or any text you're about to share..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {text.trim() === '' ? (
        <EmptyState message="Paste text above to scan it for emails, phone numbers, card numbers, keys and other sensitive data — nothing leaves your browser." />
      ) : matches.length === 0 ? (
        <div className="rounded-lg border border-border bg-bg-sunken px-4 py-3 text-sm text-text-muted">No sensitive data patterns found.</div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {counts.map(([type, n]) => (
              <span key={type} className="rounded-full border border-danger/30 bg-danger-soft px-3 py-1 text-xs font-medium text-danger">{type} × {n}</span>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input type="checkbox" checked={reveal} onChange={(e) => setReveal(e.target.checked)} className="accent-accent" />
            Show full values (otherwise masked)
          </label>

          <div className="flex flex-col gap-2">
            {matches.map((m, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-sunken px-4 py-2.5">
                <span className="text-xs font-medium text-text-muted">{m.type}</span>
                <code className="select-all break-all font-mono text-sm text-text">{reveal ? m.value : mask(m.value)}</code>
              </div>
            ))}
          </div>
        </>
      )}
    </ToolLayout>
  )
}
