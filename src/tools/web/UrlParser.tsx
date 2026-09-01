import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { ErrorState } from '../../components/States'
import { inputCls, labelCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'url-parser')!

export default function UrlParser() {
  const [input, setInput] = useState('')

  const result = useMemo<{ url: URL } | { error: string } | null>(() => {
    if (!input.trim()) return null
    try {
      const url = new URL(input)
      return { url }
    } catch {
      return { error: "Not a valid, complete URL -- make sure it includes a scheme, e.g. 'https://'." }
    }
  }, [input])

  const row = (label: string, value: string) => (
    <div className="flex items-center justify-between gap-3 border-b border-border py-2 text-sm last:border-0">
      <span className="text-text-muted">{label}</span>
      <span className="max-w-[65%] truncate text-right font-mono text-xs text-text">{value || <span className="text-text-faint">(none)</span>}</span>
    </div>
  )

  return (
    <ToolLayout tool={tool}>
      <div>
        <label className={labelCls} htmlFor="in">URL</label>
        <input id="in" className={inputCls} placeholder="https://example.com/path?query=1#hash" value={input} onChange={(e) => setInput(e.target.value)} />
      </div>

      {result && 'error' in result && <ErrorState message={result.error} />}

      {result && 'url' in result && (
        <div className="rounded-lg border border-border bg-bg-sunken px-4">
          {row('Protocol', result.url.protocol)}
          {row('Host', result.url.host)}
          {row('Hostname', result.url.hostname)}
          {row('Port', result.url.port)}
          {row('Pathname', result.url.pathname)}
          {row('Search', result.url.search)}
          {row('Hash', result.url.hash)}
          {[...result.url.searchParams.entries()].map(([k, v]) => row(`param: ${k}`, v))}
        </div>
      )}
    </ToolLayout>
  )
}
